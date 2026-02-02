import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store';
import { initializeHandLandmarker, detectHands, analyzeGesture, GestureType } from '../services/gestureService';
import { GameStatus } from '../types';

export const CyberHand: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGesture, setLastGesture] = useState<string>("");
  const requestRef = useRef<number>();
  const gestureTimeoutRef = useRef<number | null>(null);
  const lastDetectTimeRef = useRef(0);
  const lastResultsRef = useRef<any[] | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const DETECTION_INTERVAL_MS = 40; // ~25 FPS for detection

  useEffect(() => {
    const setupCamera = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera not supported/permitted");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" }
        });
        
        if (videoRef.current) {
          streamRef.current = stream;
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', async () => {
            try {
              await initializeHandLandmarker();
              setIsLoaded(true);
            } catch (initErr) {
              console.error("Error initializing hand landmarker:", initErr);
              setError("Failed to initialize hand tracking");
            }
          }, { once: true });
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Camera access denied");
      }
    };

    setupCamera();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (gestureTimeoutRef.current) window.clearTimeout(gestureTimeoutRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const drawCyberHand = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    if (!landmarks || landmarks.length === 0) return;

    const hand = landmarks[0];
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [0, 9], [9, 10], [10, 11], [11, 12], // Middle
      [0, 13], [13, 14], [14, 15], [15, 16], // Ring
      [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [5, 9], [9, 13], [13, 17] // Palm
    ];

    // Style
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw Connections (Neon Lines)
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#00f3ff'; // Neon Cyan
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f3ff';

    connections.forEach(([start, end]) => {
      const p1 = hand[start];
      const p2 = hand[end];
      
      // Mirror X because webcam is mirrored
      const x1 = (1 - p1.x) * ctx.canvas.width;
      const y1 = p1.y * ctx.canvas.height;
      const x2 = (1 - p2.x) * ctx.canvas.width;
      const y2 = p2.y * ctx.canvas.height;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    // Draw Joints (Glowing Nodes)
    hand.forEach((point: any) => {
        const x = (1 - point.x) * ctx.canvas.width;
        const y = point.y * ctx.canvas.height;
        
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#ff00ff'; // Neon Magenta
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff00ff';
        ctx.fill();
        
        // Inner white core
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 0;
        ctx.fill();
    });
  };

  const tick = (time: number) => {
    if (videoRef.current && canvasRef.current && isLoaded) {
      if (videoRef.current.readyState >= 2 && (time - lastDetectTimeRef.current) >= DETECTION_INTERVAL_MS) {
        const results = detectHands(videoRef.current, Date.now());
        lastDetectTimeRef.current = time;
        lastResultsRef.current = results && results.landmarks.length > 0 ? results.landmarks : null;
      }
      
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        if (lastResultsRef.current && lastResultsRef.current.length > 0) {
           drawCyberHand(ctx, lastResultsRef.current);
           
           // CRITICAL FIX: Access store state directly to avoid stale closures in loop
           const currentStatus = useGameStore.getState().status;
           
           if (currentStatus === GameStatus.PLAYING) {
             const gesture = analyzeGesture(lastResultsRef.current);
             
             if (gesture !== GestureType.NONE) {
                 setLastGesture(gesture);
                 // Clear visual feedback after a moment
                 if (gestureTimeoutRef.current) window.clearTimeout(gestureTimeoutRef.current);
                 gestureTimeoutRef.current = window.setTimeout(() => setLastGesture(""), 800);

                 const state = useGameStore.getState();
                 
                 switch(gesture) {
                    case GestureType.SWIPE_LEFT:
                        if (state.lane > -1) state.setLane(state.lane - 1);
                        break;
                    case GestureType.SWIPE_RIGHT:
                        if (state.lane < 1) state.setLane(state.lane + 1);
                        break;
                    case GestureType.JUMP:
                        if (!state.isJumping) state.setJumping(true);
                        break;
                    case GestureType.SLIDE:
                        if (!state.isSliding) state.setSliding(true);
                        break;
                 }
             }
           }
        } else {
           ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
      }
    }
    requestRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(tick);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isLoaded]); // Dependencies reduced to prevent loop restart

  return (
    <div className="absolute top-4 right-4 z-50 w-[640px] h-[480px] bg-black/50 border border-cyan-500 rounded-lg overflow-hidden backdrop-blur-sm shadow-[0_0_15px_rgba(0,243,255,0.3)] origin-top-right transform scale-75 md:scale-100">
      {/* Hidden Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute top-0 left-0 w-full h-full object-cover opacity-20 transform scale-x-[-1]" 
      />
      {/* Visualizer Canvas */}
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="absolute top-0 left-0 w-full h-full object-contain"
      />
      
      {/* Gesture Feedback Overlay */}
      {lastGesture && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <span className="text-4xl font-black text-yellow-400 font-display animate-ping opacity-75">{lastGesture}</span>
          </div>
      )}

      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-cyan-400 text-xs font-mono animate-pulse">
          INIT_SENSORS...
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-red-400 text-xs font-mono">
          {error}
        </div>
      )}
      <div className="absolute bottom-0 left-0 w-full bg-cyan-900/80 text-[10px] text-cyan-100 px-2 py-1 font-mono flex justify-between">
        <span>HAND_TRACKING</span>
        <span className={isLoaded ? "text-green-400" : "text-red-400"}>{isLoaded ? "ONLINE" : "OFFLINE"}</span>
      </div>
    </div>
  );
};
