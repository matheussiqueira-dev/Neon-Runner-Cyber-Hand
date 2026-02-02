import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

let handLandmarker: HandLandmarker | null = null;

export const initializeHandLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `/models/hand_landmarker.task`,
      delegate: "GPU"
    },
    runningMode: "VIDEO",
    numHands: 1
  });
  
  return handLandmarker;
};

export const detectHands = (video: HTMLVideoElement, startTimeMs: number) => {
  if (!handLandmarker) return null;
  return handLandmarker.detectForVideo(video, startTimeMs);
};

export enum GestureType {
  NONE = 'NONE',
  SWIPE_LEFT = 'SWIPE_LEFT',
  SWIPE_RIGHT = 'SWIPE_RIGHT',
  JUMP = 'JUMP',
  SLIDE = 'SLIDE'
}

// Configuration
const HISTORY_SIZE = 10; 
const COOLDOWN_MS = 350;
const SWIPE_THRESHOLD = 0.12; // Movement must be 12% of screen width
const DOMINANT_AXIS_FACTOR = 2.0; // Horizontal move must be 2x larger than vertical
const MAX_VERTICAL_DRIFT = 0.1; // Max allowed vertical movement during a swipe
const SWIPE_TIME_LIMIT = 300; // ms to complete the motion
const SWIPE_MIN_SPEED = 0.0006; // normalized units per ms

const JUMP_ZONE_Y = 0.25; // Top 25%
const SLIDE_ZONE_Y = 0.75; // Bottom 25%
const ZONE_HOLD_MS = 120; // require hold to reduce false positives
const ZONE_STABILITY_MAX_DRIFT = 0.08;

// State
const history: { x: number; y: number; time: number }[] = [];
let lastGestureTime = 0;
let smoothX = 0.5;
let smoothY = 0.5;
const ALPHA = 0.3; // Smoothing factor
let highZoneStart: number | null = null;
let lowZoneStart: number | null = null;
let lastZoneY = 0.5;

export const analyzeGesture = (landmarks: any[]): GestureType => {
  const now = Date.now();
  
  // Cooldown check
  if (now - lastGestureTime < COOLDOWN_MS) return GestureType.NONE;

  if (!landmarks || landmarks.length === 0) {
    history.length = 0;
    highZoneStart = null;
    lowZoneStart = null;
    return GestureType.NONE;
  }

  const hand = landmarks[0];
  const wrist = hand[0];
  const middleMcp = hand[9];
  
  // Calculate Center (Average of Wrist and Middle Finger)
  const rawX = (wrist.x + middleMcp.x) / 2;
  const rawY = (wrist.y + middleMcp.y) / 2;

  // Mirror X for screen coordinates (User moves Right -> Screen Right)
  const targetX = 1 - rawX;
  const targetY = rawY;

  // Exponential Smoothing
  if (history.length === 0) {
      smoothX = targetX;
      smoothY = targetY;
  } else {
      smoothX = smoothX * (1 - ALPHA) + targetX * ALPHA;
      smoothY = smoothY * (1 - ALPHA) + targetY * ALPHA;
  }

  history.push({ x: smoothX, y: smoothY, time: now });
  if (history.length > HISTORY_SIZE) history.shift();

  // 1. Static Pose Detection (Jump / Slide) takes priority
  // Jump: Hand High
  if (smoothY < JUMP_ZONE_Y) {
    if (highZoneStart === null) {
      highZoneStart = now;
      lastZoneY = smoothY;
    } else if (Math.abs(smoothY - lastZoneY) <= ZONE_STABILITY_MAX_DRIFT && (now - highZoneStart) >= ZONE_HOLD_MS) {
      lastGestureTime = now;
      history.length = 0; // Clear history to prevent swipe after jump
      highZoneStart = null;
      lowZoneStart = null;
      return GestureType.JUMP;
    }
    return GestureType.NONE;
  }
  highZoneStart = null;

  // Slide: Hand Low
  if (smoothY > SLIDE_ZONE_Y) {
    if (lowZoneStart === null) {
      lowZoneStart = now;
      lastZoneY = smoothY;
    } else if (Math.abs(smoothY - lastZoneY) <= ZONE_STABILITY_MAX_DRIFT && (now - lowZoneStart) >= ZONE_HOLD_MS) {
      lastGestureTime = now;
      history.length = 0;
      highZoneStart = null;
      lowZoneStart = null;
      return GestureType.SLIDE;
    }
    return GestureType.NONE;
  }
  lowZoneStart = null;

  // 2. Dynamic Swipe Detection
  // We need enough history to judge velocity
  if (history.length < 4) return GestureType.NONE;

  const start = history[0];
  const end = history[history.length - 1];
  
  const timeDiff = end.time - start.time;

  // If the history is too old (slow movement), don't count it as a swipe
  if (timeDiff > SWIPE_TIME_LIMIT) {
      return GestureType.NONE;
  }
  
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const speed = timeDiff > 0 ? absDx / timeDiff : 0;

  // Check if movement is fast enough and long enough
  if (absDx > SWIPE_THRESHOLD && speed >= SWIPE_MIN_SPEED) {
      // DOMINANT AXIS CHECK:
      // 1. Horizontal movement must be 2x vertical movement
      // 2. Vertical drift must not exceed MAX_VERTICAL_DRIFT (prevents steep diagonal swipes)
      if (absDx > absDy * DOMINANT_AXIS_FACTOR && absDy < MAX_VERTICAL_DRIFT) {
          lastGestureTime = now;
          history.length = 0; // Reset
          return dx < 0 ? GestureType.SWIPE_LEFT : GestureType.SWIPE_RIGHT;
      }
  }

  return GestureType.NONE;
};
