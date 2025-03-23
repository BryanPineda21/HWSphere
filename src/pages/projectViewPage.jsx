import React, { Suspense, useState, useEffect, useRef} from 'react';
import {useNavigate,useParams} from 'react-router-dom';


// Import API functions and Tanstack Query hooks
import { getProject,deleteProject } from '../api/projects';
import { useQueryClient,useQuery } from '@tanstack/react-query';



// Highlight.js for syntax highlighting
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css'; // Choose a style you prefer




import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { Canvas, useThree, useFrame} from '@react-three/fiber'
import { Html, OrbitControls, Text} from '@react-three/drei'
import { Leva, useControls } from 'leva';


// Import UI components 
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Code, Box, Pencil, FileText, Video,Trash2} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from 'react-error-boundary';
import { Badge } from '../components/ui/badge';
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

// Import Toast for notifications
import { toast } from 'sonner';


// Import EditProjectForm component, this is a form to edit project details and update the project
import EditProjectForm from '../projectForms/editProjectForm.jsx';



// Separate STL Model component
const ModelStlView = ({url} ) => {
  const [geom, setGeom] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const ref = useRef();
  const { gl } = useThree();

  // Add back the controls for clipping and appearance
  const { clip, clipPosition, wireframe, color, metalness, roughness } = useControls({
    clip: false,
    clipPosition: { value: 0, min: -5, max: 5, step: 0.1 },
    wireframe: false,
    color: '#808080',
    metalness: { value: 0.5, min: 0, max: 1 },
    roughness: { value: 0.5, min: 0, max: 1 }
  });

  // Create clipping plane
  const clippingPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0.8);

  useEffect(() => {
    if (!url) return;

    const loader = new STLLoader();
    setLoading(true);
    setError(null);

    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch model');
        return response.blob();
      })
      .then(blob => {
        if (blob.size > 100 * 1024 * 1024) {
          throw new Error('Model file is too large');
        }
        return blob.arrayBuffer();
      })
      .then(buffer => {
        try {
          const geometry = loader.parse(buffer);
          
          geometry.computeBoundingBox();
          const box = geometry.boundingBox;
          
          const center = new THREE.Vector3();
          box.getCenter(center);
          const size = new THREE.Vector3();
          box.getSize(size);
          
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 10 / maxDim;
          
          geometry.translate(-center.x, -center.y, -center.z);
          geometry.scale(scale, scale, scale);
          geometry.computeVertexNormals();
          
          setGeom(geometry);
          setLoading(false);
        } catch (err) {
          console.error('Error processing STL:', err);
          setError('Error processing 3D model');
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Error loading STL:', err);
        setError(err.message || 'Failed to load 3D model');
        setLoading(false);
      });

    return () => {
      if (geom) {
        geom.dispose();
      }
    };
  }, [url]);

  // Enable clipping planes in the renderer
  useEffect(() => {
    if (gl) {
      gl.localClippingEnabled = clip;
    }
  }, [clip, gl]);

  // Update clipping plane position
  useFrame(() => {
    if (ref.current && clip) {
      clippingPlane.constant = clipPosition;
    }
  });

  if (loading) {
    return (
      <Text color="white" fontSize={1} maxWidth={200} textAlign="center">
        Loading model...
      </Text>
    );
  }

  if (error) {
    return (
      <Text color="red" fontSize={1} maxWidth={200} textAlign="center">
        {error}
      </Text>
    );
  }

  return (
    <>
      {geom && (
        <mesh ref={ref}>
          <primitive object={geom} attach="geometry" />
          <meshPhysicalMaterial
            color={color}
            wireframe={wireframe}
            metalness={metalness}
            roughness={roughness}
            side={THREE.DoubleSide}
            clippingPlanes={clip ? [clippingPlane] : []}
          />
        </mesh>
      )}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />
      <hemisphereLight intensity={0.3} />
    </>
  );
};

