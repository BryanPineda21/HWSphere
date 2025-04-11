// /components/project/ui/ProjectTabs.jsx
import React,{useState, useEffect} from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Box, Code, FileText, Video } from 'lucide-react';

// Import viewer components
import ModelViewer from '../viewers/ModelViewer';
import CodeContent from '../viewers/CodeViewer';
import PdfViewer from '../viewers/PdfViewer';
import VideoPlayer from '../viewers/VideoPlayer';
import { motion, AnimatePresence } from "framer-motion";

const ProjectTabs = ({ project }) => {
  // Determine which tab to show by default
  const getDefaultTab = () => {
    if (project.modelUrl) return 'model';
    if (project.codeContent || project.codeUrl) return 'code';
    if (project.pdfUrl) return 'pdf';
    if (project.videoUrl) return 'video';
    return null;
  };
  
  const defaultTab = getDefaultTab();
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // If there are no content tabs to show
  if (!defaultTab) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No content is available for this project.
      </div>
    );
  }
  
  // Check for mobile viewport
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle tab change
  const handleTabChange = (value) => {
    setActiveTab(value);
  };
  
  return (
   
      <Tabs defaultValue={defaultTab} className="space-y-4">
      <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-primary/40 scrollbar-track-transparent pb-2">
        <TabsList className="bg-gradient-to-r from-[#90EE90] via-[#66CDAA] to-[#32CD32] dark:bg-gradient-to-r dark:from-[#90EE90]/30 dark:via-[#66CDAA]/30 dark:to-[#32CD32]/30 backdrop-blur-md border border-[#32CD32]/40 dark:border-[#90EE90]/30 p-1 rounded-lg shadow-md w-full">
          {project.modelUrl && (
            <TabsTrigger 
              value="model" 
              onClick={() => handleTabChange('model')}
              className="group data-[state=active]:bg-white/20 dark:data-[state=active]:bg-black/20 data-[state=active]:text-white dark:data-[state=active]:text-white relative transition-all duration-300 ease-in-out"
            >
              <div className="absolute inset-0 bg-white/10 dark:bg-white/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              <Box className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4 mr-2'} text-white/80 dark:text-white/90 group-data-[state=active]:text-white`} />
              {!isMobile && <span className="text-white/90 dark:text-white/90 group-data-[state=active]:text-white font-medium">3D Model</span>}
              <motion.div 
                className="absolute bottom-0 left-2 right-2 h-0.5 bg-white" 
                initial={false}
                animate={{ 
                  scaleX: activeTab === 'model' ? 1 : 0 
                }}
                transition={{ duration: 0.3 }}
              />
            </TabsTrigger>
          )}
          
          {(project.codeContent || project.codeUrl) && (
            <TabsTrigger 
              value="code" 
              onClick={() => handleTabChange('code')}
              className="group data-[state=active]:bg-white/20 dark:data-[state=active]:bg-black/20 data-[state=active]:text-white dark:data-[state=active]:text-white relative transition-all duration-300 ease-in-out"
            >
              <div className="absolute inset-0 bg-white/10 dark:bg-white/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              <Code className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4 mr-2'} text-white/80 dark:text-white/90 group-data-[state=active]:text-white`} />
              {!isMobile && <span className="text-white/90 dark:text-white/90 group-data-[state=active]:text-white font-medium">Source Code</span>}
              <motion.div 
                className="absolute bottom-0 left-2 right-2 h-0.5 bg-white" 
                initial={false}
                animate={{ 
                  scaleX: activeTab === 'code' ? 1 : 0 
                }}
                transition={{ duration: 0.3 }}
              />
            </TabsTrigger>
          )}
          
          {project.pdfUrl && (
            <TabsTrigger 
              value="pdf" 
              onClick={() => handleTabChange('pdf')}
              className="group data-[state=active]:bg-white/20 dark:data-[state=active]:bg-black/20 data-[state=active]:text-white dark:data-[state=active]:text-white relative transition-all duration-300 ease-in-out"
            >
              <div className="absolute inset-0 bg-white/10 dark:bg-white/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              <FileText className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4 mr-2'} text-white/80 dark:text-white/90 group-data-[state=active]:text-white`} />
              {!isMobile && <span className="text-white/90 dark:text-white/90 group-data-[state=active]:text-white font-medium">PDF Document</span>}
              <motion.div 
                className="absolute bottom-0 left-2 right-2 h-0.5 bg-white" 
                initial={false}
                animate={{ 
                  scaleX: activeTab === 'pdf' ? 1 : 0 
                }}
                transition={{ duration: 0.3 }}
              />
            </TabsTrigger>
          )}
          
          {project.videoUrl && (
            <TabsTrigger 
              value="video" 
              onClick={() => handleTabChange('video')}
              className="group data-[state=active]:bg-white/20 dark:data-[state=active]:bg-black/20 data-[state=active]:text-white dark:data-[state=active]:text-white relative transition-all duration-300 ease-in-out"
            >
              <div className="absolute inset-0 bg-white/10 dark:bg-white/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              <Video className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4 mr-2'} text-white/80 dark:text-white/90 group-data-[state=active]:text-white`} />
              {!isMobile && <span className="text-white/90 dark:text-white/90 group-data-[state=active]:text-white font-medium">Video</span>}
              <motion.div 
                className="absolute bottom-0 left-2 right-2 h-0.5 bg-white" 
                initial={false}
                animate={{ 
                  scaleX: activeTab === 'video' ? 1 : 0 
                }}
                transition={{ duration: 0.3 }}
              />
            </TabsTrigger>
          )}
        </TabsList>
      </div>

      <div className="relative w-full" style={{ height: 'calc(85vh - 180px)', minHeight: '400px' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'model' && project.modelUrl && (
            <motion.div
              key="model"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 rounded-lg border border-[#32CD32]/30 dark:border-[#90EE90]/20 overflow-hidden shadow-lg bg-card/50 dark:bg-card/30 backdrop-blur-sm"
            >
              <ModelViewer modelUrl={project.modelUrl} />
            </motion.div>
          )}

          {activeTab === 'code' && (project.codeContent || project.codeUrl) && (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 rounded-lg border border-[#32CD32]/30 dark:border-[#90EE90]/20 overflow-hidden shadow-lg bg-card/50 dark:bg-card/30 backdrop-blur-sm"
            >
              <CodeContent project={project} />
            </motion.div>
          )}

          {activeTab === 'pdf' && project.pdfUrl && (
            <motion.div
              key="pdf"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 rounded-lg border border-[#32CD32]/30 dark:border-[#90EE90]/20 overflow-hidden shadow-lg bg-card/50 dark:bg-card/30 backdrop-blur-sm"
            >
              <PdfViewer pdfUrl={project.pdfUrl} />
            </motion.div>
          )}

          {activeTab === 'video' && project.videoUrl && (
            <motion.div
              key="video"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 rounded-lg border border-[#32CD32]/30 dark:border-[#90EE90]/20 overflow-hidden shadow-lg bg-card/50 dark:bg-card/30 backdrop-blur-sm"
            >
              <VideoPlayer videoUrl={project.videoUrl} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Tabs>
  );
};

export default ProjectTabs;