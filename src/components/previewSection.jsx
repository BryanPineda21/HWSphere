
// Leva import
import React, { useEffect, useRef, useMemo, Suspense } from 'react';
import { Code, Play, Box, Terminal } from "lucide-react";
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import { useControls, Leva } from 'leva';
import * as THREE from 'three';

import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css'; // You can choose any style you prefer



const ModelWithControls = () => {
  const ref = useRef();
  const { gl } = useThree();
  const { scene, nodes } = useGLTF('/wireframe.glb');
  
  const { clip, clipPosition, wireframe } = useControls({
    clip: false,
    clipPosition: { value: 0, min: -5, max: 5, step: 0.1},
    wireframe: false
  });

  const clippingPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0.8);

  useEffect(() => {
    if (gl) {
      gl.localClippingEnabled = clip;
    }
  }, [clip, gl]);

  useFrame(() => {
    if (ref.current && clip) {
      clippingPlane.constant = clipPosition;
    }
  });

  // Center and prepare the model
  useEffect(() => {
    if (scene) {
      // Center the model
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      scene.position.sub(center);
      
      // Apply wireframe to all materials if needed
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.clippingPlanes = clip ? [clippingPlane] : [];
        }
      });
    }
  }, [scene, clip]);

  // Update materials when wireframe changes
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.wireframe = wireframe;
        }
      });
    }
  }, [scene, wireframe]);

  if (!nodes.mesh_0) return null;

  return (
    <group ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <primitive object={scene} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />
      <hemisphereLight intensity={0.3} />
    </group>
  );
};

// Preview components with theme support
const Scene3D = () => {
  return (
    <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl overflow-hidden h-[400px] border border-zinc-300 dark:border-zinc-800 shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-200/50 dark:bg-zinc-800/50 border-b border-zinc-300 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
        </div>
        <span className="text-zinc-600 dark:text-zinc-400 text-sm">3D Model Preview</span>
      </div>
      <div className="relative h-[calc(100%-40px)]">
        <Canvas 
          // camera={{ position: [5, 5, 5], fov: 40 }} 
          camera={{ position: [0, 120, 15], fov: 70 }}
          gl={{ preserveDrawingBuffer: true }}
          shadows
        >
          <Suspense fallback={null}>
            <ModelWithControls />
            <OrbitControls 
              enableDamping 
              dampingFactor={0.05} 
              rotateSpeed={0.5} 
              zoomSpeed={0.5}
              minDistance={20}
              maxDistance={35}
            />
            <Environment preset="city" />
          </Suspense>
        </Canvas>
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-zinc-100/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-lg p-2 border border-zinc-300 dark:border-zinc-800">
            <Leva fill flat titleBar={false} hideCopyButton hideRoot collapsed={false} />
          </div>
        </div>
      </div>
    </div>
  );
};


const CodePreview = () => {
  const codeRef = useRef(null);

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, []);

  const code = `# Welcome to HWSphere
# Python is supported along with other languages too!

def welcome_hwsphere():
    print("Welcome to HWSphere! 🌐")
    
    ready = input("Ready to sign up? (yes/no): ").lower()
    
    if ready == "yes":
        print("Great! Visit our sign-up page to join.")
    
    else:
        print("Not ready? Let's try again!")
        welcome_hwsphere()

welcome_hwsphere()`;

  return (
    <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl overflow-hidden h-[400px] border border-zinc-300 dark:border-zinc-800 shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-200/50 dark:bg-zinc-800/50 border-b border-zinc-300 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
        </div>
        <span className="text-zinc-600 dark:text-zinc-400 text-sm">welcome.py</span>
      </div>
      <div className="h-[calc(100%-40px)] overflow-auto">
        <pre className="p-4 m-0 h-auto">
          <code ref={codeRef} className="language-python h-auto">{code}</code>
        </pre>
      </div>
    </div>
  );
};

const DemoPreview = () => {
  return (
    <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl overflow-hidden h-[400px] border border-zinc-300 dark:border-zinc-800 shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-200/50 dark:bg-zinc-800/50 border-b border-zinc-300 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
        </div>
        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
          <Terminal className="w-4 h-4" />
          <span className="text-sm">HWSphere Demo</span>
        </div>
      </div>
      <div className="h-[calc(100%-56px)] p-4">
        <img 
          src="/websitedemo.gif" 
          className="w-full h-full object-cover rounded-lg" 
          alt="HWSphere Demo"
        />
      </div>
    </div>
  );
};

const PreviewSection = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Decorative elements - updated for theme support */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#f5f5f5_0%,transparent_100%)] dark:bg-[radial-gradient(circle_at_center,#1a1a1a_0%,transparent_100%)] opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-100/20 dark:via-zinc-900/20 to-transparent" />
      
      <div className="container relative mx-auto px-4">
       
       
    {/* Section Header */}
    <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center mb-12 md:mb-16 reveal">
            <span className="block mb-5 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600">
            Interactive Portfolio Environment
            </span>
            <p className="text-zinc-700 dark:text-zinc-200 mt-5 text-sm sm:text-base md:text-lg max-w-xl sm:max-w-2xl mx-auto font-geist font-light leading-relaxed">
            Experience our comprehensive suite of Project tools designed specifically for engineering projects.
            </p>
        </div>
    </div>

        {/* Preview Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto mb-16">
          {/* Code Preview Card */}
          <div className="group reveal">
            <div className="mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Code className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">Code Editor</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Syntax highlighting for 100+ languages</p>
              </div>
            </div>
            <div className="transform-gpu transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
              <CodePreview />
            </div>
          </div>

          {/* Demo Preview Card */}
          <div className="group lg:translate-y-12 reveal">
            <div className="mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Play className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">Live Preview</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Real-time project demonstration</p>
              </div>
            </div>
            <div className="transform-gpu transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
              <DemoPreview />
            </div>
          </div>

          {/* 3D Scene Preview Card */}
          <div className="lg:col-span-2 group reveal">
            <div className="mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Box className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">3D Model Viewer</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Interactive 3D model manipulation</p>
              </div>
            </div>
            <div className="transform-gpu transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
              <Scene3D />
            </div>
          </div>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto reveal">
          {[
            {
              title: "Multi-Language Support",
              description: "Preview code in over 100 programming languages with syntax highlighting"
            },
            {
              title: "Interactive Previews",
              description: "Test and demonstrate your projects with live, interactive previews in your browser"
            },
            {
              title: "3D Visualization",
              description: "Powerful 3D model viewer with support for STL file formats and real-time manipulation"
            }
          ].map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-xl bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-800">
              <h4 className="text-lg font-semibold text-emerald-500 dark:text-emerald-400 mb-2">{feature.title}</h4>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PreviewSection;