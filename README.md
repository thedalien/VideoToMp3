# Project Overview: Working with FFmpeg

This project is a learning exercise focused on working with FFmpeg, a powerful tool used for handling multimedia data. The project involves the creation of a web application that allows users to upload video files and transcode them into MP3 format.

## Backend

The backend of the application is built with Firebase Functions. When a video file is uploaded to Firebase Storage, a function is triggered to transcode the video into MP3 format. This is done using the FFmpeg library. The resulting MP3 file is then uploaded to Firebase Storage. And Firestore is used to communicate the progress of the transcoding operation to the frontend.

[Backend Code](firebase/functions/index.js)

## Frontend

The frontend of the application is built with React. It provides an interface for users to upload video files. The frontend also displays the progress of the transcoding operation and allows users to download the resulting MP3 file.

[Frontend Code](client/src/App.jsx)
[Function that handles upload](client/src/upload.js)

## Diagram

![Diagram](https://firebasestorage.googleapis.com/v0/b/mp4-to-mp3-3b274.appspot.com/o/Screenshot%202023-09-21%20at%202.43.26.png?alt=media&token=7f6c1b16-98ce-49a1-8957-f0fa8852d9a6)