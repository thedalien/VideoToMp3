import { ref, uploadBytesResumable } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import { storage } from "./config";

const uploadImageToFirebase = async (selectedFile, setUploadProgress) => {
  if (!selectedFile) return alert("Please select a file first.");

  const uuid = uuidv4();
  const path = `${uuid}/${selectedFile.name}`;
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, selectedFile, { contentType: selectedFile.type });

  await new Promise((resolve, reject) => {
    uploadTask.on('state_changed',
      snapshot => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
      reject,
      resolve
    );
  });

  return {
    name: selectedFile.name,
    uuid,
    convertedName: `converted_${selectedFile.name.replace(/\.[^/.]+$/, "")}`,
    path
  };
};

export default uploadImageToFirebase;
