'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Shield } from 'lucide-react';

interface PreviewFileProps {
  id: string; name: string; mimeType: string; previewUrl: string; role?: string;
}

export function PreviewDialog({ file, open, onOpenChange }: { file: PreviewFileProps; open: boolean; onOpenChange: (open: boolean) => void }) {
  // Determine if we should use Google Docs Viewer (works for PDFs, Docs, Images, etc without CSP errors)
  // If it's already a gview URL, use it. Otherwise, wrap the stream URL in gview.
  const isDrivePreview = file.previewUrl.includes("drive.google.com");
  const finalUrl = isDrivePreview
    ? file.previewUrl 
    : `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(file.previewUrl)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent className="max-w-7xl w-[95vw] p-0 gap-0 bg-[#202124] dark:bg-[#2d2e30] border-[#5f6368] overflow-hidden h-[90vh] flex flex-col">
        <DialogHeader className="p-4 border-b border-[#5f6368] flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 min-w-0">
              <DialogTitle className="text-[#e8eaed] text-sm font-medium truncate">{file.name}</DialogTitle>
              {file.role && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#394457] text-[#8ab4f8] flex items-center gap-1 flex-shrink-0">
                  <Shield className="h-3 w-3" /> {file.role}
                </span>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.open(finalUrl, '_blank')}
              className="text-[#8ab4f8] hover:bg-[#394457] flex-shrink-0"
            >
              <ExternalLink className="h-4 w-4 mr-2" /> Open in new tab
            </Button>
          </div>
        </DialogHeader>
        
        {/* The Iframe taking up the remaining space */}
        <div className="flex-1 w-full bg-white">
          <iframe 
            src={finalUrl} 
            className="w-full h-full border-0" 
            allow="autoplay"
            title={`Preview of ${file.name}`}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}