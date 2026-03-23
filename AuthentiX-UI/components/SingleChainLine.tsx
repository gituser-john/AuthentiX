import React, { useEffect, useRef, useState } from 'react';
import { Dimensions } from 'react-native';
import { Polyline, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Animation Settings
const SPEED = 2.5; 
const BLOCK_DISTANCE = 90;

interface SingleChainLineProps {
  opacity: number;
}

export default function SingleChainLine({ opacity }: SingleChainLineProps) {
  // We group the state so React updates the Active and Fading lines together
  const [renderState, setRenderState] = useState({
    path: "",
    head: { x: -100, y: -100 },
    blocks: [] as { x: number, y: number }[],
    fadingPath: "",
    fadingBlocks: [] as { x: number, y: number }[],
    fadeProgress: 0,
  });

  const engineRef = useRef({
    x: Math.random() * (width - 100) + 50,
    y: -100 - (Math.random() * 500), // Random delay
    targetX: 0, targetY: 0,
    direction: 'down',
    path: "",
    distanceSinceLastBlock: 0,
    blocks: [] as { x: number, y: number }[],
    // The "Ghost Trail" data
    fadingPath: "",
    fadingBlocks: [] as { x: number, y: number }[],
    fadeProgress: 0, 
  });

  useEffect(() => {
    engineRef.current.targetX = engineRef.current.x;
    engineRef.current.targetY = 100;
    engineRef.current.path = `${engineRef.current.x},${engineRef.current.y}`;

    let animationFrameId: number;

    const renderLoop = () => {
      let { x, y, targetX, targetY, direction, path, distanceSinceLastBlock, blocks, fadingPath, fadingBlocks, fadeProgress } = engineRef.current;

      // === 1. PROCESS THE FADE OUT ===
      if (fadeProgress > 0) {
        fadeProgress -= 0.015; // Fades out over roughly 1 second
        if (fadeProgress < 0) fadeProgress = 0;
      }

      // === 2. PROCESS THE ACTIVE LINE ===
      const dx = targetX - x;
      const dy = targetY - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= SPEED) {
        // TURN
        x = targetX; y = targetY;
        path += ` ${x},${y}`;
        blocks.push({ x, y });
        distanceSinceLastBlock = 0;

        const moveDist = Math.floor(Math.random() * 200) + 100;
        
        if (direction === 'down') {
          direction = Math.random() > 0.5 ? 'left' : 'right';
          targetX = direction === 'left' ? x - moveDist : x + moveDist;
        } else {
          direction = 'down';
          targetY = y + moveDist;
        }

        if (targetX < 50) { targetX = 50; direction = 'down'; }
        if (targetX > width - 50) { targetX = width - 50; direction = 'down'; }

        // === 3. THE OVERLAP TRIGGER ===
        if (y > height + 100) {
          // Snapshot current line into the Ghost Trail
          fadingPath = path + ` ${x},${y}`;
          fadingBlocks = [...blocks];
          fadeProgress = 1.0; // Start the fade countdown

          // Instantly start the new line at the top
          x = Math.random() * (width - 100) + 50;
          y = -50; 
          targetX = x; targetY = y + 150;
          direction = 'down';
          path = `${x},${y}`;
          blocks = [];
        }

      } else {
        // MOVE
        const ratio = SPEED / distance;
        x += dx * ratio;
        y += dy * ratio;
        distanceSinceLastBlock += SPEED;

        if (distanceSinceLastBlock >= BLOCK_DISTANCE) {
          blocks.push({ x, y });
          distanceSinceLastBlock = 0;
        }
      }

      engineRef.current = { x, y, targetX, targetY, direction, path, distanceSinceLastBlock, blocks, fadingPath, fadingBlocks, fadeProgress };
      
      setRenderState({
        path: path + ` ${x},${y}`,
        head: { x, y },
        blocks: [...blocks],
        fadingPath,
        fadingBlocks,
        fadeProgress
      });

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const { path, head, blocks, fadingPath, fadingBlocks, fadeProgress } = renderState;

  return (
    <>
      {/* === THE GHOST LINE (Fading out) === */}
      {fadeProgress > 0 && (
        <>
          <Polyline points={fadingPath} fill="none" stroke="#000000" strokeWidth="1.2" strokeOpacity={opacity * fadeProgress} />
          {fadingBlocks.map((block, i) => (
            <Circle key={`fade-${i}`} cx={block.x} cy={block.y} r="4.2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.2" strokeOpacity={(opacity + 0.3) * fadeProgress} />
          ))}
        </>
      )}

      {/* === THE ACTIVE LINE (Drawing in) === */}
      <Polyline points={path} fill="none" stroke="#000000" strokeWidth="1.2" strokeOpacity={opacity} />
      {blocks.map((block, i) => (
        <Circle key={`active-${i}`} cx={block.x} cy={block.y} r="4.2" fill="#FFFFFF" stroke="#000000" strokeWidth="1.2" strokeOpacity={opacity + 0.3} />
      ))}
      <Circle cx={head.x} cy={head.y} r="8" fill="#000000" fillOpacity={opacity + 0.5} />
    </>
  );
}