import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProject } from "../api/projects.js"; 
import { useAuth } from "../context/AuthContext.jsx"; 

// Importing existing EditProjectForm component
import EditProjectForm from "../projectForms/editProjectForm.jsx";

// Importing UI components
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const EditProjectRoute = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();
  
  // Fetch the project data
  const { data: project, isLoading, isError, error } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProject(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Handle success (navigation back to project page)
  const handleSuccess = (data) => {
    if (data && data.deleted) {
      // If project was deleted, navigate to user profile
      navigate(`/u/${userData?.username}`);
    } else {
      // Otherwise navigate back to the project view
      navigate(`/project/${projectId}`);
    }
  };

  // Handle close (cancel)
  const handleClose = () => {
    navigate(`/project/${projectId}`);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 mt-20">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 mt-20">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error?.message || "Failed to load project data"}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Once project data is loaded, render the EditProjectForm with the project
  return (
    <EditProjectForm 
      project={project} 
      isDialog={false} 
      onSuccess={handleSuccess} 
      onClose={handleClose} 
    />
  );
};

export default EditProjectRoute;