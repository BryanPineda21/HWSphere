import React, { useEffect, useRef } from 'react';
import { StlViewer } from 'react-stl-viewer';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';


const CustomStlViewer = ({ url, style}) => {
    const mountRef = useRef();
  
    useEffect(() => {
      const mount = mountRef.current;

  
      // Create a scene, camera, and renderer
      const scene = new THREE.Scene();
      scene.background = new THREE.Color( 0xffffff );

      const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
      camera.position.set(400, -5, 20);
  
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      mount.appendChild(renderer.domElement);
  
      // Add lights
      const light1 = new THREE.DirectionalLight(0xffffff, 2);
      light1.position.set(0, 10, 10).normalize();
      light1.castShadow = true;
      light1.shadow.mapSize.width = 2048;
      light1.shadow.mapSize.height = 2048;
      scene.add(light1);
  
      const light2 = new THREE.DirectionalLight(0xffffff, 2);
      light2.position.set(-10, -10, -10).normalize();
      light2.castShadow = true;
      light2.shadow.mapSize.width = 2048;
      light2.shadow.mapSize.height = 2048;
      scene.add(light2);
  


      // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

 

    // Add a floor plane
    const floorGeometry = new THREE.PlaneGeometry(500, 500);
    const floorMaterial = new THREE.ShadowMaterial({ opacity: 0 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1;
    floor.receiveShadow = true;
    scene.add(floor);



      // Load the STL model
      const loader = new STLLoader();
      loader.load(url, (geometry) => {
        const material = new THREE.MeshPhongMaterial({ color: 0x555555 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        scene.add(mesh);
      });
  
      // Set up orbit controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 2.0;
  
      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();
  
      // Handle window resize
      const handleResize = () => {
        camera.aspect = mount.clientWidth / mount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mount.clientWidth, mount.clientHeight);
      };
  
      window.addEventListener('resize', handleResize);
  
      // Clean up on unmount
      return () => {
        window.removeEventListener('resize', handleResize);
        mount.removeChild(renderer.domElement);
      };
    }, [url]);
  
    return <div ref={mountRef} style={style} />;
  };
  

  

  export default CustomStlViewer;

