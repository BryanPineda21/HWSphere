import React from 'react';
import getProject from './GetProject';
import { useQuery } from "@tanstack/react-query";
import { useParams } from 'react-router-dom'; // Import useParams for getting the projectId from the URL
import { Suspense, useState, useEffect, useRef} from 'react'
import { Canvas} from '@react-three/fiber'
import { Html, useProgress, Stats, OrbitControls, Loader} from '@react-three/drei'
import ModelStl from './STLloader/stlLoader';
import { Leva, useControls } from 'leva';
import Model from './model.jsx';
import { passiveSupport } from 'passive-events-support/src/utils'
import { useNavigate } from 'react-router-dom';
import Prism from "prismjs";
import 'prismjs/plugins/line-numbers/prism-line-numbers';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'; // For line numbers
import 'prismjs/components/prism-c'; // For Python highlighting
import 'prismjs/components/prism-cpp'; // For Java highlighting
import 'prismjs/themes/prism-okaidia.css'; // For Prism theme



const ProjectPage = () => {


  const { projectId } = useParams();

  const { data:project , isLoading, isError } = useQuery({
        
    queryFn: ()=> getProject(projectId),
    queryKey: ["projects", {projectId}],
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  
});

const [showCode, setShowCode] = useState(false);

const codeRef = useRef(null);

useEffect(() => {
  if (showCode && codeRef.current) {
    Prism.highlightElement(codeRef.current);
  }
}, [showCode, codeRef]);




passiveSupport(
  {
    debug: true,
  }
);




const { clipObj, clipPos, wireframe } = useControls({

  clipPos: { value: 0, min: -250, max: 250 },
  clipModel: false,
  wireframe: false,
  // autoRotate: false,
});



// const navigate = useNavigate();



if (isLoading) {return <div>Loading Project...</div>;}
if (isError) {return <div>Error fetching project</div>;}



  return (
    <div className='project-container'>

      {project && (
        <div className='project-contents'>
          <div className="project-text">
            <h2 className='project-title'>{project.title}</h2>
            <p className='project-description'>{project.description}</p>



            {/*Make buttons name dynamic/ correspond to correct file */}
            <button onClick={() => setShowCode(true)}>View Code</button>
            <button onClick={() => setShowCode(false)}>View Model</button>  
          </div>

          {showCode ? (
            <div className="project-code">
              <pre className={"line-numbers"}>
                <code className={"language-cpp"} ref={codeRef}>
                  {project.codeContent}
                </code>
              </pre>
            </div>
          ) : (
            <div className="canvas-container">
              <div className="canvas">
                <Canvas camera={{ position: [400, 30, 20], fov: 60 }}>
                  <Suspense fallback={"Loading..."}>
                    <ambientLight intensity={0.5} />
                    <spotLight position={[100, 10, 10]} angle={6.15} penumbra={1} />
                    <directionalLight position={[0, 10, 0]} intensity={1.5} />
                    <Model />
                    <directionalLight position={[1, 0, 1]} intensity={1.4} />
                    <OrbitControls target={[3, 0, 0]} />
                  </Suspense>
                </Canvas>
                <div className="leva">
                  <Leva titleBar={false} fill />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProjectPage;





          {/* <div className="canvas-container">

        <Canvas  camera={{ position: [400, 30, 20] , fov: 100  }}>
                  <Suspense fallback={null}>
                  <OrbitControls />
                  <directionalLight position={[0, 10, 0]} intensity={0.4} />
                  <directionalLight position={[0, -10, 0]} intensity={0.5} />
                  <ambientLight intensity={0.5} />
                    <ModelStl url={project.modelUrl}/>
                  </Suspense>
                  <Stats/>
                </Canvas>

                <Loader/>

              
                <Leva
                titleBar={false}
                drag={false}
                />
             
              

          </div> */}