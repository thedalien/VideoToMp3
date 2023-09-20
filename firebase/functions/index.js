const {onObjectFinalized} = require("firebase-functions/v2/storage");
const {initializeApp} = require("firebase-admin/app");
const {getStorage} = require("firebase-admin/storage");
const logger = require("firebase-functions/logger");
const path = require("path");
const os = require("os");
const fs = require('fs');


const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require("fluent-ffmpeg");

initializeApp();

exports.toMp3 = onObjectFinalized({region: "europe-west1"}, async (event) => {
  const fileBucket = event.data.bucket;
  const filePath = event.data.name;
  const contentType = event.data.contentType;
  logger.log("File detected: " + filePath);

  if (!contentType.startsWith("video/")) {
    return logger.log("This is not a video.");
  }

  const fileFolder = path.dirname(filePath);
  logger.log("File folder: " + fileFolder);

  const fileName = path.basename(filePath);
  logger.log("File detected: " + fileName);
  if (fileName.startsWith("converted_")) {
    return logger.log("Already converted.");
  }

  const bucket = getStorage().bucket(fileBucket);
  const downloadResponse = await bucket.file(filePath).download();
  const videoBuffer = downloadResponse[0];
  logger.log("Video downloaded!");

  let tmpFilePath = path.join(os.tmpdir(), fileName);
  logger.log("Tmp file path: " + tmpFilePath);
  fs.writeFileSync(tmpFilePath, videoBuffer);

  const convertedFileName = "converted_" + fileName.replace(/\.[^/.]+$/, "");
  let tmpOutputPath = path.join(os.tmpdir(), convertedFileName);


  await new Promise((resolve, reject) => {
    ffmpeg(tmpFilePath)
      .setFfmpegPath(ffmpegPath)
      .toFormat("mp3")
      .save(tmpOutputPath)
      .on("error", (err) => {
        logger.error(err.message);
        reject(err);
      })
      .on("end", () => {
        logger.log("Conversion finished!");
        resolve();
      });
  });
  
  const metadata = {contentType: "audio/mp3"};
  await bucket.upload(tmpOutputPath, {
    destination: path.join(fileFolder, convertedFileName),
    metadata: metadata,
  });
  
  
  return logger.log("MP3 uploaded!");

});
