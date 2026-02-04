import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store';
import { GameStatus } from '../types';
import { MeshWobbleMaterial, Float, Trail } from '@react-three/drei';
import * as THREE from 'three';

const LANE_WIDTH = 3.0;
const JUMP_HEIGHT = 4;
const JUMP_DURATION = 0.5;
const SLIDE_DURATION = 0.7;

export const Player: React.FC = () => {
  const meshRef = useRef<THREE.Group>(null);
  const lane = useGameStore(s => s.lane);
  const isJumping = useGameStore(s => s.isJumping);
  const isSliding = useGameStore(s => s.isSliding);
  const setJumping = useGameStore(s => s.setJumping);
  const setSliding = useGameStore(s => s.setSliding);
  const status = useGameStore(s => s.status);

  const jumpTime = useRef(0);
  const slideTime = useRef(0);
  const currentX = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current || status !== GameStatus.PLAYING) return;

    // Movement
    const targetX = lane * LANE_WIDTH;
    currentX.current = THREE.MathUtils.lerp(currentX.current, targetX, delta * 12);
    meshRef.current.position.x = currentX.current;

    // Jump
    if (isJumping) {
      jumpTime.current += delta;
      if (jumpTime.current >= JUMP_DURATION) {
        setJumping(false);
        jumpTime.current = 0;
        meshRef.current.position.y = 0;
      } else {
        const progress = jumpTime.current / JUMP_DURATION;
        meshRef.current.position.y = Math.sin(progress * Math.PI) * JUMP_HEIGHT;
        meshRef.current.rotation.x = -progress * Math.PI * 2; // Front flip
      }
    } else {
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, 0, delta * 15);
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, delta * 10);
    }

    // Slide
    if (isSliding) {
      slideTime.current += delta;
      if (slideTime.current >= SLIDE_DURATION) {
        setSliding(false);
        slideTime.current = 0;
        meshRef.current.scale.y = 1;
      } else {
        meshRef.current.scale.y = 0.4;
      }
    } else {
      meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, 1, delta * 10);
    }

    // Tilt
    const tilt = (currentX.current - targetX) * 0.2;
    meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, tilt, delta * 5);
  });

  return (
    <group ref={meshRef}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        {/* Core Body */}
        <mesh castShadow>
          <boxGeometry args={[1, 1.8, 0.6]} />
          <meshStandardMaterial color="#22d3ee" metalness={0.8} roughness={0.1} />
        </mesh>

        {/* Emissive Strips */}
        <mesh position={[0, 0, 0.31]}>
          <planeGeometry args={[0.8, 1.4]} />
          <meshStandardMaterial
            emissive="#00f3ff"
            emissiveIntensity={10}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Visor */}
        <mesh position={[0, 0.6, 0.35]}>
          <boxGeometry args={[0.9, 0.3, 0.1]} />
          <meshStandardMaterial emissive="#ff00ff" emissiveIntensity={15} />
        </mesh>

        {/* Jetpack Wings */}
        <mesh position={[-0.6, 0.2, -0.2]} rotation={[0, 0.2, 0]}>
          <boxGeometry args={[0.2, 1, 0.4]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[0.6, 0.2, -0.2]} rotation={[0, -0.2, 0]}>
          <boxGeometry args={[0.2, 1, 0.4]} />
          <meshStandardMaterial color="#333" />
        </mesh>

        {/* Trail point */}
        <mesh position={[0, -0.5, -0.4]} visible={false}>
          <sphereGeometry args={[0.1]} />
        </mesh>
      </Float>

      {/* Speed Trail */}
      <Trail
        width={1.5}
        length={4}
        color={new THREE.Color('#00f3ff')}
        attenuation={(t) => t * t}
      >
        <mesh position={[0, 0, -0.5]} visible={false} />
      </Trail>
    </group>
  );
};
