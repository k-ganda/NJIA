import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './EvidenceUploadPage.css'

function EvidenceUploadPage() {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const [files, setFiles] = useState([])
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setFiles(prev => [...prev, ...selectedFiles])
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      alert('Please select at least one file to upload.')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })
      formData.append('case_id', caseId)

      const response = await axios.post(
        `http://localhost:8000/api/evidence/upload?case_id=${caseId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      setUploadedFiles(response.data.uploaded_files)
      setFiles([])
      alert('Evidence pictures uploaded successfully!')
    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Error uploading files. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="evidence-upload-page">
      <div className="evidence-upload-container">
        <div className="evidence-header">
          <button className="go-back-button" onClick={() => navigate(-1)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Go Back
          </button>
          <h1 className="evidence-title">Evidence Upload - {caseId}</h1>
        </div>

        <div className="upload-section">
          <div className="upload-area">
            <input
              type="file"
              id="file-input"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="file-input"
            />
            <label htmlFor="file-input" className="upload-label">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" />
                <polyline points="17 8 12 3 7 8" strokeWidth="2" />
                <line x1="12" y1="3" x2="12" y2="15" strokeWidth="2" />
              </svg>
              <p>Click to select evidence pictures</p>
              <p className="upload-hint">or drag and drop files here</p>
            </label>
          </div>

          {files.length > 0 && (
            <div className="files-list">
              <h3 className="files-title">Selected Files:</h3>
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <button
                    className="remove-file-button"
                    onClick={() => removeFile(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                className="upload-button"
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload Evidence Pictures'}
              </button>
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div className="uploaded-files">
              <h3 className="files-title">Uploaded Files:</h3>
              {uploadedFiles.map((fileName, index) => (
                <div key={index} className="file-item uploaded">
                  <span className="file-name">✓ {fileName}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="navigation-buttons">
          <button className="dashboard-button" onClick={() => navigate('/')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Dashboard
          </button>
          <button
            className="proceed-button"
            onClick={() => navigate(`/p3-report/${caseId}`)}
          >
            View P3 Report
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default EvidenceUploadPage
