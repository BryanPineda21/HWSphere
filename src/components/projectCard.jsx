import React from 'react';
import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu';
import { 
  ImageIcon, 
  MoreVertical, 
  Pin, 
  Pencil, 
  Trash2,
  Calendar,
  FileCode,
  FileText,
  Video,
  Box
} from 'lucide-react';




import { toggleProjectPin } from '../api/projects.js';


const ProjectCard = ({ 
  project, 
  isOwnProfile = false, 
  onEdit,
  onDelete,
  onView,
  profileId,
  pinnedCount = 0
}) => {
  const queryClient = useQueryClient();
  
  // State for the edit project dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Toggle pin status mutation with optimistic updates
  const togglePinMutation = useMutation({
    mutationFn: ({ projectId, isPinned }) => toggleProjectPin(projectId, isPinned),
    // Optimistic update - update UI immediately before server confirms
    onMutate: async ({ projectId, isPinned }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(["projects", profileId]);
      
      // Snapshot the previous value
      const previousProjects = queryClient.getQueryData(["projects", profileId]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(["projects", profileId], (old) => {
        if (!old) return [];
        return old.map(p => 
          p.id === projectId ? { ...p, isPinned } : p
        );
      });
      
      // Return a context object with the previous value
      return { previousProjects };
    },
    // If the mutation fails, roll back to the previous value
    onError: (err, { isPinned }, context) => {
      queryClient.setQueryData(["projects", profileId], context.previousProjects);
      toast.error(`Failed to ${isPinned ? 'pin' : 'unpin'} project: ${err.message}`);
    },
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries(["projects", profileId]);
    },
    onSuccess: (data, { isPinned }) => {
      toast.success(isPinned ? 'Project pinned successfully' : 'Project unpinned successfully');
    }
  });

  // Handle toggle pin
  const handleTogglePin = () => {
    // Prevent pinning more than 4 projects
    if (!project.isPinned && pinnedCount >= 4) {
      toast.error('You can only pin up to 4 projects. Unpin a project to pin another.');
      return;
    }

    togglePinMutation.mutate({
      projectId: project.id,
      isPinned: !project.isPinned
    });
  };

  // Handle opening the edit dialog
  const handleOpenEditDialog = () => {
    setIsEditDialogOpen(true);
    // Still call the original onEdit if provided (for backward compatibility)
    if (onEdit) onEdit(project);
  };

  // Handle closing the edit dialog
  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
  };

  if (!project) return null;
  
  return (
    <>
      <Card 
        className={`group relative overflow-hidden hover:shadow-xl transition-all duration-300 bg-white dark:bg-zinc-900 border ${
          project.isPinned 
            ? 'border-green-400 dark:border-green-600' 
            : 'border-zinc-200 dark:border-zinc-800'
        }`}
      >
        {/* Project Thumbnail */}
        <div className="w-full h-40 bg-zinc-100 dark:bg-zinc-800 relative">
          {project.thumbnailUrl ? (
            <img 
              src={project.thumbnailUrl} 
              alt={project.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-zinc-300" />
            </div>
          )}
          
          {/* Pin indicator with improved visual - ribbon style */}
          {project.isPinned && (
            <div className="absolute top-0 right-0">
              <div className="w-0 h-0 
                border-t-[40px] border-r-[40px] 
                border-t-green-500 dark:border-t-green-600 border-r-transparent">
                <Pin className="absolute top-[-35px] right-[-30px] h-4 w-4 text-white transform -rotate-45" />
              </div>
            </div>
          )}
          
          {/* File type indicators */}
          <div className="absolute bottom-2 left-2 flex gap-1">
            {project.modelUrl && (
              <div className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-full p-1" title="3D Model">
                <Box className="h-3 w-3" />
              </div>
            )}
            {(project.codeUrl || project.codeContent) && (
              <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full p-1" title="Source Code">
                <FileCode className="h-3 w-3" />
              </div>
            )}
            {project.pdfUrl && (
              <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full p-1" title="PDF Document">
                <FileText className="h-3 w-3" />
              </div>
            )}
            {project.videoUrl && (
              <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full p-1" title="Video">
                <Video className="h-3 w-3" />
              </div>
            )}
          </div>
          
          {/* Project Actions - Only show if viewing own profile */}
          {isOwnProfile && (
            <div className="absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-zinc-700">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={handleTogglePin}
                    disabled={!project.isPinned && pinnedCount >= 4}
                    className={project.isPinned ? "text-green-600 dark:text-green-400" : ""}
                  >
                    <Pin className="h-4 w-4 mr-2" />
                    {project.isPinned ? 'Unpin Project' : 'Pin Project'}
                    {!project.isPinned && pinnedCount >= 4 && (
                      <span className="ml-2 text-xs text-zinc-500">(4/4 used)</span>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleOpenEditDialog}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => onDelete && onDelete(project.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <CardHeader className="pb-2">
          {/* Project Header */}
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">
              {project.title}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center mt-1">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-2 mb-2">
            {project.description || "No description provided"}
          </p>
          
          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {project.tags.filter(Boolean).map((tag, index) => (
                <span 
                  key={index} 
                  className="inline-block bg-zinc-100 dark:bg-zinc-800 rounded-full px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-0 flex justify-between items-center">
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => onView && onView(project.id)}
          >
            View Project
          </Button>
          
          {/* Pin/Unpin quick action button */}
          {isOwnProfile && (
            <Button
              variant="ghost"
              size="icon"
              className={`ml-2 ${
                project.isPinned 
                  ? 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20' 
                  : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
              }`}
              onClick={handleTogglePin}
              disabled={!project.isPinned && pinnedCount >= 4}
              title={project.isPinned ? 'Unpin Project' : 'Pin Project'}
            >
              <Pin className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>

    </>
  );
};

export default ProjectCard;