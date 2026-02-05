import React, { useCallback, useState } from 'react';
import { Upload, Camera, AlertCircle } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (file: File, imageUrl: string) => void;
  isProcessing: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      onImageSelect(file, imageUrl);
    }
  }, [onImageSelect]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      onImageSelect(file, imageUrl);
    }
  }, [onImageSelect]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Upload Zone */}
      <div
        className={`upload-zone ${isDragging ? 'active' : ''} ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isProcessing}
        />
        
        <div className="flex flex-col items-center space-y-3 sm:space-y-4 py-4 sm:py-0">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-accent/10 flex items-center justify-center">
            <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
          </div>
          
          <div>
            <p className="text-base sm:text-lg font-semibold text-foreground text-center">
              {isProcessing ? 'Processing...' : 'Drop your posture image here'}
            </p>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              or tap to take a photo / browse
            </p>
          </div>
          
          <button className="btn-clinical mt-2 sm:mt-4 text-sm sm:text-base px-4 sm:px-6 py-2.5 sm:py-3" disabled={isProcessing}>
            <Camera className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Select Image
          </button>
        </div>
      </div>

      {/* Guidelines */}
      <div className="clinical-card p-4 sm:p-5">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Image Guidelines</h3>
            <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 sm:space-y-1.5">
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mr-2 mt-1.5 flex-shrink-0"></span>
                Side view (lateral) standing posture only
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mr-2 mt-1.5 flex-shrink-0"></span>
                Full body visible from head to feet
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mr-2 mt-1.5 flex-shrink-0"></span>
                Neutral, plain background preferred
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mr-2 mt-1.5 flex-shrink-0"></span>
                Wear fitted clothing for accurate detection
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mr-2 mt-1.5 flex-shrink-0"></span>
                Stand naturally in relaxed posture
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
