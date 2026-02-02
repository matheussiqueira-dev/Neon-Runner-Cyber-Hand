import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ObstacleData, CoinData, Lane } from '../types';
import * as THREE from 'three';

const LANE_WIDTH = 2.5;

interface FloorProps {
  zPos: number;
}

export const FloorSegment: React.FC<FloorProps> = ({ zPos }) => {
  return (
    <group position={[0, -0.5, zPos]}>
       {/* Main Path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 20]} />
        <meshStandardMaterial 
            color="#0f172a" 
            roughness={0.2} 
            metalness={0.8}
        />
      </mesh>
      {/* Neon Grid Lines */}
      <gridHelper args={[10, 10, 0xff00ff, 0x00f3ff]} rotation={[0, 0, 0]} position={[0, 0.01, 0]} />
      {/* Side Rails */}
      <mesh position={[-4, 0.5, 0]}>
        <boxGeometry args={[0.5, 1, 20]} />
        <meshStandardMaterial color="#00f3ff" emissive="#00f3ff" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[4, 0.5, 0]}>
        <boxGeometry args={[0.5, 1, 20]} />
        <meshStandardMaterial color="#00f3ff" emissive="#00f3ff" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
};

export const Obstacle: React.FC<{ data: ObstacleData }> = ({ data }) => {
    const xPos = data.lane * LANE_WIDTH;
    
    // Different visuals based on type
    const color = data.type === 'pit' ? '#ff0000' : (data.type === 'tall' ? '#9333ea' : '#ff4400');
    
    if (data.type === 'pit') {
        return (
             <mesh position={[xPos, -0.4, data.z]} rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[2, 2]} />
                <meshBasicMaterial color="#000000" />
                <lineSegments>
                    <edgesGeometry args={[new THREE.PlaneGeometry(2, 2)]} />
                    <lineBasicMaterial color="red" />
                </lineSegments>
             </mesh>
        )
    }

    if (data.type === 'tall') {
        return (
            <group position={[xPos, 0, data.z]}>
                <mesh position={[0, 1.8, 0]} castShadow>
                    <boxGeometry args={[1.6, 3.6, 1]} />
                    <meshStandardMaterial 
                        color={color} 
                        emissive="#a855f7" 
                        emissiveIntensity={0.7}
                    />
                </mesh>
                <mesh position={[0, 1.8, 0]}>
                    <boxGeometry args={[1.7, 3.7, 1.1]} />
                    <meshBasicMaterial color="#e9d5ff" wireframe transparent opacity={0.25} />
                </mesh>
            </group>
        );
    }

    return (
        <group position={[xPos, 0, data.z]}>
            <mesh position={[0, 1, 0]} castShadow>
                <boxGeometry args={[2, 2, 1]} />
                <meshStandardMaterial 
                    color={color} 
                    emissive="#ff0000" 
                    emissiveIntensity={0.8}
                    wireframe={false}
                />
            </mesh>
            {/* Holographic Wireframe overlay */}
            <mesh position={[0, 1, 0]}>
                <boxGeometry args={[2.1, 2.1, 1.1]} />
                <meshBasicMaterial color="#ffaaaa" wireframe transparent opacity={0.3} />
            </mesh>
        </group>
    );
};

export const Coin: React.FC<{ data: CoinData }> = ({ data }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const xPos = data.lane * LANE_WIDTH;

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 3;
        }
    });

    return (
        <mesh ref={meshRef} position={[xPos, 1, data.z]}>
            <torusGeometry args={[0.5, 0.1, 8, 16]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
        </mesh>
    );
};
