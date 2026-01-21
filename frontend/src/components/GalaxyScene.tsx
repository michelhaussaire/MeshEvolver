import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

interface GalaxySceneProps {
  children: React.ReactNode;
  autoRotate?: boolean;
  cameraDistance?: number;
  enableBloom?: boolean;
}

const GalaxyScene: React.FC<GalaxySceneProps> = ({ 
  children, 
  autoRotate = false,
  cameraDistance = 200,
  enableBloom = true
}) => {
  return (
    <div className="w-full aspect-square bg-[#000000] rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [cameraDistance, 0, 0], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#000000']} />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={50}
          maxDistance={500}
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
        />
        
        {children}
        
        {enableBloom && (
          <EffectComposer>
            <Bloom 
              luminanceThreshold={0.8}
              mipmapBlur
              intensity={0.5}
              radius={0.5}
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
};

export default GalaxyScene;
