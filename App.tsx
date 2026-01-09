import React, { useState } from 'react';
import { Camera, ShieldCheck, Zap } from 'lucide-react';
import DropZone from './components/DropZone';
import Converter from './components/Converter';

const App: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFilesSelect = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleReset = () => {
    setSelectedFiles([]);
  };

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1509023464722-18d996393ca8?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center">
      {/* Overlay to ensure text readability */}
      <div className="min-h-screen w-full bg-slate-950/90 backdrop-blur-sm flex flex-col">
        
        {/* Header */}
        <header className="w-full p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Camera className="text-white" size={24} />
             </div>
             <div>
               <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                 Fchanger
               </h1>
               <span className="text-xs text-brand-500 font-medium tracking-wider uppercase">by Rimon</span>
             </div>
           </div>
           
           <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
              <span className="flex items-center gap-2"><ShieldCheck size={16} /> Secure & Private</span>
              <span className="flex items-center gap-2"><Zap size={16} /> Instant Conversion</span>
           </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
          
          {selectedFiles.length === 0 ? (
             <div className="w-full max-w-2xl animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-10">
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                    Convert Images <br/>
                    <span className="text-brand-500">Without Limits.</span>
                  </h2>
                  <p className="text-slate-400 text-lg max-w-lg mx-auto">
                    Change image formats locally in your browser. No signup, no login, no quality loss.
                  </p>
                </div>
                
                <div className="bg-slate-900/50 backdrop-blur-md p-2 rounded-3xl border border-slate-800 shadow-2xl">
                   <DropZone onFilesSelect={handleFilesSelect} />
                </div>

                <div className="mt-8 flex justify-center gap-8 text-slate-500 text-sm flex-wrap">
                   <span>JPG</span>
                   <span>PNG</span>
                   <span>WEBP</span>
                   <span>AVIF</span>
                   <span>GIF</span>
                   <span>BMP</span>
                </div>
             </div>
          ) : (
            <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-8 duration-500">
              <Converter files={selectedFiles} onReset={handleReset} />
            </div>
          )}

        </main>

        {/* Footer */}
        <footer className="w-full p-6 text-center text-slate-600 text-sm">
          <p>&copy; {new Date().getFullYear()} Fchanger by Rimon. No copyright. Free to use.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;