import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlanetProps {
  vertices: number[];
  indices: number[];
  genome: any;
}

const PlanetViewer: React.FC<PlanetProps> = ({ vertices, indices, genome }) => {
  const meshRef = React.useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new THREE.Float32BufferAttribute(vertices, 3);
    geo.setAttribute('position', pos);
    geo.setIndex(indices);
    
    // El radio base del algoritmo de Rust es 50.0
    const BASE_RADIUS = 50.0;
    
    const colors = [];
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const dist = Math.sqrt(x * x + y * y + z * z);
      
      // Altura relativa al radio base
      const h = dist - BASE_RADIUS; 
      // Escalar ocean_level para que tenga efecto visual real
      const oceanLevel = (genome.ocean_level - 0.4) * 10.0;

      if (h < oceanLevel) {
        colors.push(0.1, 0.35, 0.85);
      } else if (h < oceanLevel + 1.5) {
        colors.push(0.85, 0.75, 0.5);
      } else if (h < 6.0) {
        colors.push(0.15, 0.6, 0.15);
      } else if (h < 9.0) {
        colors.push(0.45, 0.35, 0.25);
      } else {
        colors.push(0.95, 0.95, 1.0);
      }
    }
    
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, [vertices, indices, genome]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          vertexColors={true}
          roughness={0.65}
          metalness={0.0}
          side={THREE.DoubleSide}
          flatShading={false}
        />
      </mesh>

      <mesh scale={[1.12, 1.12, 1.12]}>
        <sphereGeometry args={[50, 64, 64]} />
        <meshStandardMaterial
          color="#60a5fa"
          transparent
          opacity={genome.atmosphere_thickness * 0.5 + 0.1}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          emissive="#3b82f6"
          emissiveIntensity={0.8}
        />
      </mesh>

      <ambientLight intensity={0.7} />
      <directionalLight position={[80, 40, 50]} intensity={2.5} castShadow />
      <pointLight position={[-40, -20, -40]} intensity={0.9} color="#60a5fa" />
      <pointLight position={[0, 50, 0]} intensity={0.4} color="#fbbf24" />
    </group>
  );
};

export default PlanetViewer;
