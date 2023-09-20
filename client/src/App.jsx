import { useState } from 'react'
import './App.css'
import uploadImageToFirebase from './upload';
import { doc, onSnapshot } from "firebase/firestore";
import { db, storage } from './config';
import { getDownloadURL, getStorage, ref } from "firebase/storage";


function App() {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [convesionProgress, setConversionProgress] = useState(0);
  const [finished, setFinished] = useState(false);
  const [data, setData] = useState(null);

  const handleFileChange = (e) => {
    console.log(e.target.files);
    setSelectedFiles(e.target.files);
  }; 

  const handleUpload = async () => {
    const data = await uploadImageToFirebase(selectedFiles[0], setUploadProgress);
    setData(data);
    const docRef = doc(db, "files", data.uuid);
  
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      const data = snapshot.data();
      if (data?.progress !== undefined) {
        setConversionProgress(data.progress);
      }
      if (data?.converted === true) {
        setFinished(true);
        unsubscribe();
      }
    });
  
    // Call unsubscribe when you no longer need to listen to changes
  }
  

  const handleDownload = async () => {
    try {
      const storage = getStorage();
      const pathReference = ref(storage, `${data.uuid}/${data.convertedName}`);

      getDownloadURL(pathReference)
        .then((url) => {
          window.open(url, '_blank');
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.error("Download failed:", error);
    }
  }
  



  return (
    <>
      <div className="App">
        <input type='file' id='video' onChange={handleFileChange} accept="video/*"/>
        {uploadProgress > 0 && uploadProgress < 100 && <progress value={uploadProgress} max="100" />}
        {selectedFiles && <button onClick={handleUpload}>Upload</button>}
        <div>
          {convesionProgress > 0 && convesionProgress < 100 && 
            <>
            <progress value={convesionProgress} max="100" />
            <p>Converting...</p>
            </>
          }
          {finished && <button onClick={handleDownload}>Dowload</button>}
        </div>
      </div>

    </>
  )
}

export default App
