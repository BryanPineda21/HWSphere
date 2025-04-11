// /components/project/viewers/CodeViewer.jsx
import React, { useRef, useEffect, useState } from 'react';
import hljs from 'highlight.js';
import { useTheme } from '@/components/ui/themeProvider';

// Import multiple highlight.js themes to support both light and dark modes
import 'highlight.js/styles/atom-one-dark.css';
import 'highlight.js/styles/atom-one-light.css';
import { Loader2 } from 'lucide-react';

// Simple code viewer component
const CodeViewer = ({ code }) => {
  const codeRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (codeRef.current && code) {
      // Apply correct theme class based on current theme
      if (theme === 'dark') {
        codeRef.current.classList.add('hljs-dark');
        codeRef.current.classList.remove('hljs-light');
        document.documentElement.style.setProperty('--hljs-theme', 'atom-one-dark');
      } else {
        codeRef.current.classList.add('hljs-light');
        codeRef.current.classList.remove('hljs-dark');
        document.documentElement.style.setProperty('--hljs-theme', 'atom-one-light');
      }
      
      // Highlight the code
      hljs.highlightElement(codeRef.current);
    }
  }, [code, theme]);

  if (!code) {
    return (
      <div className="h-full w-full rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
        No code content available
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-lg bg-code-bg overflow-hidden">
      <pre className="h-full overflow-auto m-0 p-4">
        <code ref={codeRef} className="text-sm md:text-base font-mono">
          {code}
        </code>
      </pre>
    </div>
  );
};

// Code Content component that handles fetching code from URLs if needed
const CodeContent = ({ project }) => {
  const [codeContent, setCodeContent] = useState(project.codeContent || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If we already have code content, use it
    if (project.codeContent) {
      setCodeContent(project.codeContent);
      return;
    }

    // If we have a codeUrl but no content, fetch it
    if (project.codeUrl && !project.codeContent) {
      setIsLoading(true);
      setError(null);
      
      fetch(project.codeUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch code content');
          }
          return response.text();
        })
        .then(data => {
          setCodeContent(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching code:', err);
          setError(err.message || 'Failed to load code content');
          setIsLoading(false);
        });
    }
  }, [project.codeContent, project.codeUrl]);

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-muted rounded-lg">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
        <p className="text-muted-foreground">Loading code content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center text-destructive bg-destructive/10 rounded-lg">
        {error}
      </div>
    );
  }

  return <CodeViewer code={codeContent} />;
};

export default CodeContent;