// /components/project/viewers/ModelViewer.jsx
import React, { Suspense, useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Html, OrbitControls, Text} from '@react-three/drei';
import { Leva, useControls } from 'leva';
import { ErrorBoundary } from 'react-error-boundary';
import { useTheme } from '@/components/ui/themeProvider';
// Simplified STL Model component
const ModelStlView = ({ url }) => {
  const [geom, setGeom] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const ref = useRef();
  const { gl } = useThree();
  const { isDark } = useTheme();

  // Basic controls
  const { wireframe, color } = useControls({
    wireframe: false,
    color: isDark ? '#808080' : '#505050'
  });

  // More advanced controls in a separate folder
  const { clip, clipPosition } = useControls('Advanced', {
    clip: false,
    clipPosition: { value: 0, min: -5, max: 5, step: 0.1 }
  });

  // Materials properties
  const { metalness, roughness } = useControls('Material', {
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
          camera={{ position: [30, -90, 40], fov: 5 }}
          gl={{ preserveDrawingBuffer: true }}
          linear
          className="w-full h-full"
        >
          <Suspense fallback={
            <Html center>
              <div className="text-foreground bg-background/80 p-2 rounded-md">
                Loading model...
              </div>
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
        <Leva
          titleBar={false}
          fill
          hideRoot
        />
      </div>
    </div>
  );
};

export default ModelViewer;