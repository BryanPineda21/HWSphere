import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProject, deleteProject } from '../../api/projects.js';
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Tabs components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Upload, Eye } from 'lucide-react';

// Form components
import BasicInfoTab from './BasicInfoTab';
import FilesTab from './FilesTab';
import PreviewTab from './PreviewTab';
import ProjectFormProgress from './ProjectFormProgress';
import ProjectFormActions from './ProjectFormActions';
import FormLoadingState from './FormLoadingState';

// UI components
import { ScrollArea } from '../../components/ui/scroll-area.jsx';
import { Separator } from '../../components/ui/separator.jsx';
import { AlertCircle, Edit } from 'lucide-react';

// Dialog components for modal version
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const ProjectFormLayout = ({ project = null, isDialog = false, onSuccess, onClose }) => {
  const queryClient = useQueryClient();
  const { userData, user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.uid;

  const [isFormVisible, setFormVisible] = useState(isDialog);
  const [activeTab, setActiveTab] = useState("basic");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [editedProject, setEditedProject] = useState({
    title: '',
    description: '',
    tags: [],
    visibility: 'unlisted'
  });
  
  const [files, setFiles] = useState({
    thumbnail: null,
    codeFile: null,
    modelFile: null,
    pdfFile: null,
    videoFile: null
  });
  
  const [fileNames, setFileNames] = useState({
    thumbnail: '',
    model: '',
    code: '',
    pdf: '',
    video: ''
  });
  
  // Thumbnail preview
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  // Load project data when component mounts or project changes
  useEffect(() => {
    if (project) {
      setEditedProject({
        title: project.title || '',
        description: project.description || '',
        tags: project.tags || [],
        visibility: project.visibility || 'unlisted'
      });

      // Set file names from existing URLs
      setFileNames({
        thumbnail: project?.thumbnailUrl ? 'Current thumbnail' : '',
        model: project?.modelUrl ? 'Current model file' : '',
        code: project?.codeUrl ? 'Current code file' : '',
        pdf: project?.pdfUrl ? 'Current PDF file' : '',
        video: project?.videoUrl ? 'Current video file' : ''
      });

      // Set thumbnail preview if there's a thumbnailUrl
      if (project?.thumbnailUrl) {
        setThumbnailPreview(project.thumbnailUrl);
      }
    }
  }, [project]);

  const showForm = (e) => {
    setFormVisible(true);
    if (!isDialog) {
      navigate(`/u/${userData?.username}/projects/${project.id}/edit`);
    }
  };

  const hideForm = () => {
    setFormVisible(false);
    if (!isDialog) {
      navigate(`/u/${userData?.username}/projects/${project.id}`);
    }
    if (onClose) onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!editedProject.title) {
      toast.error('Project title is required');
      return;
    }

    const hasFiles = Object.values(files).some(file => file !== null) || 
                    project.thumbnailUrl || 
                    project.codeUrl || 
                    project.modelUrl || 
                    project.pdfUrl || 
                    project.videoUrl;
                    
    if (!hasFiles) {
      toast.error('Please upload at least one file');
      return;
    }

    const projectData = {
      title: editedProject.title,
      description: editedProject.description,
      tags: editedProject.tags,
      visibility: editedProject.visibility,
      updatedAt: new Date(),
      // Include any file removal flags
      removeThumbnail: editedProject.removeThumbnail,
      removeCodeFile: editedProject.removeCodeFile,
      removeModelFile: editedProject.removeModelFile,
      removePdfFile: editedProject.removePdfFile,
      removeVideoFile: editedProject.removeVideoFile
    };

    try {
      const result = await updateProject(project.id, projectData, files);
      console.log('Project updated:', result);
      return result;
    } catch (error) {
      console.error('Update error:', error);
      throw new Error('Update failed: ' + error.message);
    }
  };

  const handleDeleteProject = async () => {
    if (!project || !project.id) {
      toast.error('Project ID is missing');
      return;
    }

    try {
      await deleteProject(project.id);
      queryClient.invalidateQueries(["projects", userId]);
      queryClient.invalidateQueries(["projects", userData?.username]);
      toast.success('Project deleted successfully');
      
      // Close the dialog and navigate away if needed
      setIsDeleteDialogOpen(false);
      hideForm();
      
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess({ deleted: true });
      }
      
      // Navigate to the user's profile
      if (!isDialog) {
        navigate(`/u/${userData?.username}`);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project: ' + error.message);
    }
  };

  const { mutate: updateProjectMutation, isPending, isError, error } = useMutation({
    mutationFn: handleSubmit,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["projects", userId]);
      queryClient.invalidateQueries(["projects", userData?.username]);
      queryClient.invalidateQueries(["project", project.id]);
      hideForm();
      toast.success('Project updated successfully');
      
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(data);
      }
    },
    onError: (error) => {
      console.error('Project update error:', error);
      toast.error('Failed to update project: ' + error.message);
    },
  });

  // Check if we have at least one file and a title
  const isFormValid = editedProject.title && (
    Object.values(files).some(file => file !== null) ||
    project?.thumbnailUrl ||
    project?.codeUrl ||
    project?.modelUrl ||
    project?.pdfUrl ||
    project?.videoUrl
  );

  // Progress indicator
  const formProgress = [
    editedProject.title ? 33 : 0,
    editedProject.description ? 17 : 0,
    (Object.values(files).some(file => file !== null) || 
      project?.thumbnailUrl || 
      project?.codeUrl || 
      project?.modelUrl || 
      project?.pdfUrl || 
      project?.videoUrl) ? 50 : 0
  ].reduce((a, b) => a + b, 0);

  // Form content is the same whether used as a dialog or standalone
  const formContent = (
    <form onSubmit={(e) => {
      e.preventDefault();
      updateProjectMutation(e);
    }} className="space-y-6">
      {!isPending ? (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Basic Info</span>
                <span className="sm:hidden">Info</span>
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span>Files</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </TabsTrigger>
            </TabsList>

            <BasicInfoTab 
              activeTab={activeTab}
              editedProject={editedProject}
              setEditedProject={setEditedProject}
              thumbnailPreview={thumbnailPreview}
              setThumbnailPreview={setThumbnailPreview}
              files={files}
              setFiles={setFiles}
              fileNames={fileNames}
              setFileNames={setFileNames}
              project={project}
              setActiveTab={setActiveTab}
            />

            <FilesTab 
              activeTab={activeTab}
              files={files}
              setFiles={setFiles}
              fileNames={fileNames}
              setFileNames={setFileNames}
              project={project}
              editedProject={editedProject}
              setEditedProject={setEditedProject}
              setActiveTab={setActiveTab}
            />

            <PreviewTab 
              activeTab={activeTab}
              editedProject={editedProject}
              thumbnailPreview={thumbnailPreview}
              files={files}
              fileNames={fileNames}
              project={project}
              setActiveTab={setActiveTab}
            />
          </Tabs>

          <ProjectFormProgress formProgress={formProgress} />

          <ProjectFormActions 
            isFormValid={isFormValid}
            hideForm={hideForm}
            isDeleteDialogOpen={isDeleteDialogOpen}
            setIsDeleteDialogOpen={setIsDeleteDialogOpen}
            handleDeleteProject={handleDeleteProject}
          />
        </>
      ) : (
        <FormLoadingState message="Updating your project..." subMessage="Uploading files and processing data" />
      )}
      
      {isError && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 p-4 text-red-700 dark:text-red-300 text-sm mt-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error updating project</p>
              <p className="mt-1">{error?.message || 'Please try again.'}</p>
            </div>
          </div>
        </div>
      )}
    </form>
  );

  // If project data is not available yet, show loading state
  if (!project) {
    return <FormLoadingState message="Loading project..." />;
  }

  // If used as a standalone page
  if (!isDialog) {
    return (
      <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 mt-20">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Edit className="h-6 w-6 text-green-500" />
            Edit Project
          </h1>
          <Separator className="mb-6" />
          {formContent}
        </div>
      </div>
    );
  }

  // If used as a dialog
  return (
    <div className="w-full lg:w-auto">
      <Dialog open={isFormVisible} onOpenChange={setFormVisible}>
        <DialogTrigger asChild>
          <Button
            onClick={showForm}
            className="w-full lg:w-auto bg-green-600 hover:bg-green-700 text-white transition-colors"
            size="sm"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Project
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0">
          <ScrollArea className="max-h-[90vh]">
            <div className="p-6">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Edit className="h-5 w-5 text-green-500" />
                  Edit Project
                </DialogTitle>
                <DialogDescription>
                  Update project details or manage associated files
                </DialogDescription>
              </DialogHeader>
              {formContent}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectFormLayout;