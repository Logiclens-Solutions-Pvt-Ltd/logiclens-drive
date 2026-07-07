'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UploadCloud, File, X, Loader2 } from 'lucide-react';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (files: FileList) => void;
  isUploading: boolean;
}

export function UploadDialog({ open, onOpenChange, onUpload, isUploading }: UploadDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (selectedFiles.length === 0) return;
    // Create a fake FileList from our array to pass to the parent
    const dt = new DataTransfer();
    selectedFiles.forEach(file => dt.items.add(file));
    onUpload(dt.files);
    setSelectedFiles([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#2d2e30] border-[#dadce0] dark:border-[#5f6368] p-6">
        <DialogHeader>
          <DialogTitle className="text-[#202124] dark:text-[#e8eaed]">Upload Files</DialogTitle>
        </DialogHeader>

        <div 
          className="border-2 border-dashed border-[#dadce0] dark:border-[#5f6368] rounded-lg p-8 text-center hover:border-[#1a73e8] dark:hover:border-[#8ab4f8] transition-colors cursor-pointer"
          onClick={() => document.getElementById('file-upload-input')?.click()}
        >
          <UploadCloud className="h-10 w-10 mx-auto text-[#5f6368] dark:text-[#9aa0a6] mb-3" />
          <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6]">
            Click to browse or drag and drop files here
          </p>
          <input 
            id="file-upload-input"
            type="file" 
            multiple 
            className="hidden" 
            onChange={handleFileChange} 
          />
        </div>

        {/* List of selected files */}
        {selectedFiles.length > 0 && (
          <div className="mt-4 space-y-2 max-h-40 overflow-y-auto border border-[#dadce0] dark:border-[#5f6368] rounded-lg p-2">
            {selectedFiles.map((file, index) => (
              <div key={file.name} className="flex items-center justify-between bg-[#f1f3f4] dark:bg-[#3c4043] rounded px-3 py-2 text-sm">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <File className="h-4 w-4 text-[#5f6368] dark:text-[#9aa0a6] flex-shrink-0" />
                  <span className="text-[#202124] dark:text-[#e8eaed] truncate">{file.name}</span>
                  <span className="text-xs text-[#5f6368] dark:text-[#9aa0a6] flex-shrink-0">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button 
                  onClick={() => removeFile(index)} 
                  className="p-1 hover:bg-[#dadce0] dark:hover:bg-[#5f6368] rounded flex-shrink-0"
                >
                  <X className="h-3.5 w-3.5 text-[#5f6368] dark:text-[#9aa0a6]" />
                </button>
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="mt-6">
          <Button variant="ghost" onClick={() => { setSelectedFiles([]); onOpenChange(false); }} className="text-[#202124] dark:text-[#e8eaed]">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={selectedFiles.length === 0 || isUploading}
            className="bg-[#1a73e8] dark:bg-[#8ab4f8] hover:bg-[#1765cc] dark:hover:bg-[#aecbfa] text-white dark:text-[#202124]"
          >
            {isUploading ? (
              <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</span>
            ) : (
              `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}