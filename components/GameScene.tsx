import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Player } from './Player';
import { FloorSegment, Obstacle, Coin } from './WorldObjects';
import { useGameStore } from '../store';
import { GameStatus, ObstacleData, CoinData, Lane } from '../types';
import * as THREE from 'three';

const SEGMENT_LENGTH = 20;
const VISIBLE_SEGMENTS = 6;
const LANE_WIDTH = 2.5;

export const GameScene: React.FC = () => {
  const { status, speed, score, addScore, setStatus, resetGame, increaseSpeed, isJumping, lane: playerLane } = useGameStore();
  
  // World State
  const [segments, setSegments] = useState<number[]>([0, 1, 2, 3, 4, 5]);
  const [obstacles, setObstacles] = useState<ObstacleData[]>([]);
  const [coins, setCoins] = useState<CoinData[]>([]);
  
  // Refs for collision optimization
  const playerZ = useRef(0);
  const speedRef = useRef(speed);
  
  // Sync speed ref
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // Reset Logic
  useEffect(() => {
    if (status === GameStatus.PLAYING && score === 0) {
        playerZ.current = 0;
        setSegments([0, 1, 2, 3, 4, 5]);
        setObstacles([]);
        setCoins([]);
    }
  }, [status, score]);

  // Spawning Logic
  const spawnObjects = (segmentIndex: number) => {
    const zBase = segmentIndex * SEGMENT_LENGTH;
    const newObstacles: ObstacleData[] = [];
    const newCoins: CoinData[] = [];

    // Simple procedural generation
    // Random chance for obstacle
    if (Math.random() > 0.3 && segmentIndex > 2) { // Don't spawn at start
        const lane = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        const type = Math.random() > 0.8 ? 'pit' : 'wall';
        newObstacles.push({
            id: `obs-${segmentIndex}-${Date.now()}`,
            z: -(zBase + Math.random() * SEGMENT_LENGTH),
            lane: lane as Lane,
            type: type
        });
    }

    // Coins in rows
    if (Math.random() > 0.4 && segmentIndex > 1) {
        const lane = Math.floor(Math.random() * 3) - 1;
        // Avoid placing coin exactly inside obstacle (simple check)
        const hasObstacle = newObstacles.some(o => o.lane === lane);
        if (!hasObstacle) {
            for(let i=0; i<3; i++) {
                newCoins.push({
                    id: `coin-${segmentIndex}-${i}-${Date.now()}`,
                    z: -(zBase + 5 + (i * 2)),
                    lane: lane as Lane
                });
            }
        }
    }

    return { newObstacles, newCoins };
  };

  useFrame((state, delta) => {
    if (status !== GameStatus.PLAYING) return;

    // Move Player Forward (visually, we move world backward or player forward, 
    // here we move player forward in negative Z to match Threejs convention of "into screen")
    // Actually, usually camera looks down -Z. So objects are at negative Z.
    // Let's hold Player at 0,0,0 and move Objects towards +Z.
    
    const distanceMoved = speedRef.current * delta;
    playerZ.current += distanceMoved;

    // Update Objects Z Position relative to player being stationary?
    // Optimization: It's often better to move the "Camera/Player container" through a static world for Physics
    // But for infinite runners without physics engine, moving objects +Z is easier to manage array.
    // Let's TRY moving objects +Z.
    
    setSegments(prev => {
       const firstSegZ = (prev[0] * SEGMENT_LENGTH); 
       // If the first segment has moved passed the camera (camera at 0, segment ends at +10)
       // Relative position calculation is tricky. 
       
       // Alternative: Player stays at 0. World moves +Z.
       // Obstacle Z starts at -50. Moves to +10.
       return prev;
    });

    // Let's implement the "Player stays at 0, World moves +Z" approach.
    // We need to mutate the obstacles positions in the state or ref? 
    // Mutating state every frame is bad for React.
    
    // APPROACH 2: Player moves -Z (forward). Camera follows.
    // Player Z decreases.
  });

  // REVISED APPROACH: Player is static (0,0,0). World Group moves +Z.
  // Actually, standard R3F runner: Everything moves towards camera.
  const worldRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
      if (status !== GameStatus.PLAYING || !worldRef.current) return;
      
      const moveAmount = speedRef.current * delta;
      worldRef.current.position.z += moveAmount;

      const currentWorldZ = worldRef.current.position.z;

      // 1. Check Collisions
      // Player is at (playerLane * 2.5, Y, 0)
      // Obstacle is at (obs.lane * 2.5, Y, obs.z + currentWorldZ)
      // Because obstacle.z is negative (placed ahead), adding currentWorldZ brings it close to 0.
      
      // Check Obstacles
      obstacles.forEach(obs => {
         const obsWorldZ = obs.z + currentWorldZ;
         
         // Collision Z range (approx depth of box is 1 or 2)
         if (obsWorldZ > -1 && obsWorldZ < 1) {
             if (obs.lane === playerLane) {
                 // Check vertical collision (Jump over pits?)
                 if (obs.type === 'pit') {
                      if (!isJumping) {
                          setStatus(GameStatus.GAME_OVER);
                      }
                 } else {
                     // Wall - Game Over
                     setStatus(GameStatus.GAME_OVER);
                 }
             }
         }
      });

      // Check Coins
      const remainingCoins: CoinData[] = [];
      let gathered = 0;
      coins.forEach(coin => {
          const coinWorldZ = coin.z + currentWorldZ;
          let collected = false;
          if (coinWorldZ > -1 && coinWorldZ < 1 && coin.lane === playerLane) {
              collected = true;
              gathered += 10;
          }
          
          if (!collected) {
              remainingCoins.push(coin);
          }
      });
      
      if (gathered > 0) {
          addScore(gathered);
          setCoins(remainingCoins);
      }

      // 2. Infinite Generation
      // Calculate which segment index we are currently "over"
      // currentWorldZ starts at 0 and increases.
      // Segment 0 was at 0 to -20. When worldZ is 20, segment 0 is at 20 to 0 (behind us).
      
      const frontSegmentIndex = Math.floor(currentWorldZ / SEGMENT_LENGTH);
      // We want to ensure we have segments up to frontSegmentIndex + VISIBLE_SEGMENTS
      
      const lastGeneratedIndex = segments[segments.length - 1];
      if (lastGeneratedIndex < frontSegmentIndex + VISIBLE_SEGMENTS) {
          const nextIndex = lastGeneratedIndex + 1;
          const { newObstacles, newCoins } = spawnObjects(nextIndex);
          
          setSegments(prev => [...prev.slice(1), nextIndex]); // Remove old, add new
          setObstacles(prev => [...prev.filter(o => o.z + currentWorldZ < 10), ...newObstacles]); // Cleanup old
          setCoins(prev => [...prev.filter(c => c.z + currentWorldZ < 10), ...newCoins]);
          
          // Difficulty curve
          if (nextIndex % 5 === 0) increaseSpeed();
          addScore(1); // Distance score
      }
  });

  return (
    <>
      <directionalLight position={[10, 20, 5]} intensity={1.5} castShadow />
      <ambientLight intensity={0.5} />
      
      <Player />

      <group ref={worldRef}>
        {segments.map(index => (
            <FloorSegment key={index} zPos={-(index * SEGMENT_LENGTH) - (SEGMENT_LENGTH/2)} />
        ))}
        {obstacles.map(obs => (
            <Obstacle key={obs.id} data={obs} />
        ))}
        {coins.map(coin => (
            <Coin key={coin.id} data={coin} />
        ))}
      </group>

      {/* Fog for distance hiding */}
      <fog attach="fog" args={['#050505', 10, 60]} />
    </>
  );
};