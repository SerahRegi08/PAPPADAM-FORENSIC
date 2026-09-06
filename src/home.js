import React, { useRef, useState } from 'react'
import './home.css'

function Home({ onAnalyze, onBack }) {
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const [uploadedImage, setUploadedImage] = useState(null)

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="home">
      <div className="caution-top"></div>

      <div className="home-content">

        <div className="home-header">
          <button className="back-btn" onClick={onBack}>← BACK</button>
          <div className="badge">
            <span className="badge-icon">🔍</span>
            <span className="badge-text">CLASSIFIED</span>
          </div>
        </div>

        <h1 className="title">
          PAPPADAM <br/> FORENSIC
        </h1>

        <p className="tagline">
          Analyzing Pappadam Crimes Since 2024
        </p>

        {/* INSTRUCTIONS */}
        <div className="instructions-box">
          <div className="instructions-header">
            <span className="doc-icon">📋</span>
            <span>EVIDENCE COLLECTION PROTOCOL</span>
          </div>

          <div className="instruction-item">
            <span className="step-num">01</span>
            <div className="step-content">
              <strong>Photo must be CLEAR</strong>
              <p>Ensure proper lighting, no blur. The pappadam should be the main focus of the image.</p>
            </div>
          </div>

          <div className="instruction-item">
            <span className="step-num">02</span>
            <div className="step-content">
              <strong>Capture from ALL ANGLES</strong>
              <p>Take photos from top, bottom, and both sides for complete forensic analysis.</p>
            </div>
          </div>

          <div className="instruction-item">
            <span className="step-num">03</span>
            <div className="step-content">
              <strong>Use a PLAIN BACKGROUND</strong>
              <p>Place pappadam on a white or contrasting surface for accurate edge detection.</p>
            </div>
          </div>

          <div className="instruction-item">
            <span className="step-num">04</span>
            <div className="step-content">
              <strong>Include a SCALE reference</strong>
              <p>Place a coin or ruler nearby to help calculate actual size and damage area.</p>
            </div>
          </div>
        </div>

        {/* IMAGE PREVIEW */}
        {uploadedImage && (
          <div className="preview-box">
            <div className="preview-label">EVIDENCE CAPTURED</div>
            <img src={uploadedImage} alt="Pappadam Evidence" className="preview-image" />
            <button className="analyze-btn" onClick={() => onAnalyze(uploadedImage)}>
              🔬 ANALYZE EVIDENCE
            </button>
          </div>
        )}

        {/* UPLOAD OPTIONS */}
        {!uploadedImage && (
          <div className="upload-options">
            <button className="upload-btn" onClick={() => fileInputRef.current.click()}>
              <span className="upload-icon">📁</span>
              <span>UPLOAD IMAGE</span>
              <span className="upload-hint">Browse your files</span>
            </button>

            <button className="camera-btn" onClick={() => cameraInputRef.current.click()}>
              <span className="upload-icon">📷</span>
              <span>TAKE PHOTO</span>
              <span className="upload-hint">Open camera</span>
            </button>
          </div>
        )}

        {/* HIDDEN FILE INPUTS */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        <input
          type="file"
          ref={cameraInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleCameraCapture}
          style={{ display: 'none' }}
        />

        <div className="footer-warn">
          ⚠️ EVIDENCE UPLOAD AREA ⚠️
        </div>

      </div>

      <div className="caution-bottom"></div>
    </div>
  )
}

export default Home
