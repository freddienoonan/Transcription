
import React, { useState, useRef } from 'react';
import { UploadIcon } from './Icons';

interface FileUploaderProps {
  onFileChange: (file: File | null) => void;
  onTranscribe: () => void;
  isProcessing: boolean;
  disabled: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileChange, onTranscribe, isProcessing, disabled }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileChange(file);
    } else {
      setFileName(null);
      onFileChange(null);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
      <div className="flex-grow w-full">
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
          ref={fileInputRef}
        />
        <button
          onClick={handleButtonClick}
          className="w-full flex items-center justify-center space-x-2 border-2 border-dashed border-gray-600 hover:border-purple-500 bg-gray-700/50 hover:bg-gray-700 text-gray-300 font-semibold py-3 px-4 rounded-lg transition-colors duration-300"
        >
          <UploadIcon />
          <span>{fileName || 'Select an audio file'}</span>
        </button>
      </div>
      <button
        onClick={onTranscribe}
        disabled={disabled}
        className="w-full sm:w-auto shrink-0 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none"
      >
        {isProcessing ? 'Processing...' : 'Transcribe'}
      </button>
    </div>
  );
};

export default FileUploader;
