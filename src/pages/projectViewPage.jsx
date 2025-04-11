import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getProject, deleteProject } from '../api/projects';
import ProjectHeader from '@/components/ProjectComponents/ProjectUI/ProjectHeader';
import ProjectTabs from '@/components/ProjectComponents/ProjectUI/ProjectTabs';
import ProjectActions from '@/components/ProjectComponents/ProjectUI/ProjectActions';
import ProjectSkeleton from '@/components/ProjectComponents/ProjectSkeleton';
import ErrorAlert from '@/components/ProjectComponents/ErrorAlert';
import { Card, CardContent } from '@/components/ui/card'; 
import '@/custom-styles.css'; // Ensure custom styles are imported




const ProjectPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: project, isLoading, isError, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: false,
    enabled: !!projectId,
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });

  // Function to handle project deletion
  const handleDeleteProject = async () => {
    try {
      await deleteProject(projectId);
      toast.success('Project deleted successfully');
      // Navigate back to the user's profile or projects list
      navigate('/');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project: ' + error.message);
    }
  };

  // Function to navigate to edit project page
  const navigateToEditProject = () => {
    navigate(`/edit-project/${projectId}`);
  };

  if (isLoading) return <ProjectSkeleton />;
  if (isError) return <ErrorAlert message={error?.message || 'Error fetching project'} />;
  if (!project) return <ErrorAlert message="Project not found" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/90 text-foreground pt-16 md:pt-20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Project Details */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-accent/20 bg-card/50 backdrop-blur-sm shadow-lg h-fit sticky top-20 transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-6 sm:p-8">
                <ProjectHeader project={project} />
                
                {/* Edit Project Button */}
                <div className="mt-6">
                  <ProjectActions 
                    projectId={projectId}
                    onEdit={navigateToEditProject}
                    onDelete={handleDeleteProject}
                    isDeleteDialogOpen={isDeleteDialogOpen}
                    setIsDeleteDialogOpen={setIsDeleteDialogOpen}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Interactive Content */}
          <div className="lg:col-span-8">
            <Card className="border-accent/20 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <ProjectTabs project={project} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;