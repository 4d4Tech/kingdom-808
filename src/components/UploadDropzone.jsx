import React, { useState, useRef } from 'react';
import { useToast } from '../context/ToastContext';

const UploadDropzone = ({ onFileSelect }) => {
  const { showToast } = useToast();
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const validateAndSelect = (file) => {
    if (!file) return;
    const validExtensions = ['.mp3', '.wav', '.flac', '.m4a'];
    const fileNameLower = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileNameLower.endsWith(ext)) || file.type.startsWith('audio/');
    
    if (isValid) {
      onFileSelect(file);
    } else {
      showToast("Invalid audio format. Please upload .mp3, .wav, .flac, or .m4a.", "warning");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSelect(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`upload-dropzone ${isDragActive ? 'drag-active' : ''}`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current.click()}
    >
      <input 
        ref={fileInputRef}
        type="file" 
        className="hidden-file-input" 
        accept="audio/*,.mp3,.wav,.flac,.m4a"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      
      <div className="dropzone-content">
        <div className="upload-icon-wrapper">
          <span className="material-symbols-outlined upload-cloud-icon">cloud_upload</span>
        </div>
        <h3>Drag & Drop your audio file</h3>
        <p className="text-outline text-sm mb-4">or click to browse from your computer</p>
        <span className="badge outline text-xs">Supports MP3, WAV, FLAC, M4A</span>
      </div>
    </div>
  );
};

export default UploadDropzone;
