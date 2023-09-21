import { useState } from 'react'
import uploadImageToFirebase from './upload';
import { doc, onSnapshot } from "firebase/firestore";
import { db } from './config';
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import './App.css'


function App() {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [finished, setFinished] = useState(false);
  const [data, setData] = useState(null);

  const handleFileChange = e => setSelectedFiles(e.target.files);

  const handleUpload = async () => {
    const data = await uploadImageToFirebase(selectedFiles[0], setUploadProgress);
    setData(data);
    const docRef = doc(db, "files", data.uuid);
    setConversionProgress(1);
  
  
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      const data = snapshot.data();
      if (data?.progress !== undefined) {
        setConversionProgress(data.progress);
      }
      if (data?.converted === true) {
        setFinished(true);
        setConversionProgress(100);
        unsubscribe();
      }
    });
  }
  
  const handleDownload = async () => {
    const storage = getStorage();
    const pathReference = ref(storage, `${data.uuid}/${data.convertedName}`);
    getDownloadURL(pathReference)
      .then(url => window.open(url, '_blank'))
      .catch(error => console.log(error));
  }
  
  return (
    <>
      <div className="App">
        <input type='file' id='video' onChange={handleFileChange} accept="video/*"/>
        {uploadProgress > 0 && uploadProgress < 100 && <progress value={uploadProgress} max="100" />}
        {selectedFiles && <button onClick={handleUpload}>Upload</button>}
        <div>
          {conversionProgress > 0 && conversionProgress < 100 && 
            <>
            <progress value={conversionProgress} max="100" />
            <br/>
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
