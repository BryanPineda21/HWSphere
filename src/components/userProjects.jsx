import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

//-----------------THREE JS IMPORTS-----------------

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";


// -----------------UI COMPONENTS-----------------

import { getUserProjects, deleteProject, toggleProjectPin } from "../api/projects.js";


import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon, Loader2, AlertTriangle, Pin, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { useParams } from "react-router-dom";
import { toast } from "sonner";

import ProjectCard from "./projectCard.jsx";
import CreateProjectForm from "../projectForms/createProjectForm.jsx";





//------------------User Projects-----------------



const UserProjects = () => {
  // Get username from route params
  const { profileId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userData, currentUser } = useAuth();
  
  // Project to edit
  const [projectToEdit, setProjectToEdit] = useState(null);
  
  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    projectId: null
  });

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Check if viewing own profile (using username or UID)
  const isOwnProfile = currentUser && (
    currentUser.uid === profileId || 
    (currentUser.username && currentUser.username === profileId)
  );

  // Fetch projects with react-query
  const { 
    data: projects = [], 
    isLoading, 
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["projects", profileId],
    queryFn: () => getUserProjects(profileId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!profileId, // Only run query if profileId exists
    retry: 1
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: (projectId) => deleteProject(projectId),
    onSuccess: () => {
      // Immediately update the cache to remove the deleted project
      queryClient.setQueryData(["projects", profileId], (oldData) => {
        if (!oldData) return [];
        return oldData.filter(project => project.id !== deleteConfirmation.projectId);
      });
      
      // Then invalidate the query to trigger a background refetch
      queryClient.invalidateQueries(["projects", profileId]);
      
      closeDeleteConfirmation();
      toast.success('Project deleted successfully');
    },
    onError: (error) => {
      toast.error(`Delete failed: ${error.message}`);
    }
  });

  // Toggle pin mutation
  const togglePinMutation = useMutation({
    mutationFn: ({ projectId, isPinned }) => toggleProjectPin(projectId, isPinned),
    onMutate: async ({ projectId, isPinned }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(["projects", profileId]);
      
      // Snapshot the previous value
      const previousProjects = queryClient.getQueryData(["projects", profileId]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(["projects", profileId], (old) => {
        if (!old) return [];
        return old.map(project => 
          project.id === projectId ? { ...project, isPinned } : project
        );
      });
      
      // Return a context object with the previous value
      return { previousProjects };
    },
    onError: (err, { projectId, isPinned }, context) => {
      // If the mutation fails, rollback to the previous value
      queryClient.setQueryData(["projects", profileId], context.previousProjects);
      toast.error(`Failed to ${isPinned ? 'pin' : 'unpin'} project: ${err.message}`);
    },
    onSettled: () => {
      // Always refetch after error or success to make sure our local data is correct
      queryClient.invalidateQueries(["projects", profileId]);
    },
    onSuccess: (_, { isPinned }) => {
      toast.success(`Project ${isPinned ? 'pinned' : 'unpinned'} successfully`);
    }
  });

  // Handle pin/unpin
  const handleTogglePin = (projectId, currentPinStatus) => {
    // Check if we can pin another project
    const pinnedCount = projects.filter(p => p.isPinned).length;
    
    if (!currentPinStatus && pinnedCount >= 4) {
      toast.error('You can only pin up to 4 projects');
      return;
    }
    
    togglePinMutation.mutate({ 
      projectId, 
      isPinned: !currentPinStatus 
    });
  };

  // Open delete confirmation
  const openDeleteConfirmation = (projectId) => {
    setDeleteConfirmation({
      isOpen: true,
      projectId
    });
  };

  // Close delete confirmation
  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({
      isOpen: false,
      projectId: null
    });
  };

  // Handle delete confirm
  const handleDeleteConfirm = () => {
    if (deleteConfirmation.projectId) {
      deleteProjectMutation.mutate(deleteConfirmation.projectId);
    }
  };

  // Handle edit project
  const handleEditProject = (project) => {
    setProjectToEdit(project);
    setIsEditDialogOpen(true);
  };

  // Handle edit success
  const handleEditSuccess = (updatedProject) => {
    // Optimistically update the cache with the updated project
    queryClient.setQueryData(["projects", profileId], (oldData) => {
      if (!oldData) return [];
      return oldData.map(p => p.id === updatedProject.id ? updatedProject : p);
    });
    
    // Then invalidate to trigger a background refetch
    queryClient.invalidateQueries(["projects", profileId]);
    
    setIsEditDialogOpen(false);
    setProjectToEdit(null);
    toast.success('Project updated successfully');
  };

  // Filter pinned and unpinned projects
  const pinnedProjects = projects.filter(project => project.isPinned);
  const unpinnedProjects = projects.filter(project => !project.isPinned);

  // Display loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          <p className="text-sm text-zinc-500">Loading projects...</p>
        </div>
      </div>
    );
  }

  // Display error
  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="text-red-500 font-medium">Error loading projects</p>
          <p className="text-zinc-600">{error?.message || 'Something went wrong'}</p>
          <Button 
            onClick={() => refetch()}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Create Project Button */}
      {isOwnProfile && (
        <div className="flex justify-between items-center sticky top-0 z-10 bg-white dark:bg-zinc-950 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
            {projects.length > 0 ? 'Your Projects' : 'Create Your First Project'}
          </h2>
          
          {/* Create Project Button */}
          <CreateProjectForm 
            isDialog={true} 
            onSuccess={(newProject) => {
              // Optimistically add the new project to the cache
              queryClient.setQueryData(["projects", profileId], (oldData) => {
                if (!oldData) return [newProject];
                return [...oldData, newProject];
              });
              
              // Then invalidate to trigger a background refetch
              queryClient.invalidateQueries(["projects", profileId]);
            }}
          />
        </div>
      )}

      {/* Display empty state */}
      {projects.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <ImageIcon className="h-16 w-16 text-zinc-300 mb-4" />
          <h3 className="text-xl font-medium text-zinc-700 dark:text-zinc-300">No projects yet</h3>
          <p className="text-zinc-500 max-w-md mt-2 mb-6">
            {isOwnProfile 
              ? "Click the 'New Project' button to get started" 
              : "This user hasn't created any projects yet"}
          </p>
          
          {/* Secondary Create Button for Empty State */}
          {isOwnProfile && (
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => navigate(`/u/${profileId}/projects/new`)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Your First Project
            </Button>
          )}
        </div>
      )}

      {/* Projects Display */}
      {projects.length > 0 && (
        isOwnProfile ? (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Projects</TabsTrigger>
              <TabsTrigger value="pinned">Pinned Projects</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-8">
              {/* Pinned Projects Section */}
              {pinnedProjects.length > 0 && (
                <div>
                  <div className="flex items-center mb-4">
                    <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 flex items-center">
                      <Pin className="h-4 w-4 mr-2 text-green-600" />
                      Pinned Projects
                    </h2>
                    <Badge variant="outline" className="ml-2 px-2 py-0 text-xs">
                      {pinnedProjects.length}/4
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {pinnedProjects.map(project => (
                      <ProjectCard 
                        key={project.id}
                        project={project}
                        isOwnProfile={true}
                        onEdit={handleEditProject}
                        onDelete={openDeleteConfirmation}
                        onView={(id) => navigate(`/project/${id}`)}
                        profileId={profileId}
                        pinnedCount={pinnedProjects.length}
                        onTogglePin={() => handleTogglePin(project.id, project.isPinned)}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* All Other Projects Section */}
              {unpinnedProjects.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-4">
                    {pinnedProjects.length > 0 ? 'Other Projects' : 'All Projects'}
                  </h2>
                  
                  <ScrollArea className="h-[600px] pr-4 -mr-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
                      {unpinnedProjects.map(project => (
                        <ProjectCard 
                          key={project.id}
                          project={project}
                          isOwnProfile={true}
                          onEdit={handleEditProject}
                          onDelete={openDeleteConfirmation}
                          onView={(id) => navigate(`/project/${id}`)}
                          profileId={profileId}
                          pinnedCount={pinnedProjects.length}
                          onTogglePin={() => handleTogglePin(project.id, project.isPinned)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="pinned">
              {pinnedProjects.length > 0 ? (
                <div>
                  <div className="flex items-center mb-4">
                    <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 flex items-center">
                      <Pin className="h-4 w-4 mr-2 text-green-600" />
                      Pinned Projects
                    </h2>
                    <Badge variant="outline" className="ml-2 px-2 py-0 text-xs">
                      {pinnedProjects.length}/4
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {pinnedProjects.map(project => (
                      <ProjectCard 
                        key={project.id}
                        project={project}
                        isOwnProfile={true}
                        onEdit={handleEditProject}
                        onDelete={openDeleteConfirmation}
                        onView={(id) => navigate(`/project/${id}`)}
                        profileId={profileId}
                        pinnedCount={pinnedProjects.length}
                        onTogglePin={() => handleTogglePin(project.id, project.isPinned)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Pin className="h-12 w-12 text-zinc-300 mb-4" />
                  <h3 className="text-xl font-medium text-zinc-700 dark:text-zinc-300">No pinned projects</h3>
                  <p className="text-zinc-500 max-w-md mt-2">
                    Pin up to 4 projects to keep them at the top for easy access
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          // Simpler view for other users' profiles
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map(project => (
                <ProjectCard 
                  key={project.id}
                  project={project}
                  isOwnProfile={false}
                  onView={(id) => navigate(`/project/${id}`)}
                  profileId={profileId}
                />
              ))}
            </div>
          </div>
        )
      )}

      {/* Edit project dialog */}
      {projectToEdit && (
        <EditProjectForm
          project={projectToEdit}
          isDialog={true}
          onSuccess={handleEditSuccess}
          onClose={() => {
            setProjectToEdit(null);
            setIsEditDialogOpen(false);
          }}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmation.isOpen}
        onOpenChange={(open) => !open && closeDeleteConfirmation()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={closeDeleteConfirmation}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteConfirm}
              disabled={deleteProjectMutation.isPending}
            >
              {deleteProjectMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : 'Delete Project'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserProjects;