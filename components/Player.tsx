import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store';
import { Lane, GameStatus } from '../types';
import * as THREE from 'three';

const LANE_WIDTH = 2.5;
const JUMP_HEIGHT = 3;
const JUMP_DURATION = 0.6;
const SLIDE_DURATION = 0.8;

export const Player: React.FC = () => {
  const meshRef = useRef<THREE.Group>(null);
  const lane = useGameStore(s => s.lane);
  const isJumping = useGameStore(s => s.isJumping);
  const isSliding = useGameStore(s => s.isSliding);
  const setJumping = useGameStore(s => s.setJumping);
  const setSliding = useGameStore(s => s.setSliding);
  const status = useGameStore(s => s.status);
  
  // Animation state
  const jumpTime = useRef(0);
  const slideTime = useRef(0);
  
  // Smooth lane transitions
  const currentX = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current || status !== GameStatus.PLAYING) return;

    // Lateral Movement (Lerp)
    const targetX = lane * LANE_WIDTH;
    currentX.current = THREE.MathUtils.lerp(currentX.current, targetX, delta * 10);
    meshRef.current.position.x = currentX.current;

    // Jump Logic
    if (isJumping) {
      jumpTime.current += delta;
      if (jumpTime.current >= JUMP_DURATION) {
         setJumping(false);
         jumpTime.current = 0;
         meshRef.current.position.y = 0;
      } else {
         // Parabolic jump
         const progress = jumpTime.current / JUMP_DURATION;
         meshRef.current.position.y = Math.sin(progress * Math.PI) * JUMP_HEIGHT;
      }
    } else {
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, 0, delta * 10);
    }

    // Slide Logic (Visual only for now, collision handled in GameScene)
    if (isSliding) {
        slideTime.current += delta;
        if (slideTime.current >= SLIDE_DURATION) {
            setSliding(false);
            slideTime.current = 0;
            meshRef.current.scale.set(1, 1, 1);
        } else {
            meshRef.current.scale.set(1, 0.5, 1); // Flatten
        }
    } else {
        meshRef.current.scale.set(1, 1, 1);
    }
    
    // Add some running bobbing if on ground
    if (!isJumping) {
        meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 15) * 0.1;
    }
  });

  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      {/* Body */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[0.8, 1.8, 0.5]} />
        <meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={0.5} />
      </mesh>
      {/* Cyber Visor */}
      <mesh position={[0, 1.6, 0.26]}>
         <boxGeometry args={[0.6, 0.2, 0.1]} />
         <meshStandardMaterial color="#f000ff" emissive="#f000ff" emissiveIntensity={1} />
      </mesh>
      {/* Trail/Engine Pack */}
      <mesh position={[0, 1.2, -0.3]}>
        <boxGeometry args={[0.4, 0.6, 0.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
};
