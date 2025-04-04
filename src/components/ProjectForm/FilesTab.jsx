
import { TabsContent } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCode, Box, FileText, Video, Upload, Check, X } from 'lucide-react';
import FileUploadCard from './FileUploadCard';

const FilesTab = ({
  activeTab,
  files,
  setFiles,
  fileNames,
  setFileNames,
  project,
  editedProject,
  setEditedProject,
  setActiveTab
}) => {
  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Update the files state
    setFiles(prev => ({
      ...prev,
      [fileType]: file
    }));

    // Update fileNames based on the fileType
    const fileKey = 
      fileType === 'codeFile' ? 'code' : 
      fileType === 'modelFile' ? 'model' : 
      fileType === 'pdfFile' ? 'pdf' :
      fileType === 'videoFile' ? 'video' :
      fileType;
    
    setFileNames(prev => ({
      ...prev,
      [fileKey]: file.name
    }));

    // If we had previously marked this file for removal, unmark it since we're adding a new one
    if (fileKey === 'code' && editedProject.removeCodeFile) {
      setEditedProject(prev => ({ ...prev, removeCodeFile: false }));
    } else if (fileKey === 'model' && editedProject.removeModelFile) {
      setEditedProject(prev => ({ ...prev, removeModelFile: false }));
    } else if (fileKey === 'pdf' && editedProject.removePdfFile) {
      setEditedProject(prev => ({ ...prev, removePdfFile: false }));
    } else if (fileKey === 'video' && editedProject.removeVideoFile) {
      setEditedProject(prev => ({ ...prev, removeVideoFile: false }));
    } else if (fileKey === 'thumbnail' && editedProject.removeThumbnail) {
      setEditedProject(prev => ({ ...prev, removeThumbnail: false }));
    }
  };

  const handleLegacyFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const extension = file.name.split('.').pop().toLowerCase();
      
      if (['stl', 'obj', '3mf'].includes(extension)) {
        setFiles(prev => ({ ...prev, modelFile: file }));
        setFileNames(prev => ({ ...prev, model: file.name }));
        if (editedProject.removeModelFile) {
          setEditedProject(prev => ({ ...prev, removeModelFile: false }));
        }
      } 
      else if (['cpp', 'h', 'c', 'py', 'js', 'jsx', 'html', 'css', 'txt'].includes(extension)) {
        setFiles(prev => ({ ...prev, codeFile: file }));
        setFileNames(prev => ({ ...prev, code: file.name }));
        if (editedProject.removeCodeFile) {
          setEditedProject(prev => ({ ...prev, removeCodeFile: false }));
        }
      }
      else if (['pdf'].includes(extension)) {
        setFiles(prev => ({ ...prev, pdfFile: file }));
        setFileNames(prev => ({ ...prev, pdf: file.name }));
        if (editedProject.removePdfFile) {
          setEditedProject(prev => ({ ...prev, removePdfFile: false }));
        }
      }
      else if (['mp4', 'mov', 'avi'].includes(extension)) {
        setFiles(prev => ({ ...prev, videoFile: file }));
        setFileNames(prev => ({ ...prev, video: file.name }));
        if (editedProject.removeVideoFile) {
          setEditedProject(prev => ({ ...prev, removeVideoFile: false }));
        }
      }
    });
  };

  const handleRemoveFile = (fileType) => {
    const fileKey = 
      fileType === 'codeFile' ? 'code' : 
      fileType === 'modelFile' ? 'model' : 
      fileType === 'pdfFile' ? 'pdf' :
      fileType === 'videoFile' ? 'video' :
      fileType;

    setFiles(prev => ({ ...prev, [fileType]: null }));
    
    // If removing the current file, indicate it should be removed on the server
    if (fileKey === 'thumbnail' && project.thumbnailUrl) {
      setEditedProject(prev => ({ ...prev, removeThumbnail: true }));
    } else if (fileKey === 'code' && project.codeUrl) {
      setEditedProject(prev => ({ ...prev, removeCodeFile: true }));
    } else if (fileKey === 'model' && project.modelUrl) {
      setEditedProject(prev => ({ ...prev, removeModelFile: true }));
    } else if (fileKey === 'pdf' && project.pdfUrl) {
      setEditedProject(prev => ({ ...prev, removePdfFile: true }));
    } else if (fileKey === 'video' && project.videoUrl) {
      setEditedProject(prev => ({ ...prev, removeVideoFile: true }));
    }
    
    setFileNames(prev => ({ ...prev, [fileKey]: '' }));
  };

  // Helper function to check if a file should be considered present
  const isFilePresent = (fileType) => {
    switch(fileType) {
      case 'codeFile':
        return files.codeFile || (project?.codeUrl && !editedProject.removeCodeFile);
      case 'modelFile':
        return files.modelFile || (project?.modelUrl && !editedProject.removeModelFile);
      case 'pdfFile':
        return files.pdfFile || (project?.pdfUrl && !editedProject.removePdfFile);
      case 'videoFile':
        return files.videoFile || (project?.videoUrl && !editedProject.removeVideoFile);
      case 'thumbnail':
        return files.thumbnail || (project?.thumbnailUrl && !editedProject.removeThumbnail);
      default:
        return false;
    }
  };

  // Helper to get the current file name
  const getCurrentFileName = (fileType, newFileKey) => {
    if (files[fileType]) {
      return fileNames[newFileKey];
    }
    
    // Check if we have an existing file that's not marked for removal
    switch(fileType) {
      case 'codeFile':
        return !editedProject.removeCodeFile && project?.codeUrl ? 'Current code file' : '';
      case 'modelFile':
        return !editedProject.removeModelFile && project?.modelUrl ? 'Current model file' : '';
      case 'pdfFile':
        return !editedProject.removePdfFile && project?.pdfUrl ? 'Current PDF file' : '';
      case 'videoFile':
        return !editedProject.removeVideoFile && project?.videoUrl ? 'Current video file' : '';
      case 'thumbnail':
        return !editedProject.removeThumbnail && project?.thumbnailUrl ? 'Current thumbnail' : '';
      default:
        return '';
    }
  };

  return (
    <TabsContent value="files" className="mt-4 space-y-4">
      <Card className="border-green-100 dark:border-green-900/30 transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Project Files</CardTitle>
          <CardDescription>Update or replace files in your project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Project Files Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Code File */}
            <FileUploadCard
              icon={FileCode}
              label="Code File"
              hasFile={isFilePresent('codeFile')}
              fileName={getCurrentFileName('codeFile', 'code')}
              fileType="codeFile"
              acceptTypes=".js,.py,.cpp,.java,.html,.css,.txt"
              colorClass="blue"
              handleFileChange={handleFileChange}
              handleRemoveFile={handleRemoveFile}
            />
            
            {/* 3D Model File */}
            <FileUploadCard
              icon={Box}
              label="3D Model"
              hasFile={isFilePresent('modelFile')}
              fileName={getCurrentFileName('modelFile', 'model')}
              fileType="modelFile"
              acceptTypes=".stl,.obj,.3mf"
              colorClass="cyan"
              handleFileChange={handleFileChange}
              handleRemoveFile={handleRemoveFile}
            />
            
            {/* PDF File */}
            <FileUploadCard
              icon={FileText}
              label="PDF File"
              hasFile={isFilePresent('pdfFile')}
              fileName={getCurrentFileName('pdfFile', 'pdf')}
              fileType="pdfFile"
              acceptTypes=".pdf"
              colorClass="red"
              handleFileChange={handleFileChange}
              handleRemoveFile={handleRemoveFile}
            />
            
            {/* Video File */}
            <FileUploadCard
              icon={Video}
              label="Video"
              hasFile={isFilePresent('videoFile')}
              fileName={getCurrentFileName('videoFile', 'video')}
              fileType="videoFile"
              acceptTypes=".mp4,.mov,.avi"
              colorClass="purple"
              handleFileChange={handleFileChange}
              handleRemoveFile={handleRemoveFile}
            />
          </div>
          
          {/* Multi-file upload */}
          <div className="mt-6">
            <div className="border-t border-dashed pt-4">
              <div className="flex flex-col items-center justify-center gap-2 p-4 border border-dashed rounded-lg bg-zinc-50 dark:bg-zinc-900/30 hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-all">
                <Upload className="h-8 w-8 text-green-400" />
                <p className="text-sm text-center">
                  Drag and drop files here or
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('project-files').click()}
                  className="mt-1 border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 hover:border-green-300 dark:border-green-900 dark:text-green-400 dark:hover:bg-green-900/20 dark:hover:text-green-300"
                >
                  Browse Files
                </Button>
                <input
                  type="file"
                  id="project-files"
                  className="hidden"
                  multiple
                  onChange={handleLegacyFileChange}
                  accept=".stl,.obj,.3mf,.cpp,.h,.c,.py,.js,.txt,.pdf,.mp4,.mov,.avi"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Supports various file types including code, 3D models, PDFs, and videos
                </p>
              </div>
            </div>
          </div>
          
          {/* Selected Files Summary */}
          {(Object.values(fileNames).some(name => name) || 
           (project?.thumbnailUrl && !editedProject.removeThumbnail) || 
           (project?.codeUrl && !editedProject.removeCodeFile) || 
           (project?.modelUrl && !editedProject.removeModelFile) || 
           (project?.pdfUrl && !editedProject.removePdfFile) || 
           (project?.videoUrl && !editedProject.removeVideoFile)) && (
            <div className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-green-100 dark:border-green-900/30">
              <h4 className="font-medium text-sm mb-3 flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-1" />
                Files
              </h4>
              <div className="space-y-2 text-sm">
                {((fileNames.thumbnail && files.thumbnail) || (project?.thumbnailUrl && !editedProject.removeThumbnail)) && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 flex justify-center">
                      <img 
                        src={files.thumbnail ? URL.createObjectURL(files.thumbnail) : project.thumbnailUrl} 
                        alt="Thumbnail preview" 
                        className="h-4 w-4 object-cover rounded-sm"
                      />
                    </div>
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {files.thumbnail ? fileNames.thumbnail : 'Current thumbnail'}
                    </span>
                  </div>
                )}
                {((fileNames.code && files.codeFile) || (project?.codeUrl && !editedProject.removeCodeFile)) && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 flex justify-center">
                      <FileCode className="h-4 w-4 text-blue-500" />
                    </div>
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {files.codeFile ? fileNames.code : 'Current code file'}
                    </span>
                  </div>
                )}
                {((fileNames.model && files.modelFile) || (project?.modelUrl && !editedProject.removeModelFile)) && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 flex justify-center">
                      <Box className="h-4 w-4 text-cyan-500" />
                    </div>
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {files.modelFile ? fileNames.model : 'Current model file'}
                    </span>
                  </div>
                )}
                {((fileNames.pdf && files.pdfFile) || (project?.pdfUrl && !editedProject.removePdfFile)) && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 flex justify-center">
                      <FileText className="h-4 w-4 text-red-500" />
                    </div>
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {files.pdfFile ? fileNames.pdf : 'Current PDF file'}
                    </span>
                  </div>
                )}
                {((fileNames.video && files.videoFile) || (project?.videoUrl && !editedProject.removeVideoFile)) && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 flex justify-center">
                      <Video className="h-4 w-4 text-purple-500" />
                    </div>
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {files.videoFile ? fileNames.video : 'Current video file'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="pt-2 flex items-center justify-between">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={() => setActiveTab("basic")}
          className="flex items-center gap-2 text-zinc-600 hover:text-zinc-700 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Back: Basic Info
        </Button>
        
        <Button 
          type="button" 
          variant="ghost" 
          onClick={() => setActiveTab("preview")}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
        >
          Next: Preview
        </Button>
      </div>
    </TabsContent>
  );
};

export default FilesTab;