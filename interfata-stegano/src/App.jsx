import { useState } from 'react'
import './App.css'

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
   
  const [secretMessage, setSecretMessage] = useState("");
  const [password, setPassword] = useState("");
  
  const [aiResponse, setAiResponse] = useState("AI Advice: System waiting...");
  const [isEncryptionAllowed, setIsEncryptionAllowed] = useState(false);

  const [logs, setLogs] = useState([]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setSecretMessage("");
      setPassword("");
      setIsEncryptionAllowed(false);
      setAiResponse("AI Advice: New image detected. Please request analysis.");
    }
  };

  const fetchLogs = async () => {
    try {
        const response = await fetch("http://127.0.0.1:8080/api/logs");
        if(response.ok) {
            const data = await response.json();
            setLogs(data.reverse());
        }
    } catch (error) {
        console.error(error);
    }
  };

  const handleAskAI = async () => {
    if (!selectedImage) {
        setAiResponse("ERROR: Please upload an image first!");
        return;
    }
     
    setAiResponse("AI is analyzing file integrity...");
     
    const isPng = selectedImage.type === "image/png";
    const sizeKB = parseFloat((selectedImage.size / 1024).toFixed(2));
     
    const formData = new FormData();
    formData.append("question", `I have an image of type ${selectedImage.type} and size ${sizeKB} KB. Is it good for LSB steganography?`);

    try {
        const response = await fetch("http://127.0.0.1:8080/api/chat", {
            method: "POST",
            body: formData
        });
        const text = await response.text();
        
        fetchLogs();

        if (isPng && sizeKB > 40) {
            setIsEncryptionAllowed(true);
            setAiResponse(text + " \nCONCLUSION: Source is valid (>40KB). Encryption unlocked.");
        } else if (isPng && sizeKB <= 40) {
            setIsEncryptionAllowed(false);
            setAiResponse(text + " \nCONCLUSION: Image too small (" + sizeKB + " KB). Too risky for hiding data. Locked.");
        } else {
            setIsEncryptionAllowed(false);
            setAiResponse(text + " \nCONCLUSION: Unsafe source format (JPG). Encryption locked.");
        }

    } catch (error) {
        setAiResponse("ERROR: Cannot contact AI. Check Java server.");
    }
  };

  const handleEncode = async () => {
    if (!selectedImage) {
        setAiResponse("ERROR: Missing source image.");
        return;
    }
    if (!secretMessage) {
        setAiResponse("ERROR: You did not enter a secret message.");
        return;
    }

    setAiResponse("ENCRYPTION IN PROGRESS: Injecting bits into image... Please wait.");

    const formData = new FormData();
    formData.append("image", selectedImage);
    formData.append("message", secretMessage);
    formData.append("password", password);

    try {
        const response = await fetch("http://127.0.0.1:8080/api/encode", {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "secret_image.png";
            document.body.appendChild(a);
            a.click();
            a.remove();
             
            setAiResponse("SUCCESS: Secured image downloaded to your computer.");
            fetchLogs();
        } else {
            setAiResponse("SERVER ERROR: Encryption failed. Try another image.");
        }
    } catch (error) {
        setAiResponse("CONNECTION ERROR: Server not responding. Check firewall or Java.");
    }
  };


  const handleDecode = async () => {
    if (!selectedImage) {
        setAiResponse("ERROR: Upload the image containing the secret (the downloaded one)!");
        return;
    }

    setAiResponse("DECRYPTION IN PROGRESS: Scanning pixels for hidden data...");
    setSecretMessage(""); 

    const formData = new FormData();
    formData.append("image", selectedImage);
    formData.append("password", password);

    try {
        const response = await fetch("http://127.0.0.1:8080/api/decode", {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            const text = await response.text();
             
            if (text.includes("No hidden message found") || text.includes("Nu s-a găsit")) {
                 setAiResponse("RESULT: No secret message found in this image. Are you sure it is the right one?");
            } else {
                 setSecretMessage(text); 
                 setAiResponse("SUCCESS: Secret message detected and extracted successfully!");
                 fetchLogs();
            }
        } else {
            setAiResponse("SERVER ERROR: Could not decode image.");
        }
    } catch (error) {
        setAiResponse("CONNECTION ERROR: Java server not responding.");
    }
  };

  return (
    <div className="container">
      <header>
        <h1 data-text="Digital Steganography">Digital Steganography</h1>
      </header>

      <div className="main-content">
         
        <div className="card left-panel">
          <h3>1. Source Image</h3>
          <input type="file" onChange={handleImageChange} className="file-input" />
          <div className="image-preview-box">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="preview-img" />
            ) : (
              <p>Select an image...</p>
            )}
          </div>
        </div>

        <div className="card right-panel">
          <h3>2. Processing & AI</h3>
           
          <textarea 
            placeholder="Write secret message here..." 
            value={secretMessage}
            onChange={(e) => setSecretMessage(e.target.value)}
            rows="4"
          ></textarea>

          <input 
            type="password" 
            placeholder="AES Password (Optional)" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
                width: '100%',
                padding: '10px',
                margin: '10px 0',
                borderRadius: '5px',
                border: '1px solid #444',
                backgroundColor: '#222',
                color: '#0f0',
                fontFamily: 'monospace'
            }}
          />

          <div className="ai-bubble">
             {aiResponse}
          </div>

          <button onClick={handleAskAI} className="btn btn-ai">ASK AI ADVICE</button>
           
          <div style={{marginTop: '20px'}}></div>
           
          <button 
            onClick={handleEncode} 
            disabled={!isEncryptionAllowed} 
            className="btn btn-encode"
            title={!isEncryptionAllowed ? "Ask AI to unlock!" : "Ready to encrypt"}
          >
            {!isEncryptionAllowed ? "LOCKED BY AI" : "HIDE MESSAGE"}
          </button>
           
          <button onClick={handleDecode} className="btn btn-decode">
              EXTRACT MESSAGE
          </button>
        </div>

        <div className="card" style={{gridColumn: "1 / -1", marginTop: "20px", maxHeight: "400px", overflowY: "auto"}}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px"}}>
                <h3>Security Audit Logs </h3>
                <button onClick={fetchLogs} style={{background: "#444", padding: "8px 15px", fontSize: "0.8rem", cursor: "pointer"}}>
                    Refresh Data
                </button>
            </div>
            
            {logs.length === 0 ? (
                <div style={{textAlign: "center", padding: "20px", color: "#666"}}>
                    <p>No records found in database. Perform an action (AI, Encode, Decode) to see logs here.</p>
                </div>
            ) : (
                <table style={{width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", color: "#ddd"}}>
                    <thead>
                        <tr style={{background: "#333", textAlign: "left"}}>
                            <th style={{padding: "10px"}}>ID</th>
                            <th>Time</th>
                            <th>Action</th>
                            <th>File Name</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id} style={{borderBottom: "1px solid #444"}}>
                                <td style={{padding: "10px", color: "#888"}}>#{log.id}</td>
                                <td>{log.timestamp}</td>
                                <td style={{fontWeight: "bold", color: log.actionType === "ENCODE" ? "#4caf50" : (log.actionType === "DECODE" ? "#2196f3" : "#ff9800")}}>
                                    {log.actionType}
                                </td>
                                <td>{log.fileName}</td>
                                <td>
                                    <span style={{
                                        padding: "2px 8px", 
                                        borderRadius: "4px", 
                                        background: log.status.includes("SUCCESS") || log.status.includes("APPROVED") ? "rgba(76, 175, 80, 0.2)" : "rgba(244, 67, 54, 0.2)",
                                        color: log.status.includes("SUCCESS") || log.status.includes("APPROVED") ? "#4caf50" : "#f44336"
                                    }}>
                                        {log.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>

      </div>
    </div>
  )
}

export default App