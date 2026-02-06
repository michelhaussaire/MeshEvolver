import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, ToneMapping, Noise, Vignette } from '@react-three/postprocessing';

interface GalaxySceneProps {
  children: React.ReactNode;
  autoRotate?: boolean;
}

const GalaxyScene: React.FC<GalaxySceneProps> = ({ children }) => {
  return (
    <div className="w-full h-full bg-black rounded-xl overflow-hidden border border-slate-800 shadow-2xl relative">
      <Canvas 
        camera={{ position: [0, 80, 150], fov: 50 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={['#02040a']} />
        <OrbitControls 
          enablePan={false} 
          autoRotate={false}
          maxDistance={400}
          minDistance={80}
        />
        
        <Suspense fallback={null}>
          {children}
        </Suspense>

        <EffectComposer>
          <Bloom 
            intensity={1.8}
            luminanceThreshold={0.15}
            mipmapBlur
            radius={0.6}
          />
          <Noise opacity={0.03} />
          <Vignette eskil={false} offset={0.1} darkness={1.0} />
          <ToneMapping />
        </EffectComposer>
      </Canvas>
      <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-xl"></div>
    </div>
  );
};

export default GalaxyScene;
