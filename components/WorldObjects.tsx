import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, MeshWobbleMaterial, Float } from '@react-three/drei';
import { ObstacleData, CoinData } from '../types';
import * as THREE from 'three';

const LANE_WIDTH = 3.0;

interface FloorProps {
    zPos: number;
}

export const FloorSegment: React.FC<FloorProps> = ({ zPos }) => {
    return (
        <group position={[0, -0.5, zPos]}>
            {/* Dark Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[12, 30]} />
                <meshStandardMaterial
                    color="#050505"
                    roughness={0.1}
                    metalness={0.9}
                />
            </mesh>

            {/* Neon Side Rails */}
            <mesh position={[-6, 0.2, 0]}>
                <boxGeometry args={[0.2, 0.5, 30]} />
                <meshStandardMaterial emissive="#ff00ff" emissiveIntensity={5} />
            </mesh>
            <mesh position={[6, 0.2, 0]}>
                <boxGeometry args={[0.2, 0.5, 30]} />
                <meshStandardMaterial emissive="#00f3ff" emissiveIntensity={5} />
            </mesh>

            {/* Grid pattern */}
            <gridHelper args={[12, 6, 0xff00ff, 0x222222]} position={[0, 0.05, 0]} />
        </group>
    );
};

export const Obstacle: React.FC<{ data: ObstacleData }> = ({ data }) => {
    const xPos = data.lane * LANE_WIDTH;

    if (data.type === 'pit') {
        return (
            <mesh position={[xPos, -0.45, data.z]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[2.5, 4]} />
                <meshBasicMaterial color="#ff0000" transparent opacity={0.3} />
                <gridHelper args={[2.5, 4, 0xff0000, 0xaa0000]} rotation={[Math.PI / 2, 0, 0]} />
            </mesh>
        )
    }

    if (data.type === 'tall') {
        return (
            <group position={[xPos, 0, data.z]}>
                <mesh position={[0, 4, 0]} castShadow>
                    <boxGeometry args={[2.8, 6, 1]} />
                    <MeshDistortMaterial
                        color="#9333ea"
                        speed={2}
                        distort={0.4}
                        emissive="#9333ea"
                        emissiveIntensity={2}
                    />
                </mesh>
                {/* Hazard Stripes */}
                <mesh position={[0, 3, 0.51]}>
                    <planeGeometry args={[2.8, 1]} />
                    <meshBasicMaterial color="#ffff00" transparent opacity={0.5} />
                </mesh>
            </group>
        );
    }

    // Default Wall
    return (
        <group position={[xPos, 0, data.z]}>
            <mesh position={[0, 1.2, 0]} castShadow>
                <boxGeometry args={[2.8, 2.5, 0.8]} />
                <meshStandardMaterial
                    color="#f43f5e"
                    emissive="#f43f5e"
                    emissiveIntensity={4}
                    metalness={1}
                    roughness={0}
                />
            </mesh>
            <mesh position={[0, 1.2, 0]}>
                <boxGeometry args={[3, 2.7, 1]} />
                <meshBasicMaterial color="#fff" wireframe transparent opacity={0.1} />
            </mesh>
        </group>
    );
};

export const Coin: React.FC<{ data: CoinData }> = ({ data }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const xPos = data.lane * LANE_WIDTH;

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 4;
            meshRef.current.position.y = 1.2 + Math.sin(state.clock.elapsedTime * 3 + data.z) * 0.2;
        }
    });

    return (
        <Float speed={5} rotationIntensity={1} floatIntensity={1}>
            <mesh ref={meshRef} position={[xPos, 1.2, data.z]}>
                <octahedronGeometry args={[0.5, 0]} />
                <meshStandardMaterial
                    color="#00f3ff"
                    emissive="#00f3ff"
                    emissiveIntensity={10}
                    metalness={1}
                    roughness={0}
                />
            </mesh>
        </Float>
    );
};
