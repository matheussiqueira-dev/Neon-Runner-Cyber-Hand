import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import { Stars, Float } from '@react-three/drei';
import { Player } from './Player';
import { FloorSegment, Obstacle, Coin } from './WorldObjects';
import { useGameStore } from '../store';
import { GameStatus, ObstacleData, CoinData, Lane } from '../types';
import * as THREE from 'three';

const SEGMENT_LENGTH = 30;
const VISIBLE_SEGMENTS = 8;

export const GameScene: React.FC = () => {
    const status = useGameStore(s => s.status);
    const speed = useGameStore(s => s.speed);
    const score = useGameStore(s => s.score);
    const addScore = useGameStore(s => s.addScore);
    const setStatus = useGameStore(s => s.setStatus);
    const increaseSpeed = useGameStore(s => s.increaseSpeed);
    const isJumping = useGameStore(s => s.isJumping);
    const isSliding = useGameStore(s => s.isSliding);
    const playerLane = useGameStore(s => s.lane);

    // World State
    const [segments, setSegments] = useState<number[]>(Array.from({ length: VISIBLE_SEGMENTS }, (_, i) => i));
    const [obstacles, setObstacles] = useState<ObstacleData[]>([]);
    const [coins, setCoins] = useState<CoinData[]>([]);

    const worldRef = useRef<THREE.Group>(null);
    const speedRef = useRef(speed);

    useEffect(() => { speedRef.current = speed; }, [speed]);

    // Reset Logic
    useEffect(() => {
        if (status === GameStatus.PLAYING && score === 0) {
            if (worldRef.current) worldRef.current.position.set(0, 0, 0);
            setSegments(Array.from({ length: VISIBLE_SEGMENTS }, (_, i) => i));
            setObstacles([]);
            setCoins([]);
        }
    }, [status, score]);

    const spawnObjects = (segmentIndex: number) => {
        const zBase = segmentIndex * SEGMENT_LENGTH;
        const newObstacles: ObstacleData[] = [];
        const newCoins: CoinData[] = [];

        // Increase difficulty by increasing spawn rate
        const spawnChance = Math.min(0.2 + (segmentIndex * 0.005), 0.5);

        if (Math.random() < spawnChance && segmentIndex > 2) {
            const lane = Math.floor(Math.random() * 3) - 1;
            const roll = Math.random();
            const type: ObstacleData["type"] = roll > 0.8 ? 'pit' : (roll > 0.5 ? 'tall' : 'wall');
            newObstacles.push({
                id: `obs-${segmentIndex}-${Date.now()}`,
                z: -(zBase + Math.random() * (SEGMENT_LENGTH - 5)),
                lane: lane as Lane,
                type: type
            });
        }

        if (Math.random() > 0.3 && segmentIndex > 1) {
            const lane = Math.floor(Math.random() * 3) - 1;
            const hasObstacle = newObstacles.some(o => o.lane === lane);
            if (!hasObstacle) {
                for (let i = 0; i < 5; i++) {
                    newCoins.push({
                        id: `coin-${segmentIndex}-${i}-${Date.now()}`,
                        z: -(zBase + 5 + (i * 3)),
                        lane: lane as Lane
                    });
                }
            }
        }

        return { newObstacles, newCoins };
    };

    useFrame((state, delta) => {
        if (status !== GameStatus.PLAYING || !worldRef.current) return;

        const moveAmount = speedRef.current * delta;
        worldRef.current.position.z += moveAmount;

        const currentWorldZ = worldRef.current.position.z;

        // Obstacle Collisions
        obstacles.forEach(obs => {
            const obsWorldZ = obs.z + currentWorldZ;
            if (obsWorldZ > -0.8 && obsWorldZ < 0.8 && obs.lane === playerLane) {
                if (obs.type === 'pit' && !isJumping) setStatus(GameStatus.GAME_OVER);
                else if (obs.type === 'tall' && !isSliding) setStatus(GameStatus.GAME_OVER);
                else if (obs.type === 'wall' && !isJumping) setStatus(GameStatus.GAME_OVER);
            }
        });

        // Coin Collisions
        const remainingCoins: CoinData[] = [];
        let gathered = 0;
        coins.forEach(coin => {
            const coinWorldZ = coin.z + currentWorldZ;
            if (coinWorldZ > -1.2 && coinWorldZ < 1.2 && coin.lane === playerLane && Math.abs(state.camera.position.y - 1) < 2) {
                gathered += 50;
            } else {
                remainingCoins.push(coin);
            }
        });

        if (gathered > 0) {
            addScore(gathered);
            setCoins(remainingCoins);
        }

        // Generation
        const frontSegmentIndex = Math.floor(currentWorldZ / SEGMENT_LENGTH);
        const lastGeneratedIndex = segments[segments.length - 1];

        if (lastGeneratedIndex < frontSegmentIndex + VISIBLE_SEGMENTS) {
            const nextIndex = lastGeneratedIndex + 1;
            const { newObstacles, newCoins } = spawnObjects(nextIndex);

            setSegments(prev => [...prev.slice(1), nextIndex]);
            setObstacles(prev => [...prev.filter(o => o.z + currentWorldZ < 20), ...newObstacles]);
            setCoins(prev => [...prev.filter(c => c.z + currentWorldZ < 20), ...newCoins]);

            if (nextIndex % 3 === 0) increaseSpeed();
            addScore(10);
        }
    });

    return (
        <>
            <color attach="background" args={['#020205']} />
            <fog attach="fog" args={['#020205', 20, 90]} />

            <ambientLight intensity={0.2} />
            <pointLight position={[0, 10, -10]} intensity={2} color="#00f3ff" />
            <pointLight position={[0, 5, 5]} intensity={1} color="#ff00ff" />

            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            <Player />

            <group ref={worldRef}>
                {segments.map(index => (
                    <FloorSegment key={index} zPos={-(index * SEGMENT_LENGTH) - (SEGMENT_LENGTH / 2)} />
                ))}
                {obstacles.map(obs => (
                    <Obstacle key={obs.id} data={obs} />
                ))}
                {coins.map(coin => (
                    <Coin key={coin.id} data={coin} />
                ))}
            </group>

            <EffectComposer disableNormalPass>
                <Bloom
                    luminanceThreshold={1.0}
                    mipmapBlur
                    intensity={1.5}
                    radius={0.4}
                />
                <ChromaticAberration offset={new THREE.Vector2(0.001, 0.001)} />
                <Noise opacity={0.05} />
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
        </>
    );
};
