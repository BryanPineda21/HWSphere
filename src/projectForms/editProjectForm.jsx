import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {updateProject, deleteProject} from '../api/projects.js';
import { useAuth } from "../context/AuthContext.jsx";




// UI components
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
  } from '@/components/ui/dialog';
  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { Label } from '@/components/ui/label';
  import { Textarea } from '@/components/ui/textarea';
  import { ScrollArea } from '../components/ui/scroll-area.jsx';
  import { Separator } from '../components/ui/separator.jsx';
  import { 
    Upload, 
    ImageIcon,
    FileCode,
    FileText,
    Video,
    Box,
    X,
    AlertCircle,
    Check,
    Eye,
    EyeOff,
    Users,
    Tag,
    Sparkles,
    Edit,
    Save,
    Trash2
  } from 'lucide-react';
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
  import { toast} from 'sonner';
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
  import { Badge } from "@/components/ui/badge";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
  import { useNavigate } from 'react-router-dom';

  const EditProjectForm = ({ project = null, isDialog = false, onSuccess, onClose }) => {
    const queryClient = useQueryClient();
    const { userData, user } = useAuth();
    const navigate = useNavigate();
    const userId = user?.uid;
  
    const [isFormVisible, setFormVisible] = useState(isDialog);
    const [activeTab, setActiveTab] = useState("basic");
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
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
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
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setEditedProject({
        ...editedProject,
        [name]: value
      });
    };
  
    const handleTagsChange = (e) => {
      const tagsString = e.target.value;
      
      // Split by comma, clean up each tag, and remove empty tags
      const tagsArray = tagsString
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Update the project state with the new tags (limit to 4)
      setEditedProject(prev => ({
        ...prev,
        tags: tagsArray.slice(0, 4)
      }));
    };
  
    const handleTagsKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault(); // Prevent form submission
        
        const inputValue = e.target.value.trim();
        
        // If input doesn't end with comma, add one
        if (inputValue && !inputValue.endsWith(',')) {
          const updatedValue = inputValue + ',';
          e.target.value = updatedValue;
          
          // Trigger the onChange handler with the updated value
          const changeEvent = new Event('input', { bubbles: true });
          e.target.dispatchEvent(changeEvent);
        }
      }
    };
  
    const handleVisibilityChange = (value) => {
      setEditedProject(prev => ({
        ...prev,
        visibility: value
      }));
    };
  
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
      
      // If it's a thumbnail, create a preview
      if (fileType === 'thumbnail' && file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setThumbnailPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    };
  
    const handleLegacyFileChange = (e) => {
      const files = Array.from(e.target.files);
      
      files.forEach(file => {
        const extension = file.name.split('.').pop().toLowerCase();
        
        if (['stl', 'obj', '3mf'].includes(extension)) {
          setFiles(prev => ({ ...prev, modelFile: file }));
          setFileNames(prev => ({ ...prev, model: file.name }));
        } 
        else if (['cpp', 'h', 'c', 'py', 'js', 'jsx', 'html', 'css', 'txt'].includes(extension)) {
          setFiles(prev => ({ ...prev, codeFile: file }));
          setFileNames(prev => ({ ...prev, code: file.name }));
        }
        else if (['pdf'].includes(extension)) {
          setFiles(prev => ({ ...prev, pdfFile: file }));
          setFileNames(prev => ({ ...prev, pdf: file.name }));
        }
        else if (['mp4', 'mov', 'avi'].includes(extension)) {
          setFiles(prev => ({ ...prev, videoFile: file }));
          setFileNames(prev => ({ ...prev, video: file.name }));
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
        setThumbnailPreview(null);
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
  
              {/* Basic Info Tab */}
              <TabsContent value="basic" className="mt-4 space-y-4">
                {/* Thumbnail Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Project Thumbnail</Label>
                  <div className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-4 transition-all hover:border-zinc-500 dark:hover:border-zinc-500">
                    {thumbnailPreview ? (
                      <div className="relative">
                        <img 
                          src={thumbnailPreview} 
                          alt="Project thumbnail" 
                          className="w-full h-48 object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white"
                          onClick={() => {
                            setThumbnailPreview(null);
                            setFiles(prev => ({ ...prev, thumbnail: null }));
                            setFileNames(prev => ({ ...prev, thumbnail: '' }));
                            if (project.thumbnailUrl) {
                              setEditedProject(prev => ({ ...prev, removeThumbnail: true }));
                            }
                          }}
                        >
                          <X className="w-4 h-4 mr-1" /> Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48 bg-zinc-50 dark:bg-zinc-900/30 rounded-md">
                        <ImageIcon className="h-12 w-12 text-zinc-300 mb-2" />
                        <label className="cursor-pointer">
                          <span className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                            Upload Image
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, 'thumbnail')}
                          />
                        </label>
                        <p className="text-xs text-zinc-500 mt-2">
                          Recommended: 1200×630px or larger
                        </p>
                      </div>
                    )}
                  </div>
                </div>
  
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">Project Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter a descriptive title for your project"
                    required
                    onChange={handleChange}
                    value={editedProject.title}
                    className="transition-all focus:ring-green-500 focus:border-green-500"
                  />
                </div>
  
                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe what your project is about, how it works, or what makes it special"
                    onChange={handleChange}
                    value={editedProject.description}
                    className="h-32 transition-all focus:ring-green-500 focus:border-green-500"
                  />
                </div>
  
                {/* Tags */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tags" className="text-sm font-medium">Tags</Label>
                    <span className="text-xs text-zinc-500">
                      {editedProject.tags.length}/4 tags used
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Tag className="h-4 w-4 text-zinc-400" />
                    </div>
                    <Input
                      id="tags"
                      value={editedProject.tags.join(', ')}
                      onChange={handleTagsChange}
                      onKeyDown={handleTagsKeyDown}
                      placeholder="e.g. javascript, engineering, 3d, tutorial"
                      className="pl-9 transition-all focus:ring-green-500 focus:border-green-500"
                      aria-describedby="tags-help"
                    />
                  </div>
                  <p id="tags-help" className="text-xs text-zinc-500">
                    Enter tags separated by commas, press Enter after each tag
                  </p>
                  {editedProject.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {editedProject.tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1"
                        >
                          {tag}
                          <button 
                            type="button" 
                            className="ml-1 hover:bg-green-200 dark:hover:bg-green-800 rounded-full w-4 h-4 inline-flex items-center justify-center"
                            onClick={() => {
                              const updatedTags = [...editedProject.tags];
                              updatedTags.splice(index, 1);
                              setEditedProject(prev => ({
                                ...prev,
                                tags: updatedTags
                              }));
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
  
                {/* Visibility */}
                <div className="space-y-2">
                  <Label htmlFor="visibility" className="text-sm font-medium">Visibility</Label>
                  <Select value={editedProject.visibility} onValueChange={handleVisibilityChange}>
                    <SelectTrigger className="w-full transition-all focus:ring-green-500 focus:border-green-500">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-green-500" />
                          <span>Public</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="unlisted">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-amber-500" />
                          <span>Unlisted</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <EyeOff className="h-4 w-4 text-red-500" />
                          <span>Private</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-zinc-500 mt-1">
                    {editedProject.visibility === 'public' && "Anyone can discover and view your project"}
                    {editedProject.visibility === 'unlisted' && "Only people with the link can view your project"}
                    {editedProject.visibility === 'private' && "Only you can view your project"}
                  </p>
                </div>
  
                <div className="pt-2 flex items-center justify-between">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setActiveTab("files")}
                    className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    <Upload className="h-4 w-4" />
                    Next: Update Files
                  </Button>
                  
                  <div className="text-xs text-zinc-500">Step 1 of 2</div>
                </div>
              </TabsContent>
  
              {/* Files Tab - Similar to the create form but with indicators for existing files */}
              <TabsContent value="files" className="mt-4 space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Project Files</CardTitle>
                    <CardDescription>Update or replace files in your project</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Project Files Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* Code File */}
                      <div className={`border rounded-lg p-3 text-center ${files.codeFile || project?.codeUrl ? 'border-blue-300 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20' : 'hover:border-zinc-400 dark:hover:border-zinc-600'} transition-all`}>
                        <label className="cursor-pointer flex flex-col items-center h-full">
                          <FileCode className={`h-8 w-8 mb-2 ${files.codeFile || project?.codeUrl ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'}`} />
                          <span className="text-sm font-medium mb-1">Code File</span>
                          {files.codeFile || project?.codeUrl ? (
                            <div className="mt-1 flex flex-col items-center">
                              <span className="text-xs text-blue-700 dark:text-blue-300 font-medium truncate max-w-full px-2">
                                {files.codeFile ? 
                                  (fileNames.code.length > 15 ? fileNames.code.slice(0, 12) + '...' : fileNames.code) : 
                                  'Current file'}
                              </span>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="mt-2 h-6 text-xs text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleRemoveFile('codeFile');
                                }}
                              >
                                <X className="h-3 w-3 mr-1" /> Remove
                              </Button>
                            </div>
                          ) : (
                            <div className="mt-1 flex items-center justify-center">
                              <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 rounded-full text-xs">
                                Upload
                              </span>
                              <input
                                type="file"
                                accept=".js,.py,.cpp,.java,.html,.css,.txt"
                                className="hidden"
                                onChange={(e) => handleFileChange(e, 'codeFile')}
                              />
                            </div>
                          )}
                        </label>
                      </div>
                      
                      {/* 3D Model File */}
                      <div className={`border rounded-lg p-3 text-center ${files.modelFile || project?.modelUrl ? 'border-cyan-300 bg-cyan-50 dark:border-cyan-900 dark:bg-cyan-900/20' : 'hover:border-zinc-400 dark:hover:border-zinc-600'} transition-all`}>
                        <label className="cursor-pointer flex flex-col items-center h-full">
                          <Box className={`h-8 w-8 mb-2 ${files.modelFile || project?.modelUrl ? 'text-cyan-600 dark:text-cyan-400' : 'text-zinc-400'}`} />
                          <span className="text-sm font-medium mb-1">3D Model</span>
                          {files.modelFile || project?.modelUrl ? (
                            <div className="mt-1 flex flex-col items-center">
                              <span className="text-xs text-cyan-700 dark:text-cyan-300 font-medium truncate max-w-full px-2">
                                {files.modelFile ? 
                                  (fileNames.model.length > 15 ? fileNames.model.slice(0, 12) + '...' : fileNames.model) : 
                                  'Current file'}
                              </span>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="mt-2 h-6 text-xs text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/30"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleRemoveFile('modelFile');
                                }}
                              >
                                <X className="h-3 w-3 mr-1" /> Remove
                              </Button>
                            </div>
                          ) : (
                            <div className="mt-1 flex items-center justify-center">
                              <span className="bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 px-3 py-1 rounded-full text-xs">
                                Upload
                              </span>
                              <input
                                type="file"
                                accept=".stl,.obj,.3mf"
                                className="hidden"
                                onChange={(e) => handleFileChange(e, 'modelFile')}
                              />
                            </div>
                          )}
                        </label>
                      </div>
                      
                      {/* PDF File */}
                      <div className={`border rounded-lg p-3 text-center ${files.pdfFile || project?.pdfUrl ? 'border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-900/20' : 'hover:border-zinc-400 dark:hover:border-zinc-600'} transition-all`}>
                        <label className="cursor-pointer flex flex-col items-center h-full">
                          <FileText className={`h-8 w-8 mb-2 ${files.pdfFile || project?.pdfUrl ? 'text-red-600 dark:text-red-400' : 'text-zinc-400'}`} />
                          <span className="text-sm font-medium mb-1">PDF File</span>
                          {files.pdfFile || project?.pdfUrl ? (
                            <div className="mt-1 flex flex-col items-center">
                              <span className="text-xs text-red-700 dark:text-red-300 font-medium truncate max-w-full px-2">
                                {files.pdfFile ? 
                                  (fileNames.pdf.length > 15 ? fileNames.pdf.slice(0, 12) + '...' : fileNames.pdf) : 
                                  'Current file'}
                              </span>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="mt-2 h-6 text-xs text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleRemoveFile('pdfFile');
                                }}
                              >
                                <X className="h-3 w-3 mr-1" /> Remove
                              </Button>
                            </div>
                          ) : (
                            <div className="mt-1 flex items-center justify-center">
                              <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-3 py-1 rounded-full text-xs">
                                Upload
                              </span>
                              <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={(e) => handleFileChange(e, 'pdfFile')}
                              />
                            </div>
                          )}
                        </label>
                      </div>
                      
                      {/* Video File */}
                      <div className={`border rounded-lg p-3 text-center ${files.videoFile || project?.videoUrl ? 'border-purple-300 bg-purple-50 dark:border-purple-900 dark:bg-purple-900/20' : 'hover:border-zinc-400 dark:hover:border-zinc-600'} transition-all`}>
                        <label className="cursor-pointer flex flex-col items-center h-full">
                          <Video className={`h-8 w-8 mb-2 ${files.videoFile || project?.videoUrl ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-400'}`} />
                          <span className="text-sm font-medium mb-1">Video</span>
                          {files.videoFile || project?.videoUrl ? (
                            <div className="mt-1 flex flex-col items-center">
                              <span className="text-xs text-purple-700 dark:text-purple-300 font-medium truncate max-w-full px-2">
                                {files.videoFile ? 
                                  (fileNames.video.length > 15 ? fileNames.video.slice(0, 12) + '...' : fileNames.video) : 
                                  'Current file'}
                              </span>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="mt-2 h-6 text-xs text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleRemoveFile('videoFile');
                                }}
                              >
                                <X className="h-3 w-3 mr-1" /> Remove
                              </Button>
                            </div>
                          ) : (
                            <div className="mt-1 flex items-center justify-center">
                              <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-3 py-1 rounded-full text-xs">
                                Upload
                              </span>
                              <input
                                type="file"
                                accept=".mp4,.mov,.avi"
                                className="hidden"
                                onChange={(e) => handleFileChange(e, 'videoFile')}
                              />
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                    
                    {/* Multi-file upload */}
                    <div className="mt-6">
                      <div className="border-t border-dashed pt-4">
                        <div className="flex flex-col items-center justify-center gap-2 p-4 border border-dashed rounded-lg bg-zinc-50 dark:bg-zinc-900/30">
                          <Upload className="h-8 w-8 text-zinc-400" />
                          <p className="text-sm text-center">
                            Drag and drop files here or
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('project-files').click()}
                            className="mt-1"
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
                     project?.thumbnailUrl || 
                     project?.codeUrl || 
                     project?.modelUrl || 
                     project?.pdfUrl || 
                     project?.videoUrl) && (
                      <div className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border">
                        <h4 className="font-medium text-sm mb-3 flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-1" />
                          Files
                        </h4>
                        <div className="space-y-2 text-sm">
                          {(thumbnailPreview || project?.thumbnailUrl) && !editedProject.removeThumbnail && (
                            <div className="flex items-center gap-2">
                              <div className="w-6 flex justify-center">
                                <ImageIcon className="h-4 w-4 text-zinc-400" />
                              </div>
                              <span className="text-zinc-500 dark:text-zinc-400">
                                {files.thumbnail ? fileNames.thumbnail : 'Current thumbnail'}
                              </span>
                            </div>
                          )}
                          {(fileNames.code || project?.codeUrl) && !editedProject.removeCodeFile && (
                            <div className="flex items-center gap-2">
                              <div className="w-6 flex justify-center">
                                <FileCode className="h-4 w-4 text-blue-500" />
                              </div>
                              <span className="text-zinc-700 dark:text-zinc-300">
                                {files.codeFile ? fileNames.code : 'Current code file'}
                              </span>
                            </div>
                          )}
                          {(fileNames.model || project?.modelUrl) && !editedProject.removeModelFile && (
                            <div className="flex items-center gap-2">
                              <div className="w-6 flex justify-center">
                                <Box className="h-4 w-4 text-cyan-500" />
                              </div>
                              <span className="text-zinc-700 dark:text-zinc-300">
                                {files.modelFile ? fileNames.model : 'Current model file'}
                              </span>
                            </div>
                          )}
                          {(fileNames.pdf || project?.pdfUrl) && !editedProject.removePdfFile && (
                            <div className="flex items-center gap-2">
                              <div className="w-6 flex justify-center">
                                <FileText className="h-4 w-4 text-red-500" />
                              </div>
                              <span className="text-zinc-700 dark:text-zinc-300">
                                {files.pdfFile ? fileNames.pdf : 'Current PDF file'}
                              </span>
                            </div>
                          )}
                          {(fileNames.video || project?.videoUrl) && !editedProject.removeVideoFile && (
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
  
              {/* Preview Tab */}
              <TabsContent value="preview" className="mt-4 space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Project Preview</CardTitle>
                    <CardDescription>Review your project details before updating</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Preview Thumbnail */}
                      {thumbnailPreview && !editedProject.removeThumbnail ? (
                        <div className="rounded-lg overflow-hidden border">
                          <img 
                            src={thumbnailPreview} 
                            alt="Project thumbnail" 
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      ) : (
                        <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800 h-48 flex items-center justify-center border">
                          <div className="text-zinc-400 text-center">
                            <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-sm">No thumbnail</p>
                          </div>
                        </div>
                      )}
  
                      {/* Project Info */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">
                            {editedProject.title || "Untitled Project"}
                          </h3>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {editedProject.description || "No description provided"}
                          </p>
                        </div>
  
                        <div className="flex flex-wrap gap-2">
                          {editedProject.tags.length > 0 ? (
                            editedProject.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
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
                        <h4 className="text-sm font-medium">Files Included</h4>
                        <div className="space-y-1 border rounded-lg p-3 bg-zinc-50 dark:bg-zinc-800/50">
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
            </Tabs>
  
            {/* Progress Bar */}
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5">
              <div 
                className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${formProgress}%` }}
              ></div>
            </div>
  
            {/* Submit Button */}
            <div className="flex justify-between gap-4 mt-6">
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Project
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      project and remove all associated files from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={handleDeleteProject}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
  
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={hideForm}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 transition-colors"
                  disabled={!isFormValid}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Update Project
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-zinc-200 dark:border-zinc-700 border-solid rounded-full animate-spin"></div>
              <div className="w-16 h-16 border-4 border-transparent border-t-green-600 dark:border-t-green-500 border-solid rounded-full absolute top-0 left-0 animate-spin" style={{ animationDuration: '1s' }}></div>
            </div>
            <p className="text-lg font-medium text-zinc-800 dark:text-zinc-200">Updating your project...</p>
            <p className="text-sm text-zinc-500">Uploading files and processing data</p>
          </div>
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
      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-zinc-200 dark:border-zinc-700 border-solid rounded-full animate-spin"></div>
            <div className="w-16 h-16 border-4 border-transparent border-t-green-600 dark:border-t-green-500 border-solid rounded-full absolute top-0 left-0 animate-spin" style={{ animationDuration: '1s' }}></div>
          </div>
          <p className="text-lg font-medium text-zinc-800 dark:text-zinc-200">Loading project...</p>
        </div>
      );
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
  
  export default EditProjectForm;