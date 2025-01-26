import { Canvas } from "@react-three/fiber";
import { Center, Environment, OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import Model from "./model.jsx";
import { DirectionalLight } from "three";
import { StlViewer } from "react-stl-viewer";
import { useEffect, useRef} from "react";
import { passiveSupport } from "passive-events-support/src/utils";
import Prism from "prismjs";
import 'prismjs/components/prism-python.js'; // For C++ highlighting
import 'prismjs/themes/prism-okaidia.css'; // For Prism theme


const Homepage = ()=>{
    


const HWSphereGreetCode = `#Welcome to HWSphere
#python is supported along with other languages too!

def welcome_hwsphere():
    print("Welcome to HWSphere! 🌐")
    
    ready = input("Ready to sign up? (yes/no): ").lower()
    
    if ready == "yes":
        print("Great! Visit our sign-up page to join.")
    
    else:
        print("Not ready? Let's try again!")
        welcome_hwsphere()

welcome_hwsphere()`;


 useEffect(() => {
  Prism.highlightAll();
  }, []);




return (
  <div className="Home ">
    <h1 className="home-h1 flex justify-center text-center text-5xl pt-16">Open-Source Projects and Portfolios</h1>
    <p className="home-description flex justify-center items-center text-center text-1xl pt-16 w-full max-w-2xl mx-auto p-5">
      HWSphere is a project-hosting platform for engineers. We aim to showcase your projects in its entirety by supporting various file types.
      Users can discover other projects as well to learn about different designs and contribute to development.
    </p>
    <h1 className="home-h1 flex justify-center text-center text-5xl pt-14">Support for 3D Models, Code, and More</h1>
    <div className="flex justify-center">
      <div className="w-full max-w-lg" style={{ height: '500px', aspectRatio: '4 / 3' }}>
        <Canvas className="w-full h-full" camera={{ position: [0, 0, 50], fov: 50 }}>
          <Suspense fallback={"Loading..."}>
            <ambientLight intensity={0.1} />
            <directionalLight
              position={[10, 20, 10]}
              intensity={1.5}
              castShadow
              shadow-mapSize-width={2024}
              shadow-mapSize-height={2024}
            />
            <directionalLight
              position={[-10, 20, -10]}
              intensity={4}
              castShadow
            />
            <spotLight
              position={[15, 25, 15]}
              angle={0.2}
              penumbra={1}
              intensity={2}
              castShadow
            />
            <Model />
            <OrbitControls maxDistance={200} minDistance={100} target={[0, 1, 0]} />
          </Suspense>
        </Canvas>
      </div>
    </div>
    <h1 className="home-h1 flex justify-center text-center text-5xl pt-16">Share Projects and Discover Others</h1>
    <div className="flex justify-center items-center w-full pt-16 p-4">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl" style={{ height: 'auto' }}>
        <img src="/websitedemo.gif" className="w-full h-auto object-contain" alt="astronomy" />
      </div>
    </div>
    <h1 className="home-h1 flex justify-center text-center text-5xl pt-20">Explore Resources and New Skills</h1>
    <div className="flex justify-center items-center pt-16 p-4">
      <pre className={"line-numbers h-auto w-full max-w-xl sm:max-w-lg md:max-w-2xl lg:max-w-5xl border-5  border-zinc-500 rounded-lg"}>
        <code className={"language-python"}>
          {HWSphereGreetCode} 
        </code>
      </pre>
    </div>
  </div>
);



}

export default Homepage;