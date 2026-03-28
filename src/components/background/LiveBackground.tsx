"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

export type LiveBackgroundProps = {
  className?: string;
};

export default function LiveBackground({ className }: LiveBackgroundProps) {
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const [rawPos, setRawPos] = React.useState({ x: 0, y: 0 }); // Spotlight uchun real piksellar

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 1. Nisbiy koordinatalar (Parallax uchun: -1 dan 1 gacha)
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
      // 2. Absolyut piksellar (Spotlight uchun)
      setRawPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background",
        className
      )}
    >
      {/* 1. Grainy Noise Texture (Chuqurlik uchun) */}
      <div 
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* 2. DYNAMIC SPOTLIGHT - Sichqoncha turgan joyni yoritadi */}
      <div
        className="absolute inset-0 z-10 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px circle at ${rawPos.x}px ${rawPos.y}px, hsl(var(--primary) / 0.15), transparent 80%)`,
        }}
      />

      {/* 3. ASOSIY BLOB 1 (Markaziy - Sezuvchanlik yuqori) */}
      <div
        className="absolute -top-[10%] left-1/2 h-[800px] w-[800px] rounded-full blur-[120px] opacity-50 transition-transform duration-300 ease-out"
        style={{
          background: "radial-gradient(circle, hsl(var(--glow-1) / 0.7), transparent 70%)",
          // mousePos.x * 100 orqali siljishni 5 barobar oshirdik
          transform: `translate(calc(-50% + ${mousePos.x * 100}px), ${mousePos.y * 100}px)`,
        }}
      />

      {/* 4. ASOSIY BLOB 2 (Pastki chap - Teskari kuchli siljish) */}
      <div
        className="absolute -bottom-48 -left-24 h-[700px] w-[700px] rounded-full blur-[100px] opacity-40 transition-transform duration-500 ease-out"
        style={{
          background: "radial-gradient(circle, hsl(var(--glow-2) / 0.6), transparent 70%)",
          transform: `translate(${mousePos.x * -150}px, ${mousePos.y * -150}px)`,
        }}
      />

      {/* 5. ASOSIY BLOB 3 (Pastki o'ng - Juda sezuvchan) */}
      <div
        className="absolute -bottom-48 -right-24 h-[700px] w-[700px] rounded-full blur-[100px] opacity-40 transition-transform duration-700 ease-out"
        style={{
          background: "radial-gradient(circle, hsl(var(--glow-3) / 0.6), transparent 70%)",
          transform: `translate(${mousePos.x * 180}px, ${mousePos.y * 180}px)`,
        }}
      />

      {/* 6. Mesh Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-background/10 to-background/95" />

      {/* 7. Grid Pattern (Harakatni sezishni osonlashtiradi) */}
      <div 
        className="absolute inset-0 opacity-[0.15]" 
        style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)/0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)/0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, black, transparent)'
        }}
      />
    </div>
  );
}