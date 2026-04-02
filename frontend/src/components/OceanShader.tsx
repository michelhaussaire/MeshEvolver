import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
// @ts-ignore
import vertexShader from '../shaders/ocean.glsl';
// @ts-ignore
import fragmentShader from '../shaders/oceanFragment.glsl';

export interface OceanShaderProps {
  frequency?: number;
  amplitude?: number;
  speed?: number;
  colorDeep?: string;
  colorShallow?: string;
  specularStrength?: number;
  transparency?: number;
  sunDirection?: [number, number, number];
  resolution?: number;
  radius?: number;
}

const OceanShader: React.FC<OceanShaderProps> = ({
  frequency = 0.5,
  amplitude = 0.2,
  speed = 1.0,
  colorDeep = '#003b5c',
  colorShallow = '#006994',
  specularStrength = 0.8,
  transparency = 0.85,
  sunDirection = [1.0, 1.0, 0.5],
  resolution = 128,
  radius = 5,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const deepColor = useMemo(() => new THREE.Color(colorDeep), [colorDeep]);
  const shallowColor = useMemo(() => new THREE.Color(colorShallow), [colorShallow]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFrequency: { value: frequency },
      uAmplitude: { value: amplitude },
      uSpeed: { value: speed },
      uColorDeep: { value: deepColor },
      uColorShallow: { value: shallowColor },
      uSunDirection: { value: new THREE.Vector3(...sunDirection).normalize() },
      uSpecularStrength: { value: specularStrength },
      uTransparency: { value: transparency },
    }),
    [frequency, amplitude, speed, deepColor, shallowColor, sunDirection, specularStrength, transparency]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[radius, resolution, resolution]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        side={THREE.DoubleSide}
        blending={THREE.NormalBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

export default OceanShader;
