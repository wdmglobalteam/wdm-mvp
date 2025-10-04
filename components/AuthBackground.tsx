// components/AuthBackground.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * AuthBackground - a performant, simple starfield + soft lines background with cursor aura.
 * Designed to be lightweight and avoid undefined animation values.
 */

type Node = { id: number; x: number; y: number; vx: number; vy: number };

export default function AuthBackground() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const rafRef = useRef<number | null>(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    // initialize nodes
    const w = typeof window !== "undefined" ? window.innerWidth : 1200;
    const h = typeof window !== "undefined" ? window.innerHeight : 800;
    const n = Math.max(12, Math.floor((w * h) / 80000));
    const arr: Node[] = [];
    for (let i = 0; i < n; i++) {
      arr.push({
        id: i,
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      });
    }
    setNodes(arr);

    function onMove(e: MouseEvent) {
      mouse.current = { x: e.clientX, y: e.clientY };
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", () => {
      mouse.current = { x: -9999, y: -9999 };
    });

    let last = performance.now();
    function tick(now: number) {
      const dt = Math.min(50, now - last) / 16.666;
      last = now;
      setNodes((prev) =>
        prev.map((p) => {
          let nx = p.x + p.vx * dt;
          let ny = p.y + p.vy * dt;
          if (nx < 0 || nx > window.innerWidth) p.vx *= -1;
          if (ny < 0 || ny > window.innerHeight) p.vy *= -1;
          nx = Math.max(0, Math.min(window.innerWidth, nx));
          ny = Math.max(0, Math.min(window.innerHeight, ny));
          return { ...p, x: nx, y: ny };
        })
      );
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#001028] via-[#04102a] to-[#08102a] opacity-80"></div>

      {/* svg layer for lines */}
      <svg
        className="absolute inset-0 w-full h-full"
        width="100%"
        height="100%"
      >
        <defs>
          <linearGradient id="lineGrad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#00ff9f" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#39e6ff" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        {nodes.map((n) => (
          <circle
            key={n.id}
            cx={n.x}
            cy={n.y}
            r={1.2}
            fill="#8ef0d0"
            opacity={0.9}
          />
        ))}
        {nodes.map((a, i) =>
          nodes.slice(i + 1, i + 6).map((b) => {
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 180) return null;
            const opacity = Math.max(0, 0.22 - dist / 900);
            return (
              <line
                key={`${a.id}-${b.id}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="url(#lineGrad)"
                strokeWidth={0.8}
                strokeOpacity={opacity}
              />
            );
          })
        )}
      </svg>

      {/* floating aura - motion with defined initial values */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0.25, scale: 1 }}
          animate={{ opacity: [0.25, 0.5, 0.25], scale: [1, 1.08, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
          style={{
            position: "absolute",
            left: "20%",
            top: "10%",
            width: 240,
            height: 240,
            filter: "blur(36px)",
            background:
              "radial-gradient(circle at 30% 30%, rgba(99,102,241,0.12), rgba(0,255,159,0.06) 40%, transparent 70%)",
            transform: "translate(-50%,-50%)",
          }}
        />
      </AnimatePresence>
    </div>
  );
}