// 3D Model Viewer component
const ModelViewer = ({ modelUrl }) => {
  if (!modelUrl) {
    return (
      <div className="h-full w-full rounded-lg bg-zinc-900 flex items-center justify-center text-white">
        No 3D model available
      </div>
    );
  }

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden bg-zinc-900">
      <ErrorBoundary fallback={
        <div className="flex h-full w-full items-center justify-center text-white">
          Error loading 3D viewer
        </div>
      }>
        <Canvas
          camera={{ position: [30, -90, 40], fov: 5 }}
          gl={{ preserveDrawingBuffer: true }}
          linear
        >
          <Suspense fallback={
            <Html center>
              <div className="text-white">Loading model...</div>
            </Html>
          }>
            <ModelStlView url={modelUrl} />
            <OrbitControls 
              enableDamping
              dampingFactor={0.05}
              rotateSpeed={0.5}
              zoomSpeed={0.5}
            />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
      <div className="absolute top-4 right-4 z-10">
        <Leva titleBar={false} fill hideRoot />
      </div>
    </div>
  );
};



// Code Viewer component with Highlight.js
const CodeViewer = ({ code }) => {
  const codeRef = useRef(null);

  useEffect(() => {
    if (codeRef.current && code) {
      hljs.highlightElement(codeRef.current);
    }
  }, [code]);

  if (!code) {
    return (
      <div className="h-full w-full rounded-lg bg-zinc-900 flex items-center justify-center text-white">
        No code content available
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-lg bg-zinc-900 overflow-hidden">
      <pre className="h-full overflow-auto m-0 p-4">
        <code ref={codeRef} className="text-sm md:text-base">
          {code}
        </code>
      </pre>
    </div>
  );
};

// Code Content component that handles fetching code from URLs if needed
const CodeContent = ({ project }) => {
  const [codeContent, setCodeContent] = useState(project.codeContent || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If we already have code content, use it
    if (project.codeContent) {
      setCodeContent(project.codeContent);
      return;
    }

    // If we have a codeUrl but no content, fetch it
    if (project.codeUrl && !project.codeContent) {
      setIsLoading(true);
      setError(null);
      
      fetch(project.codeUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch code content');
          }
          return response.text();
        })
        .then(data => {
          setCodeContent(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching code:', err);
          setError(err.message || 'Failed to load code content');
          setIsLoading(false);
        });
    }
  }, [project.codeContent, project.codeUrl]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-white bg-zinc-800 rounded-lg">
        Loading code content...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-white bg-zinc-800 rounded-lg">
        {error}
      </div>
    );
  }

  return <CodeViewer code={codeContent} />;
};

