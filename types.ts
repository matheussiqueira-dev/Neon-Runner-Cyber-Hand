export enum GameStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export enum Lane {
  LEFT = -1,
  CENTER = 0,
  RIGHT = 1
}

export interface GameState {
  status: GameStatus;
  score: number;
  speed: number;
  lane: Lane;
  isJumping: boolean;
  isSliding: boolean;
  setStatus: (status: GameStatus) => void;
  addScore: (amount: number) => void;
  setLane: (lane: Lane) => void;
  setJumping: (jumping: boolean) => void;
  setSliding: (sliding: boolean) => void;
  resetGame: () => void;
  increaseSpeed: () => void;
}

export interface ObstacleData {
  id: string;
  z: number;
  lane: Lane;
  type: 'wall' | 'pit' | 'tall';
}

export interface CoinData {
  id: string;
  z: number;
  lane: Lane;
}