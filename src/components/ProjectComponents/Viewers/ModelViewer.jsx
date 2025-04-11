
import React, { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Html, OrbitControls, Text, Environment } from '@react-three/drei';
import { Leva, useControls, LevaPanel } from 'leva';
import { ErrorBoundary } from 'react-error-boundary';
import { useTheme } from '@/components/ui/themeProvider';
import { motion } from 'framer-motion';
import { Loader2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

// Custom hook for window size
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });
  
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    handleResize(); // Call once for initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return windowSize;
};

// Camera setup component
const CameraSetup = ({ boundingSphere }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    if (boundingSphere) {
      const { center, radius } = boundingSphere;
      
      // Position camera at a good viewing angle
      const distance = radius * 2.5;
      camera.position.set(distance, distance, distance);
      camera.lookAt(center);
      camera.updateProjectionMatrix();
    }
  }, [camera, boundingSphere]);
  
  return null;
};

// Enhanced lighting setup component
const EnhancedLighting = () => {
  return (
    <>
      {/* Base ambient light for overall illumination */}
      <ambientLight intensity={0.4} />
      
      {/* Main key light */}
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.8} 
        color="#ffffff"
      />
      
      {/* Fill light for shadows */}
      <directionalLight 
        position={[-10, 8, -10]} 
        intensity={0.3} 
        color="#ccf0ff"
      />
      
      {/* Rim light for highlights */}
      <spotLight 
        position={[0, 15, 0]} 
        intensity={0.5} 
        angle={0.5} 
        penumbra={1}
      />
      
      {/* Bottom fill light */}
      <pointLight 
        position={[0, -10, 0]} 
        intensity={0.2} 
        color="#ffe0cc"
      />
      
      {/* Use an HDRI environment for realistic reflections */}
      <Environment preset="studio" />
    </>
  );
};

// Responsive controls component for mobile/desktop
const ResponsiveControls = ({ children }) => {
  const { width } = useWindowSize();
  const isMobile = width < 768;
  
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            size="icon" 
            variant="outline" 
            className="fixed bottom-4 right-4 z-20 rounded-full shadow-lg"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="p-0">
          <div className="p-4">
            <LevaPanel fill flat titleBar={false} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }
  
  return (
    <div className="absolute top-4 right-4 z-10">
      <Leva flat titleBar={false} fill />
    </div>
  );
};