// PDF Viewer component
const PdfViewer = ({ pdfUrl }) => {
  if (!pdfUrl) {
    return (
      <div className="h-full w-full rounded-lg bg-zinc-900 flex items-center justify-center text-white">
        No PDF document available
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-lg bg-zinc-900 overflow-hidden">
      <object
        data={pdfUrl}
        type="application/pdf"
        className="w-full h-full"
      >
        <div className="flex h-full w-full items-center justify-center text-white">
          <p>Unable to display PDF. <a href={pdfUrl} className="text-emerald-400 underline" target="_blank" rel="noopener noreferrer">Download</a> instead.</p>
        </div>
      </object>
    </div>
  );
};

// Video Player component
const VideoPlayer = ({ videoUrl }) => {
  if (!videoUrl) {
    return (
      <div className="h-full w-full rounded-lg bg-zinc-900 flex items-center justify-center text-white">
        No video available
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-lg bg-zinc-900 overflow-hidden">
      <video
        className="w-full h-full"
        controls
        controlsList="nodownload"
        playsInline
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

// Loading skeleton component
const ProjectSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-12 w-3/4" />
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-[600px] w-full" />
  </div>
);

// Error component
const ErrorAlert = ({ message }) => (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

// Main ProjectView component
const ProjectPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

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

  // Function to handle successful project update
  const handleProjectUpdate = (updatedProject) => {
    // Close the edit form
    setIsEditFormOpen(false);
    
    // Invalidate queries to refresh data
    queryClient.invalidateQueries(['project', projectId]);
    
    // Show success message
    toast.success('Project updated successfully');
  };


  // Function to navigate to edit project page
  const navigateToEditProject = () => {
    navigate(`/edit-project/${projectId}`);
  };


  if (isLoading) return <ProjectSkeleton />;
  if (isError) return <ErrorAlert message={error?.message || 'Error fetching project'} />;
  if (!project) return <ErrorAlert message="Project not found" />;

  // Function to get badge color based on tag name
  const getBadgeStyles = (tag) => {
    const tagMap = {
      'c++': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'python': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      'javascript': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      'stl': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'engineering': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'open source': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'research': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
      'education': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    };
    
    return tagMap[tag.toLowerCase()] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-900 text-white pt-16 md:pt-20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Project Details */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none bg-zinc-900/50 backdrop-blur-sm shadow-lg h-fit sticky top-20 transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#90EE90] via-[#66CDAA] to-[#32CD32] bg-clip-text text-transparent transition-opacity hover:opacity-90">
                    {project.title}
                  </h1>
                  <div className="flex gap-2">
                    {/* Delete Project Button */}
                    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-zinc-400 hover:text-red-400 hover:bg-zinc-800/50"
                          aria-label="Delete project"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription className="text-zinc-400">
                            This action cannot be undone. This will permanently delete your
                            project and remove all associated files from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={handleDeleteProject}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <p className="text-zinc-300 text-sm sm:text-base leading-relaxed font-geist font-light">
                  {project.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {project.tags && project.tags.length > 0 ? (
                    project.tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className={getBadgeStyles(tag)}
                      >
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <>
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        Engineering
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                        C++
                      </Badge>
                    </>
                  )}
                </div>
                
                {project.createdAt && (
                  <div className="mt-6 text-zinc-400 text-sm">
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                )}
                
                {project.updatedAt && (
                  <div className="text-zinc-400 text-sm">
                    Last updated: {new Date(project.updatedAt).toLocaleDateString()}
                  </div>
                )}

                {/* Edit Project Button - More prominent and moved to its own section */}
                <div className="mt-6">
                  <Button 
                    variant="outline" 
                    className="w-full bg-zinc-800/50 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 transition-all"
                    onClick={navigateToEditProject}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
    

          {/* Right Column: Interactive Content */}
          <div className="lg:col-span-8">
            <Card className="border-none bg-zinc-900/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <Tabs defaultValue="model" className="space-y-4">
                  <TabsList className="bg-zinc-800">
                    {project.modelUrl && (
                      <TabsTrigger value="model" className="data-[state=active]:bg-[#008000]">
                        <Box className="w-4 h-4 mr-2" />
                        3D Model
                      </TabsTrigger>
                    )}
                    
                    {(project.codeContent || project.codeUrl) && (
                      <TabsTrigger value="code" className="data-[state=active]:bg-[#008000]">
                        <Code className="w-4 h-4 mr-2" />
                        Source Code
                      </TabsTrigger>
                    )}
                    
                    {project.pdfUrl && (
                      <TabsTrigger value="pdf" className="data-[state=active]:bg-[#008000]">
                        <FileText className="w-4 h-4 mr-2" />
                        PDF Document
                      </TabsTrigger>
                    )}
                    
                    {project.videoUrl && (
                      <TabsTrigger value="video" className="data-[state=active]:bg-[#008000]">
                        <Video className="w-4 h-4 mr-2" />
                        Video
                      </TabsTrigger>
                    )}
                  </TabsList>

                  {project.modelUrl && (
                    <TabsContent value="model" className="mt-4 h-[300px] md:h-[400px] lg:h-[600px]">
                      <ModelViewer modelUrl={project.modelUrl} />
                    </TabsContent>
                  )}

                  {(project.codeContent || project.codeUrl) && (
                    <TabsContent value="code" className="mt-4 h-[300px] md:h-[400px] lg:h-[600px]">
                      <CodeContent project={project} />
                    </TabsContent>
                  )}

                  {project.pdfUrl && (
                    <TabsContent value="pdf" className="mt-4 h-[300px] md:h-[400px] lg:h-[600px]">
                      <PdfViewer pdfUrl={project.pdfUrl} />
                    </TabsContent>
                  )}

                  {project.videoUrl && (
                    <TabsContent value="video" className="mt-4 h-[300px] md:h-[400px] lg:h-[600px]">
                      <VideoPlayer videoUrl={project.videoUrl} />
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;