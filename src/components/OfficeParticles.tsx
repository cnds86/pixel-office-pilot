import { useState, useEffect, useMemo } from "react";

// ─── Coffee Steam Particles ───
interface SteamParticle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
}

export function CoffeeSteam({ originX, originY }: { originX: number; originY: number }) {
  const particles = useMemo<SteamParticle[]>(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: -4 + Math.random() * 8,
      delay: Math.random() * 2,
      duration: 1.5 + Math.random() * 1.5,
      size: 2 + Math.random() * 3,
    }));
  }, []);

  return (
    <div className="absolute pointer-events-none z-15" style={{ left: originX, top: originY }}>
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full animate-steam"
          style={{
            left: p.x,
            width: p.size,
            height: p.size,
            backgroundColor: "hsl(0 0% 80% / 0.3)",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Dust in Light Particles ───
interface DustParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  driftX: number;
}

export function DustInLight({ originX, originY, width, height }: {
  originX: number; originY: number; width: number; height: number;
}) {
  const particles = useMemo<DustParticle[]>(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1 + Math.random() * 2,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 6,
      driftX: -10 + Math.random() * 20,
    }));
  }, [width, height]);

  return (
    <div className="absolute pointer-events-none z-15" style={{ left: originX, top: originY, width, height }}>
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full animate-dust-float"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: "hsl(45 60% 80% / 0.4)",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            // @ts-ignore
            "--drift-x": `${p.driftX}px`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Monitor Glow Flicker ───
export function MonitorGlow({ originX, originY, color = "hsl(200 80% 60%)" }: {
  originX: number; originY: number; color?: string;
}) {
  const delay = useMemo(() => Math.random() * 3, []);
  const duration = useMemo(() => 2 + Math.random() * 4, []);

  return (
    <div
      className="absolute pointer-events-none z-5 rounded-full animate-monitor-flicker"
      style={{
        left: originX - 12,
        top: originY - 8,
        width: 24,
        height: 16,
        background: `radial-gradient(ellipse, ${color.replace(")", " / 0.12)")}, transparent)`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    />
  );
}

// ─── Ambient Sparkle (general atmosphere) ───
export function AmbientSparkles({ canvasW, canvasH }: { canvasW: number; canvasH: number }) {
  const sparkles = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * canvasW,
      y: Math.random() * canvasH,
      size: 1 + Math.random() * 1.5,
      delay: Math.random() * 8,
      duration: 3 + Math.random() * 5,
    }));
  }, [canvasW, canvasH]);

  return (
    <>
      {sparkles.map(s => (
        <div
          key={s.id}
          className="absolute pointer-events-none z-5 rounded-full animate-sparkle"
          style={{
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            backgroundColor: "hsl(45 80% 90% / 0.2)",
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </>
  );
}
