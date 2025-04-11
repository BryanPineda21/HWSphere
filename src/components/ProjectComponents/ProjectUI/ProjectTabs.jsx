// /components/project/ui/ProjectTabs.jsx
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Box, Code, FileText, Video } from 'lucide-react';

// Import viewer components
import ModelViewer from '../viewers/ModelViewer';
import CodeContent from '../viewers/CodeViewer';
import PdfViewer from '../viewers/PdfViewer';
import VideoPlayer from '../viewers/VideoPlayer';

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
  
  // If there are no content tabs to show
  if (!defaultTab) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No content is available for this project.
      </div>
    );
  }
  
  return (
    <Tabs defaultValue={defaultTab} className="space-y-4">
      <TabsList className="bg-muted/30 backdrop-blur-sm border border-border/30 p-1">
        {project.modelUrl && (
          <TabsTrigger value="model" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Box className="w-4 h-4 mr-2" />
            3D Model
          </TabsTrigger>
        )}
        
        {(project.codeContent || project.codeUrl) && (
          <TabsTrigger value="code" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Code className="w-4 h-4 mr-2" />
            Source Code
          </TabsTrigger>
        )}
        
        {project.pdfUrl && (
          <TabsTrigger value="pdf" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="w-4 h-4 mr-2" />
            PDF Document
          </TabsTrigger>
        )}
        
        {project.videoUrl && (
          <TabsTrigger value="video" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Video className="w-4 h-4 mr-2" />
            Video
          </TabsTrigger>
        )}
      </TabsList>

      {project.modelUrl && (
        <TabsContent value="model" className="mt-4 h-[300px] md:h-[400px] lg:h-[600px] border border-border/20 rounded-lg overflow-hidden">
          <ModelViewer modelUrl={project.modelUrl} />
        </TabsContent>
      )}

      {(project.codeContent || project.codeUrl) && (
        <TabsContent value="code" className="mt-4 h-[300px] md:h-[400px] lg:h-[600px] border border-border/20 rounded-lg overflow-hidden">
          <CodeContent project={project} />
        </TabsContent>
      )}

      {project.pdfUrl && (
        <TabsContent value="pdf" className="mt-4 h-[300px] md:h-[400px] lg:h-[600px] border border-border/20 rounded-lg overflow-hidden">
          <PdfViewer pdfUrl={project.pdfUrl} />
        </TabsContent>
      )}

      {project.videoUrl && (
        <TabsContent value="video" className="mt-4 h-[300px] md:h-[400px] lg:h-[600px] border border-border/20 rounded-lg overflow-hidden">
          <VideoPlayer videoUrl={project.videoUrl} />
        </TabsContent>
      )}
    </Tabs>
  );
};

export default ProjectTabs;