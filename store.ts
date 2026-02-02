import { create } from 'zustand';
import { GameStatus, GameState, Lane } from './types';

export const useGameStore = create<GameState>((set) => ({
  status: GameStatus.IDLE,
  score: 0,
  speed: 10,
  lane: Lane.CENTER,
  isJumping: false,
  isSliding: false,

  setStatus: (status) => set({ status }),
  addScore: (amount) => set((state) => ({ score: state.score + amount })),
  
  setLane: (lane) => set((state) => {
    // Clamp lane between -1 and 1
    if (lane < -1) return { lane: -1 };
    if (lane > 1) return { lane: 1 };
    return { lane };
  }),

  setJumping: (isJumping) => set({ isJumping }),
  setSliding: (isSliding) => set({ isSliding }),

  increaseSpeed: () => set((state) => ({ speed: Math.min(state.speed + 0.01, 18) })), // Gradual increase with cap

  resetGame: () => set({
    status: GameStatus.PLAYING,
    score: 0,
    speed: 12,
    lane: Lane.CENTER,
    isJumping: false,
    isSliding: false
  })
}));
