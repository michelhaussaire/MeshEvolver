import React, { useRef } from 'react';
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
  const meshRef = useRef<THREE.Points>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  if (!geometryRef.current) {
    const geometry = new THREE.BufferGeometry();
    const positionArray = new Float32Array(positions);
    const colorArray = new Float32Array(colors);
    const sizeArray = new Float32Array(sizes);
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizeArray, 1));
    
    geometryRef.current = geometry;
  }

  return (
    <group>
      <points 
        ref={meshRef}
        geometry={geometryRef.current}
        onClick={onClick}
      >
        <pointsMaterial 
          size={1}
          vertexColors
          sizeAttenuation={true}
          transparent={true}
          opacity={selected ? 1.0 : 0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      {selected && (
        <mesh rotation={[0, 0, 0]}>
          <ringGeometry args={[90, 92, 64]} />
          <meshBasicMaterial color="#818cf8" transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
};

export default GalaxyViewer;
