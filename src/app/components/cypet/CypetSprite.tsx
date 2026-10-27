// src/components/cypet/CypetSprite.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';

// Caché en memoria para evitar recargas de red
const atlasCache = new Map<string, any>();
const imageCache = new Map<string, HTMLImageElement>();

export interface CypetSpriteProps {
  species: string;
  speciesFolder?: string;
  evolution?: string;
  animation: string;
  size?: number;
  loop?: boolean;
  onAnimationEnd?: () => void;
  className?: string;
  label?: string;
}

export default function CypetSprite({
  species,
  speciesFolder,
  evolution,
  animation,
  size = 256,
  loop = true,
  onAnimationEnd,
  className = '',
  label,
}: CypetSpriteProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    let animFrameId: number | null = null;

    const folderName = speciesFolder || species;
    if (!folderName) return;

    const basePath =
      evolution && evolution !== 'baby'
        ? `/sprites/${folderName}/${evolution}/${animation}`
        : `/sprites/${folderName}/${animation}`;

    const jsonUrl = `${basePath}.json`;
    const imgUrl = `${basePath}.png`;

    const loadResources = async () => {
      try {
        // 1. Obtener atlas (de caché o red)
        let atlas = atlasCache.get(jsonUrl);
        if (!atlas) {
          const res = await fetch(jsonUrl);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          atlas = await res.json();
          atlasCache.set(jsonUrl, atlas);
        }

        // 2. Obtener imagen (de caché o red)
        let img = imageCache.get(imgUrl);
        if (!img) {
          img = new Image();
          img.src = imgUrl;
          await new Promise<void>((resolve, reject) => {
            img!.onload = () => resolve();
            img!.onerror = () => reject(new Error(`Error cargando imagen ${imgUrl}`));
          });
          imageCache.set(imgUrl, img);
        }

        if (isCancelled) return;

        const frameKeys = Object.keys(atlas.frames || {}).sort((a, b) => {
          const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
          const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
          return numA - numB;
        });

        if (frameKeys.length === 0) return;

        let currentFrameIndex = 0;
        let lastFrameTime = performance.now();

        const render = (time: number) => {
          if (isCancelled) return;

          const canvas = canvasRef.current;
          if (!canvas) {
            animFrameId = requestAnimationFrame(render);
            return;
          }

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            animFrameId = requestAnimationFrame(render);
            return;
          }

          const frameData = atlas.frames[frameKeys[currentFrameIndex]];
          const duration = frameData?.duration || atlas.meta?.animgen?.frameDurationMs || 42;

          if (time - lastFrameTime >= duration) {
            lastFrameTime = time;

            if (frameData) {
              const { x, y, w, h } = frameData.frame;
              const scale = Math.min(size / w, size / h);
              const drawW = w * scale;
              const drawH = h * scale;
              const offsetX = (size - drawW) / 2;
              const offsetY = (size - drawH) / 2;

              ctx.clearRect(0, 0, size, size);
              ctx.drawImage(img!, x, y, w, h, offsetX, offsetY, drawW, drawH);
            }

            if (currentFrameIndex + 1 < frameKeys.length) {
              currentFrameIndex++;
            } else {
              if (loop) {
                currentFrameIndex = 0;
              } else {
                if (onAnimationEnd) onAnimationEnd();
                return;
              }
            }
          }

          animFrameId = requestAnimationFrame(render);
        };

        animFrameId = requestAnimationFrame(render);
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Error cargando animación');
        }
      }
    };

    loadResources();

    return () => {
      isCancelled = true;
      if (animFrameId !== null) {
        cancelAnimationFrame(animFrameId);
      }
    };
  }, [species, speciesFolder, evolution, animation, size, loop]);

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label || `${species} ${animation}`}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          imageRendering: 'pixelated',
        }}
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}