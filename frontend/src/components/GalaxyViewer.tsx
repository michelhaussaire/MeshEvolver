import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GalaxyViewerProps {
  positions: number[];
  colors: number[];
  sizes: number[];
  selected: boolean;
  onClick: () => void;
}

const GalaxyViewer: React.FC<GalaxyViewerProps> = ({ positions, colors, sizes, selected, onClick }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positionArray = new Float32Array(positions);
    const colorArray = new Float32Array(colors);
    const sizeArray = new Float32Array(sizes);
    
    geo.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizeArray, 1));
    
    // Centrar la geometría
    geo.computeBoundingSphere();
    const center = geo.boundingSphere?.center;
    if (center) {
      geo.translate(-center.x, -center.y, -center.z);
    }
    
    return geo;
  }, [positions, colors, sizes]);

  const starTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((_) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0008;
      pointsRef.current.rotation.z += 0.0002;
    }
  });

  return (
    <group ref={groupRef} scale={[1, 1, 1]}>
      <points 
        ref={pointsRef}
        geometry={geometry}
        onClick={onClick}
      >
        <pointsMaterial 
          size={0.8}
          vertexColors
          sizeAttenuation={true}
          transparent={true}
          opacity={selected ? 1.0 : 0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          map={starTexture}
          alphaTest={0.001}
        />
      </points>
      
      {selected && (
        <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1.05, 1.05, 1.05]}>
          <ringGeometry args={[85, 87, 64]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.5} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

export default GalaxyViewer;
