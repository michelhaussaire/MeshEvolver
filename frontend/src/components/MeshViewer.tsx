import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center } from '@react-three/drei';
import * as THREE from 'three';

interface MeshViewerProps {
  vertices: number[];
  indices: number[];
  selected?: boolean;
  onClick?: () => void;
}

const ProceduralMesh = ({ vertices, indices }: { vertices: number[], indices: number[] }) => {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vArray = new Float32Array(vertices);
    const iArray = new Uint32Array(indices);
    
    geo.setAttribute('position', new THREE.BufferAttribute(vArray, 3));
    geo.setIndex(new THREE.BufferAttribute(iArray, 1));
    geo.computeVertexNormals();
    return geo;
  }, [vertices, indices]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial 
        color="#4f46e5" 
        wireframe={false} 
        flatShading={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export const MeshViewer: React.FC<MeshViewerProps> = ({ vertices, indices, selected, onClick }) => {
  return (
    <div 
      className={`relative w-full aspect-square bg-slate-900 rounded-lg overflow-hidden cursor-pointer border-4 ${
        selected ? 'border-emerald-500 shadow-lg shadow-emerald-500/20' : 'border-slate-800 hover:border-slate-700'
      }`}
      onClick={onClick}
    >
      <Canvas camera={{ position: [30, 30, 30], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[100, 100, 100]} intensity={1} />
        <Center>
          <ProceduralMesh vertices={vertices} indices={indices} />
        </Center>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
      {selected && (
        <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-bold">
          SELECTED
        </div>
      )}
    </div>
  );
};
