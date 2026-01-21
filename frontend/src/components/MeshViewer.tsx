import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Download } from 'lucide-react';

interface MeshViewerProps {
  vertices: number[];
  indices: number[];
  selected?: boolean;
  onClick?: () => void;
  onExport?: (e: React.MouseEvent) => void;
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
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial 
        color="#6366f1" 
        roughness={0.2}
        metalness={0.8}
        flatShading={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export const MeshViewer: React.FC<MeshViewerProps> = ({ vertices, indices, selected, onClick, onExport }) => {
  return (
    <div 
      className={`relative w-full aspect-square bg-slate-900 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 group ${
        selected 
          ? 'ring-4 ring-indigo-500 ring-offset-4 ring-offset-slate-950 scale-[0.98]' 
          : 'hover:bg-slate-800'
      }`}
      onClick={onClick}
    >
      <Canvas shadows camera={{ position: [35, 35, 35], fov: 40 }}>
        <color attach="background" args={['#0f172a']} />
        <ambientLight intensity={0.5} />
        <spotLight position={[50, 50, 50]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Center>
          <ProceduralMesh vertices={vertices} indices={indices} />
        </Center>
        
        <ContactShadows 
          position={[0, -5, 0]} 
          opacity={0.4} 
          scale={40} 
          blur={2} 
          far={10} 
          resolution={256} 
          color="#000000" 
        />
        
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8} />
      </Canvas>

      <div className="absolute top-4 left-4 right-4 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onExport?.(e);
          }}
          className="p-2 bg-slate-800/80 backdrop-blur-md rounded-lg hover:bg-white hover:text-slate-900 transition-all shadow-xl"
        >
          <Download size={16} />
        </button>
        
        {selected && (
          <div className="bg-indigo-500 text-white text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-widest shadow-lg shadow-indigo-500/40">
            Selected
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none opacity-60" />
    </div>
  );
};
