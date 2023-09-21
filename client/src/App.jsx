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
      .then(url => {
        const a = document.createElement('a');
        a.href = url;
        a.download = data.convertedName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      })
      .catch(error => console.log(error));
  }
  
  
  return (
    <div className="App">
      <div className="file-input-wrapper">
        {selectedFiles && <p className="file-name">{selectedFiles[0].name}</p> }
        <label htmlFor="video" className="file-input-label">Select Video</label>
        <input type="file" id="video" onChange={handleFileChange} accept="video/*" className="file-input"/>
      </div>
      {uploadProgress > 0 && uploadProgress < 100 && 
        <div className="progress-wrapper">
          <progress value={uploadProgress} max="100" className="progress-bar"/>
        </div>
      }
      {selectedFiles && <button onClick={handleUpload} className="upload-button">Upload</button>}
      <div className="conversion-section">
        {conversionProgress > 0 && conversionProgress < 100 && 
          <div className="progress-wrapper">
            <progress value={conversionProgress} max="100" className="progress-bar"/>
            <p className="conversion-text">Converting...</p>
          </div>
        }
        {finished && <button onClick={handleDownload} className="download-button">Download</button>}
      </div>
    </div>
  )
}

export default App
