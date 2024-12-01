import { useFrame, useLoader, useThree} from "@react-three/fiber";
import { useRef, useEffect, useState} from "react";
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import * as THREE from 'three';
import { useControls } from "leva";




const ModelStl = ({ url }) => {
  const [geom, setGeom] = useState(null);


  // const geom = useLoader(STLLoader, url);

  const ref = useRef();

  const { gl } = useThree();


  const clippingPlane = new THREE.Plane( new THREE.Vector3( 0, - 1, 0 ), 0.8 );


  const { clip, clipPosition, wireframe } = useControls({
    clip: false,
    clipPosition: { value: 0, min: -250, max: 250 },
    wireframe: false,
    // autoRotate: false,
  });
  

  useEffect(() => {
    const loader = new STLLoader();
    loader.load(url, (loadedGeometry) => {
      if (loadedGeometry.hasColors) {
        loadedGeometry.center();
      }
      setGeom(loadedGeometry);
    });
  }, [url]);
  
  useEffect(() => {
    gl.localClippingEnabled = clip;
  }, [clip, gl]);

  useFrame(() => {
    if (geom && ref.current) {
      if (clip) {
        clippingPlane.constant = clipPosition;
        ref.current.material.clippingPlanes = [clippingPlane];
      } else {
        ref.current.material.clippingPlanes = [];
      }
    }
  }, { passive: true });

  return( 
  <>
  
  {geom && (
        <mesh ref={ref}>
          <primitive object={geom} attach="geometry" />
          <meshStandardMaterial
           wireframe={wireframe}   
          clippingPlanes={[clippingPlane]}
          vertexColors={geom.hasColors}
          />
        </mesh>
    )}
  <ambientLight/>
  <pointLight position={[10, 10, 10]}/>
  </>
)
}

export default ModelStl;
