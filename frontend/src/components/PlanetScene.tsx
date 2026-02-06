import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import PlanetViewer from './PlanetViewer';

interface PlanetSceneProps {
  vertices: number[];
  indices: number[];
  genome: any;
}

const PlanetScene: React.FC<PlanetSceneProps> = ({ vertices, indices, genome }) => {
  return (
    <div style={{ width: '100%', height: '100%', background: '#0a0a1a' }}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 150]} />
        <OrbitControls enablePan={false} minDistance={70} maxDistance={300} enableZoom={true} />
        
        <Stars radius={500} depth={200} count={4000} factor={8} saturation={0.2} fade speed={1} />
        
        <Suspense fallback={null}>
          <PlanetViewer vertices={vertices} indices={indices} genome={genome} />
        </Suspense>

        <ambientLight intensity={0.5} />
        <pointLight position={[150, 100, 100]} intensity={2.5} color="#ffffff" />
        <pointLight position={[-120, -60, -120]} intensity={1.5} color="#60a5fa" />
        
        <fog attach="fog" args={['#0a0a1a', 150, 600]} />
      </Canvas>
    </div>
  );
};

export default PlanetScene;
