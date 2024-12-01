import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'



const scene = new THREE.Scene() 

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.4)
directionalLight.position.set(0, 10, 10)
scene.add(directionalLight);




export default function Model (props) {

  const ref = useRef()
  
  const { nodes, materials } = useGLTF('/hwsphere_colored_main.glb');



  
  return (
    <group  {...props} ref={ref} >
      <mesh

        castShadow
        receiveShadow
        geometry={nodes.mesh_0.geometry.center()}
        material={nodes.mesh_0.material}
        rotation={[-Math.PI / 2, 0, 0]}
       
      >
      <meshStandardMaterial
          attach="material"
          metalness={0.5} // Full metallic
          roughness={0.1} // Lower roughness for a shiny surface
          color="black" // Base color (adjust as needed)
          envMapIntensity={1} // Makes the material react more to environment maps (if any)
        />
      </mesh>
    </group>
  )
}

useGLTF.preload('/hwsphere_colored_main.glb')