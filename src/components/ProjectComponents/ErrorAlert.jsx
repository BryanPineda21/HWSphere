import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ErrorAlert = ({ message }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/90 text-foreground pt-16 md:pt-20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">Error</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">{message || 'An unexpected error occurred'}</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                className="border-destructive/30 hover:bg-destructive/20"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
              <Button 
                variant="outline" 
                className="border-muted hover:bg-muted/20"
                onClick={() => navigate('/')}
              >
                Return to Home
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default ErrorAlert;