'use client';

import React from 'react';
import { RoundedBox, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface TabletModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  geometryDetail?: number;
}

export function TabletModel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  geometryDetail = 32,
}: TabletModelProps) {
  // Static tablet - no animation

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main Tablet Body - Premium Navy with Gold Accents */}
      <RoundedBox
        args={[4.5, 3, 0.15]}
        radius={0.08}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#0a1628"
          metalness={0.9}
          roughness={0.15}
          envMapIntensity={0.8}
        />
      </RoundedBox>

      {/* Gold Trim - Top Edge */}
      <RoundedBox
        args={[4.52, 0.05, 0.16]}
        position={[0, 1.525, 0]}
        radius={0.02}
        smoothness={2}
      >
        <meshStandardMaterial
          color="#D4AF37"
          metalness={1}
          roughness={0.2}
          envMapIntensity={1.2}
        />
      </RoundedBox>

      {/* Gold Trim - Bottom Edge */}
      <RoundedBox
        args={[4.52, 0.05, 0.16]}
        position={[0, -1.525, 0]}
        radius={0.02}
        smoothness={2}
      >
        <meshStandardMaterial
          color="#D4AF37"
          metalness={1}
          roughness={0.2}
          envMapIntensity={1.2}
        />
      </RoundedBox>

      {/* Gold Trim - Left Edge */}
      <RoundedBox
        args={[0.05, 3.05, 0.16]}
        position={[-2.26, 0, 0]}
        radius={0.02}
        smoothness={2}
      >
        <meshStandardMaterial
          color="#D4AF37"
          metalness={1}
          roughness={0.2}
          envMapIntensity={1.2}
        />
      </RoundedBox>

      {/* Gold Trim - Right Edge */}
      <RoundedBox
        args={[0.05, 3.05, 0.16]}
        position={[2.26, 0, 0]}
        radius={0.02}
        smoothness={2}
      >
        <meshStandardMaterial
          color="#D4AF37"
          metalness={1}
          roughness={0.2}
          envMapIntensity={1.2}
        />
      </RoundedBox>

      {/* Screen Bezel - Inner Frame */}
      <RoundedBox
        args={[4.2, 2.7, 0.02]}
        position={[0, 0, 0.08]}
        radius={0.04}
        smoothness={2}
      >
        <meshStandardMaterial
          color="#0d1f35"
          metalness={0.8}
          roughness={0.3}
        />
      </RoundedBox>

      {/* Screen Surface - Glass Effect */}
      <RoundedBox
        args={[4, 2.5, 0.01]}
        position={[0, 0, 0.09]}
        radius={0.03}
        smoothness={2}
      >
        <meshPhysicalMaterial
          color="#001233"
          metalness={0.1}
          roughness={0.05}
          transmission={0.1}
          thickness={0.5}
          envMapIntensity={0.5}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </RoundedBox>

      {/* Screen Glow Effect - Static */}
      <mesh position={[0, 0, 0.1]}>
        <planeGeometry args={[4.1, 2.6]} />
        <meshBasicMaterial
          color="#00D4FF"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Camera/Sensor - Top Center */}
      <mesh position={[0, 1.35, 0.085]}>
        <cylinderGeometry args={[0.03, 0.03, 0.02, geometryDetail]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Home Button - Bottom Center (Subtle) */}
      <mesh position={[0, -1.35, 0.085]}>
        <cylinderGeometry args={[0.08, 0.08, 0.01, geometryDetail]} />
        <meshStandardMaterial
          color="#D4AF37"
          metalness={1}
          roughness={0.3}
        />
      </mesh>

      {/* Side Buttons - Volume */}
      <RoundedBox
        args={[0.03, 0.15, 0.08]}
        position={[-2.27, 0.5, 0]}
        radius={0.01}
        smoothness={2}
      >
        <meshStandardMaterial
          color="#D4AF37"
          metalness={1}
          roughness={0.3}
        />
      </RoundedBox>

      <RoundedBox
        args={[0.03, 0.15, 0.08]}
        position={[-2.27, 0.2, 0]}
        radius={0.01}
        smoothness={2}
      >
        <meshStandardMaterial
          color="#D4AF37"
          metalness={1}
          roughness={0.3}
        />
      </RoundedBox>

      {/* Power Button */}
      <RoundedBox
        args={[0.03, 0.2, 0.08]}
        position={[2.27, 0.4, 0]}
        radius={0.01}
        smoothness={2}
      >
        <meshStandardMaterial
          color="#D4AF37"
          metalness={1}
          roughness={0.3}
        />
      </RoundedBox>

      {/* Decorative Corner Accents */}
      {[
        [-2.1, 1.35, 0.08],
        [2.1, 1.35, 0.08],
        [-2.1, -1.35, 0.08],
        [2.1, -1.35, 0.08],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.04, geometryDetail / 2, geometryDetail / 2]} />
          <meshStandardMaterial
            color="#D4AF37"
            metalness={1}
            roughness={0.2}
            envMapIntensity={1.5}
          />
        </mesh>
      ))}

      {/* Reflection Plane (subtle floor reflection) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[10, 10]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={50}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#0a0a0a"
          metalness={0.5}
          mirror={0.5}
        />
      </mesh>
    </group>
  );
}
