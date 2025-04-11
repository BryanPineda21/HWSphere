// /components/project/viewers/PdfViewer.jsx
import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PDFViewer = ({ pdfUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setError('Failed to load PDF document');
    setIsLoading(false);
  };

  if (!pdfUrl) {
    return (
      <div className="h-full w-full rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
        No PDF document available
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-lg bg-muted overflow-hidden relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="flex flex-col items-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
            <span className="text-foreground">Loading PDF...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
          <div className="flex flex-col items-center max-w-xs text-center">
            <span className="text-destructive mb-4">{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className="flex gap-2 items-center"
            >
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4" />
                Download PDF Instead
              </a>
            </Button>
          </div>
        </div>
      )}
      
      <object
        data={pdfUrl}
        type="application/pdf"
        className="w-full h-full"
        onLoad={handleLoad}
        onError={handleError}
      >
        <div className="flex h-full w-full items-center justify-center">
          <p className="text-muted-foreground">
            Your browser cannot display PDFs inline. 
            <a 
              href={pdfUrl} 
              className="text-primary ml-1 hover:underline" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Download
            </a> instead.
          </p>
        </div>
      </object>
      
      {/* Download button overlay */}
      <div className="absolute bottom-4 right-4">
        <Button 
          size="sm" 
          variant="secondary"
          className="backdrop-blur-sm bg-background/70 hover:bg-background/90 shadow-lg"
          asChild
        >
          <a href={pdfUrl} download target="_blank" rel="noopener noreferrer">
            <Download className="w-4 h-4 mr-1" />
            Download
          </a>
        </Button>
      </div>
    </div>
  );
};

export default PDFViewer;