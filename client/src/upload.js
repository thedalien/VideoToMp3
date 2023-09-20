import { ref, uploadBytesResumable, getStorage } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import { storage } from "./config";


const uploadImageToFirebase = async (selectedFile, setUploadProgress) => {
    if (!selectedFile) {
        alert("Please select a file first.");
        return;
    }
    const uuid = uuidv4();
    
    const path = uuid + "/" + selectedFile.name;
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile, {
        contentType: selectedFile.type,
    });

    await new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            }, 
            (error) => {
                console.error(error);
                reject(error);
            }, 
            () => {
                resolve();
            }
        );
    });

    const data = {
        name: selectedFile.name,
        uuid: uuid,
        convertedName: "converted_" + selectedFile.name.replace(/\.[^/.]+$/, ""),
        path: path,
    }

    return data;
};

export default uploadImageToFirebase;
