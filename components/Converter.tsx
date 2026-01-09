import React, { useState, useEffect } from 'react';
import { ArrowRight, Download, Wand2, RefreshCw, CheckCircle, FileImage, Sparkles, Trash2, Settings2 } from 'lucide-react';
import { ImageFormat, AIAnalysisResult } from '../types';
import { convertImageFile, formatFileSize, getExtensionFromMime, fileToDataURL } from '../utils/imageUtils';
import { analyzeImageForMetadata } from '../services/geminiService';

interface ConverterProps {
  files: File[];
  onReset: () => void;
}

interface FileStatus {
  id: string; // url
  file: File;
  status: 'idle' | 'converting' | 'success' | 'error';
  convertedBlob: Blob | null;
  aiData: AIAnalysisResult | null;
  isAnalyzing: boolean;
  useSmartName: boolean;
}

const Converter: React.FC<ConverterProps> = ({ files, onReset }) => {
  const [targetFormat, setTargetFormat] = useState<ImageFormat>(ImageFormat.PNG);
  const [items, setItems] = useState<FileStatus[]>([]);
  const [globalConverting, setGlobalConverting] = useState(false);

  // Initialize items
  useEffect(() => {
    const newItems = files.map(file => ({
      id: URL.createObjectURL(file),
      file,
      status: 'idle' as const,
      convertedBlob: null,
      aiData: null,
      isAnalyzing: false,
      useSmartName: false
    }));
    setItems(newItems);

    return () => {
      newItems.forEach(item => URL.revokeObjectURL(item.id));
    };
  }, [files]);

  const handleAnalyze = async (index: number) => {
    const item = items[index];
    if (item.isAnalyzing || item.aiData) return;

    const newItems = [...items];
    newItems[index] = { ...item, isAnalyzing: true };
    setItems(newItems);

    try {
      const base64Data = await fileToDataURL(item.file);
      const base64String = base64Data.split(',')[1];
      const result = await analyzeImageForMetadata(base64String, item.file.type);
      
      setItems(prev => {
        const updated = [...prev];
        updated[index] = { 
          ...updated[index], 
          isAnalyzing: false, 
          aiData: result,
          useSmartName: true
        };
        return updated;
      });
    } catch (err) {
      console.error(err);
      setItems(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], isAnalyzing: false };
        return updated;
      });
      alert('Failed to analyze image.');
    }
  };

  const handleConvertAll = async () => {
    setGlobalConverting(true);
    
    // Process all items that are not already done
    const promises = items.map(async (item, index) => {
      if (item.status === 'success') return; // Skip already converted

      setItems(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], status: 'converting' };
        return updated;
      });

      try {
        const blob = await convertImageFile(item.file, targetFormat, 1.0);
        setItems(prev => {
          const updated = [...prev];
          updated[index] = { ...updated[index], status: 'success', convertedBlob: blob };
          return updated;
        });
      } catch (error) {
        console.error(error);
        setItems(prev => {
          const updated = [...prev];
          updated[index] = { ...updated[index], status: 'error' };
          return updated;
        });
      }
    });

    await Promise.all(promises);
    setGlobalConverting(false);
  };

  const handleDownload = (index: number) => {
    const item = items[index];
    if (!item.convertedBlob) return;
    
    const url = URL.createObjectURL(item.convertedBlob);
    const a = document.createElement('a');
    
    let filename = item.file.name.split('.')[0];
    if (item.aiData && item.useSmartName) {
      filename = item.aiData.suggestedFilename;
    }
    
    const ext = getExtensionFromMime(targetFormat);
    a.href = url;
    a.download = `${filename}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleSmartName = (index: number) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], useSmartName: !updated[index].useSmartName };
      return updated;
    });
  };

  return (
    <div className="w-full max-w-5xl space-y-6">
      
      {/* Control Panel */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="bg-slate-800 p-3 rounded-xl text-brand-500">
               <Settings2 size={24} />
             </div>
             <div>
               <h2 className="text-lg font-bold text-white">Batch Settings</h2>
               <p className="text-slate-400 text-sm">Convert {items.length} images</p>
             </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
             <div className="flex items-center gap-2 bg-slate-800 rounded-xl p-1.5 w-full md:w-auto overflow-x-auto">
                {[
                  { label: 'JPG', value: ImageFormat.JPEG },
                  { label: 'PNG', value: ImageFormat.PNG },
                  { label: 'WEBP', value: ImageFormat.WEBP },
                  { label: 'AVIF', value: ImageFormat.AVIF },
                  { label: 'GIF', value: ImageFormat.GIF },
                  { label: 'BMP', value: ImageFormat.BMP },
                ].map((fmt) => (
                  <button
                    key={fmt.value}
                    onClick={() => setTargetFormat(fmt.value)}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                      ${targetFormat === fmt.value 
                        ? 'bg-brand-500 text-white shadow-lg' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                      }
                    `}
                  >
                    {fmt.label}
                  </button>
                ))}
             </div>

             <button
                onClick={handleConvertAll}
                disabled={globalConverting}
                className={`
                  w-full md:w-auto px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                  ${globalConverting 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-white text-slate-900 hover:bg-slate-100 shadow-lg shadow-white/10'
                  }
                `}
              >
                {globalConverting ? (
                  <RefreshCw className="animate-spin" size={20} />
                ) : (
                  <RefreshCw size={20} />
                )}
                {globalConverting ? 'Converting...' : 'Convert All'}
              </button>
          </div>
        </div>
      </div>

      {/* List of Files */}
      <div className="grid gap-4">
        {items.map((item, index) => (
          <div key={index} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{animationDelay: `${index * 100}ms`}}>
            
            {/* Thumbnail */}
            <div className="w-full md:w-24 h-24 bg-slate-950 rounded-lg flex-shrink-0 border border-slate-800 p-2 flex items-center justify-center">
              <img src={item.id} alt="Thumbnail" className="max-w-full max-h-full object-contain rounded" />
            </div>

            {/* Info */}
            <div className="flex-1 w-full text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                <h3 className="font-medium text-white truncate max-w-[250px] mx-auto md:mx-0">
                  {item.useSmartName && item.aiData ? item.aiData.suggestedFilename : item.file.name}
                </h3>
                {item.aiData && (
                  <span className="text-[10px] uppercase tracking-wider bg-brand-500/20 text-brand-500 px-2 py-0.5 rounded-full font-bold w-fit mx-auto md:mx-0">
                    AI Renamed
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-2">{formatFileSize(item.file.size)} • {item.file.type}</p>
              
              {/* AI Button */}
              {!item.aiData && !item.isAnalyzing && item.status !== 'success' && (
                <button 
                  onClick={() => handleAnalyze(index)}
                  className="text-xs flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors mx-auto md:mx-0"
                >
                  <Sparkles size={12} /> Auto-generate name
                </button>
              )}
              {item.isAnalyzing && (
                <span className="text-xs text-indigo-400 flex items-center gap-1.5 justify-center md:justify-start">
                   <Wand2 size={12} className="animate-spin" /> Analyzing...
                </span>
              )}
              {item.aiData && item.status !== 'success' && (
                 <button 
                  onClick={() => toggleSmartName(index)}
                  className="text-xs text-slate-500 hover:text-white underline decoration-slate-700 underline-offset-2 mx-auto md:mx-0"
                 >
                   {item.useSmartName ? "Revert to original name" : "Use AI name"}
                 </button>
              )}
            </div>

            {/* Status & Actions */}
            <div className="w-full md:w-auto flex flex-col items-center gap-2 min-w-[140px]">
               {item.status === 'idle' && (
                 <span className="text-sm text-slate-500 bg-slate-800 px-3 py-1 rounded-full">Pending</span>
               )}
               {item.status === 'converting' && (
                 <span className="text-sm text-brand-500 flex items-center gap-2 bg-brand-500/10 px-3 py-1 rounded-full">
                   <RefreshCw size={14} className="animate-spin" /> Processing
                 </span>
               )}
               {item.status === 'success' && (
                 <button
                   onClick={() => handleDownload(index)}
                   className="w-full bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 transition-all"
                 >
                   <Download size={16} /> Download
                 </button>
               )}
               {item.status === 'error' && (
                 <span className="text-sm text-red-500 bg-red-500/10 px-3 py-1 rounded-full">Failed</span>
               )}
            </div>

          </div>
        ))}
      </div>

      <div className="flex justify-center pt-6">
        <button 
          onClick={onReset}
          className="text-slate-500 hover:text-brand-500 flex items-center gap-2 transition-colors"
        >
          <Trash2 size={16} /> Clear All
        </button>
      </div>

    </div>
  );
};

export default Converter;