// Simplified STL Model component
const ModelStlView = ({ url }) => {
  const [geom, setGeom] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [boundingSphere, setBoundingSphere] = useState(null);
  const ref = useRef();
  const { gl, camera } = useThree();
  const { isDark } = useTheme();
  const controlsRef = useRef();

  // Default color based on theme - will be used as fallback
  const defaultColor = isDark ? '#c0c0c0' : '#707070';
  
  // Material properties - not in controls
  const materialProps = {
    roughness: 0.4,
    metalness: 0.6,
    envMapIntensity: 1.2,
    clearcoat: 0.2,
    clearcoatRoughness: 0.2,
  };

  // Updated controls - basic toggles only
  const { wireframe, xrayMode } = useControls({
    wireframe: false,
    xrayMode: false
  });

  // Keep clipping controls
  const { clip, clipPosition } = useControls('Advanced', {
    clip: false,
    clipPosition: { value: 0, min: -5, max: 5, step: 0.1 }
  });

  // Create clipping plane
  const clippingPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0.8);

  // Dynamic camera light that follows viewing angle
  const CameraLight = () => {
    const light = useRef();
    useFrame(() => {
      if (light.current) {
        light.current.position.copy(camera.position);
      }
    });
    return <pointLight ref={light} intensity={0.4} distance={50} />;
  };

  useEffect(() => {
    if (!url) return;

    const loader = new STLLoader();
    setLoading(true);
    setError(null);

    // Use AbortController for better fetch management
    const controller = new AbortController();
    const signal = controller.signal;

    // Cache mechanism - check if this model is already in sessionStorage
    const cacheKey = `model-${url}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const cachedBuffer = Uint8Array.from(atob(cachedData), c => c.charCodeAt(0)).buffer;
        const geometry = loader.parse(cachedBuffer);
        processGeometry(geometry);
        return;
      } catch (err) {
        console.warn('Could not use cached model, fetching fresh copy');
        // Continue with fetch if cache failed
      }
    }

    fetch(url, { signal })
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
          
          // Try to cache the model for future use
          try {
            const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
            sessionStorage.setItem(cacheKey, base64);
          } catch (err) {
            console.warn('Could not cache model:', err);
          }
          
          processGeometry(geometry);
        } catch (err) {
          console.error('Error processing STL:', err);
          setError('Error processing 3D model');
          setLoading(false);
        }
      })
      .catch(err => {
        if (!signal.aborted) {
          console.error('Error loading STL:', err);
          setError(err.message || 'Failed to load 3D model');
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
      if (geom) {
        geom.dispose();
      }
    };
  }, [url]);

  // Helper function to process geometry
  const processGeometry = useCallback((geometry) => {
    // Center and scale the geometry
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
    
    // Better normal calculation for improved lighting
    geometry.computeVertexNormals();
    
    // Check for vertex colors
    const hasVertexColors = Boolean(
      geometry.attributes && 
      geometry.attributes.color && 
      geometry.attributes.color.count > 0
    );
    
    // Store this as a property on the geometry for later use
    geometry.userData.hasVertexColors = hasVertexColors;
    
    // Compute bounding sphere for camera positioning
    geometry.computeBoundingSphere();
    const boundingSphere = {
      center: geometry.boundingSphere.center.clone(),
      radius: geometry.boundingSphere.radius
    };
    
    setBoundingSphere(boundingSphere);
    setGeom(geometry);
    setLoading(false);
  }, []);

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
    
    // Update controls target if needed
    if (controlsRef.current && boundingSphere) {
      controlsRef.current.target.copy(boundingSphere.center);
    }
  });

  if (loading) {
    return (
      <Html center>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center space-x-2 p-3 bg-background/80 backdrop-blur-sm rounded-md shadow-md"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-5 w-5 text-primary" />
          </motion.div>
          <span className="text-sm font-medium text-foreground">Processing model...</span>
        </motion.div>
      </Html>
    );
  }

  if (error) {
    return (
      <Text color="red" fontSize={1} maxWidth={200} textAlign="center">
        {error}
      </Text>
    );
  }

  // Material properties for different modes
  const getMaterialProps = () => {
    if (xrayMode) {
      return {
        transparent: true,
        opacity: 0.65,
        emissive: new THREE.Color(0x3333ff),
        emissiveIntensity: 0.2,
        depthWrite: false,  // Helps with better x-ray rendering
        side: THREE.DoubleSide
      };
    }
    return {
      transparent: false,
      side: THREE.DoubleSide,
      ...materialProps // Apply our custom material properties
    };
  };

  return (
    <>
      {boundingSphere && <CameraSetup boundingSphere={boundingSphere} />}
      
      {geom && (
        <mesh ref={ref}>
          <primitive object={geom} attach="geometry" />
          <meshPhysicalMaterial
            color={geom.userData.hasVertexColors ? undefined : defaultColor}
            vertexColors={geom.userData.hasVertexColors}
            wireframe={wireframe}
            clippingPlanes={clip ? [clippingPlane] : []}
            {...getMaterialProps()}
          />
        </mesh>
      )}
      
      <EnhancedLighting />
      <CameraLight />
      
      <OrbitControls 
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={1.5}
        zoomSpeed={0.8}
        minDistance={2}
        maxDistance={100}
      />
    </>
  );
};

// Main Model Viewer component
const ModelViewer = ({ modelUrl }) => {
  const { isDark } = useTheme();
  
  if (!modelUrl) {
    return (
      <div className="h-full w-full rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
        No 3D model available
      </div>
    );
  }

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden bg-gradient-to-b from-background to-muted">
      <ErrorBoundary fallback={
        <div className="flex h-full w-full items-center justify-center text-foreground">
          Error loading 3D viewer
        </div>
      }>
        <Canvas
          camera={{ 
            position: [15, 15, 15], 
            fov: 45,
            near: 0.1,
            far: 1000
          }}
          gl={{ 
            preserveDrawingBuffer: true,
            antialias: true,
            alpha: true,
            logarithmicDepthBuffer: true, 
          }}
          linear
          className="w-full h-full"
        >
          <Suspense fallback={
            <Html center>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center p-4 bg-background/90 backdrop-blur-sm rounded-lg shadow-lg border border-border"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="h-8 w-8 text-primary" />
                </motion.div>
                <motion.p 
                  className="mt-2 text-sm font-medium text-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Loading 3D Model...
                </motion.p>
              </motion.div>
            </Html>
          }>
            <ModelStlView url={modelUrl} />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
      
      {/* Responsive controls that adapt to screen size */}
      <ResponsiveControls />
    </div>
  );
};

export default ModelViewer;