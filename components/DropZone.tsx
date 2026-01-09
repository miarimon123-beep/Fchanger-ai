import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, FileUp, Layers } from 'lucide-react';

interface DropZoneProps {
  onFilesSelect: (files: File[]) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ onFilesSelect }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const processFiles = (fileList: FileList) => {
    const filesArray = Array.from(fileList).filter(file => file.type.startsWith('image/'));
    
    if (filesArray.length === 0) {
      alert('Please select valid image files.');
      return;
    }

    if (filesArray.length > 5) {
      alert('You can only upload up to 5 images at a time.');
      onFilesSelect(filesArray.slice(0, 5));
    } else {
      onFilesSelect(filesArray);
    }
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        w-full h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300
        ${isDragOver 
          ? 'border-brand-500 bg-brand-500/10 scale-[1.02]' 
          : 'border-slate-700 bg-slate-900/50 hover:border-brand-500/50 hover:bg-slate-800/50'
        }
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="image/*"
        multiple
        className="hidden"
      />
      
      <div className={`p-4 rounded-full mb-4 ${isDragOver ? 'bg-brand-500 text-white' : 'bg-slate-800 text-brand-500'}`}>
        {isDragOver ? <FileUp size={32} /> : <Layers size={32} />}
      </div>
      
      <h3 className="text-xl font-semibold mb-2 text-slate-200">
        {isDragOver ? 'Drop images here' : 'Click or Drag images here'}
      </h3>
      <p className="text-slate-500 text-sm mb-1">
        Select up to 5 images at once
      </p>
      <p className="text-slate-600 text-xs">
        Supports JPG, PNG, WEBP, AVIF, GIF, BMP
      </p>
    </div>
  );
};

export default DropZone;