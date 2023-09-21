const {onObjectFinalized} = require("firebase-functions/v2/storage");
const {initializeApp} = require("firebase-admin/app");
const {getStorage} = require("firebase-admin/storage");
const {getFirestore} = require('firebase-admin/firestore');
const logger = require("firebase-functions/logger");
const path = require("path");
const os = require("os");
const fs = require('fs');


const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require("fluent-ffmpeg");

initializeApp();

exports.toMp3 = onObjectFinalized({region: "europe-west1"}, async (event) => {
  const db = getFirestore();
  const fileBucket = event.data.bucket;
  const filePath = event.data.name;
  const contentType = event.data.contentType;
  logger.log("File detected: " + filePath);
  
  if (!contentType.startsWith("video/")) {
    return logger.log("This is not a video.");
  }
  
  const fileFolder = path.dirname(filePath);
  const docRef = db.collection("files").doc(fileFolder);
  await docRef.set({name: event.data.name});

  const fileName = path.basename(filePath);

  const bucket = getStorage().bucket(fileBucket);
  const downloadResponse = await bucket.file(filePath).download();
  const videoBuffer = downloadResponse[0];
  logger.log("Video downloaded!");
  await docRef.update({size: videoBuffer.length});

  let tmpFilePath = path.join(os.tmpdir(), fileName);
  fs.writeFileSync(tmpFilePath, videoBuffer);

  const convertedFileName = "converted_" + fileName.replace(/\.[^/.]+$/, "");
  let tmpOutputPath = path.join(os.tmpdir(), convertedFileName);


  await new Promise((resolve, reject) => {
    ffmpeg(tmpFilePath)
      .setFfmpegPath(ffmpegPath)
      .toFormat("mp3")
      .save(tmpOutputPath)
      .on("progress", async (progress) => {
        if (progress.percent) {
          logger.log("Progress: " + progress.percent + "%");
          await docRef.update({progress: progress.percent});
        }
      })
      .on("error", (err) => {
        logger.error(err.message);
        reject(err);
      })
      .on("end", async () => {
        logger.log("Conversion finished!");
        await docRef.update({progress: 100});
        resolve();
      });
  });
  
  const metadata = {contentType: "audio/mp3"};
  await bucket.upload(tmpOutputPath, {
    destination: path.join(fileFolder, convertedFileName),
    metadata: metadata,
  });
  
  await docRef.update({converted: true});
  return logger.log("MP3 uploaded!");

});
