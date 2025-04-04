import { TabsContent } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, FileCode, Box, FileText, Video, AlertCircle, Users, Eye, EyeOff } from 'lucide-react';

const PreviewTab = ({
  activeTab,
  editedProject,
  thumbnailPreview,
  files,
  fileNames,
  project,
  setActiveTab
}) => {
  return (
    <TabsContent value="preview" className="mt-4 space-y-4">
      <Card className="border-green-100 dark:border-green-900/30 shadow-sm transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Project Preview</CardTitle>
          <CardDescription>Review your project details before updating</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Preview Thumbnail */}
            {thumbnailPreview && !editedProject.removeThumbnail ? (
              <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-sm">
                <img 
                  src={thumbnailPreview} 
                  alt="Project thumbnail" 
                  className="w-full h-48 object-cover"
                />
              </div>
            ) : (
              <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800 h-48 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                <div className="text-zinc-400 text-center">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No thumbnail</p>
                </div>
              </div>
            )}

            {/* Project Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1 text-zinc-900 dark:text-zinc-50">
                  {editedProject.title || "Untitled Project"}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {editedProject.description || "No description provided"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {editedProject.tags.length > 0 ? (
                  editedProject.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    >
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-zinc-500">No tags specified</span>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-zinc-500">Visibility:</span>
                {editedProject.visibility === 'public' && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    <Users className="h-3 w-3 mr-1" /> Public
                  </Badge>
                )}
                {editedProject.visibility === 'unlisted' && (
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                    <Eye className="h-3 w-3 mr-1" /> Unlisted
                  </Badge>
                )}
                {editedProject.visibility === 'private' && (
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                    <EyeOff className="h-3 w-3 mr-1" /> Private
                  </Badge>
                )}
              </div>
            </div>

            {/* Files Summary */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Files Included</h4>
              <div className="space-y-1 border border-green-100 dark:border-green-900/30 rounded-lg p-3 bg-zinc-50 dark:bg-zinc-800/50">
                {((Object.values(fileNames).some(name => name) || 
                  project?.thumbnailUrl || 
                  project?.codeUrl || 
                  project?.modelUrl || 
                  project?.pdfUrl || 
                  project?.videoUrl) && 
                  !(editedProject.removeThumbnail && 
                    editedProject.removeCodeFile && 
                    editedProject.removeModelFile && 
                    editedProject.removePdfFile && 
                    editedProject.removeVideoFile)) ? (
                  <ul className="space-y-2">
                    {thumbnailPreview && !editedProject.removeThumbnail && (
                      <li className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-zinc-400" />
                        <span className="text-sm">{files.thumbnail ? fileNames.thumbnail : 'Current thumbnail'}</span>
                      </li>
                    )}
                    {(fileNames.code || project?.codeUrl) && !editedProject.removeCodeFile && (
                      <li className="flex items-center gap-2">
                        <FileCode className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{files.codeFile ? fileNames.code : 'Current code file'}</span>
                      </li>
                    )}
                    {(fileNames.model || project?.modelUrl) && !editedProject.removeModelFile && (
                      <li className="flex items-center gap-2">
                        <Box className="h-4 w-4 text-cyan-500" />
                        <span className="text-sm">{files.modelFile ? fileNames.model : 'Current model file'}</span>
                      </li>
                    )}
                    {(fileNames.pdf || project?.pdfUrl) && !editedProject.removePdfFile && (
                      <li className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-red-500" />
                        <span className="text-sm">{files.pdfFile ? fileNames.pdf : 'Current PDF file'}</span>
                      </li>
                    )}
                    {(fileNames.video || project?.videoUrl) && !editedProject.removeVideoFile && (
                      <li className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">{files.videoFile ? fileNames.video : 'Current video file'}</span>
                      </li>
                    )}
                  </ul>
                ) : (
                  <div className="flex items-center justify-center p-4">
                    <p className="text-sm text-zinc-500">No files uploaded</p>
                  </div>
                )}
              </div>
            </div>

            {/* Validation Issues */}
            {(!editedProject.title || !(
              (Object.values(files).some(file => file !== null) || 
               project?.thumbnailUrl || 
               project?.codeUrl || 
               project?.modelUrl || 
               project?.pdfUrl || 
               project?.videoUrl) && 
              !(editedProject.removeThumbnail && 
                editedProject.removeCodeFile && 
                editedProject.removeModelFile && 
                editedProject.removePdfFile && 
                editedProject.removeVideoFile))) && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-900/20 dark:border-amber-900">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-medium text-amber-800 dark:text-amber-300">Please address the following:</h5>
                    <ul className="mt-1 text-xs text-amber-700 dark:text-amber-400 space-y-1 ml-5 list-disc">
                      {!editedProject.title && <li>Add a project title</li>}
                      {!(
                        (Object.values(files).some(file => file !== null) || 
                         project?.thumbnailUrl || 
                         project?.codeUrl || 
                         project?.modelUrl || 
                         project?.pdfUrl || 
                         project?.videoUrl) && 
                        !(editedProject.removeThumbnail && 
                          editedProject.removeCodeFile && 
                          editedProject.removeModelFile && 
                          editedProject.removePdfFile && 
                          editedProject.removeVideoFile)) && <li>Upload at least one file</li>}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="pt-2 flex items-center justify-between">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={() => setActiveTab("files")}
          className="flex items-center gap-2 text-zinc-600 hover:text-zinc-700 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Back: Files
        </Button>
        
        <div className="text-xs text-zinc-500">Step 2 of 2</div>
      </div>
    </TabsContent>
  );
};

export default PreviewTab;