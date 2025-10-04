// components/CursorEffect.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

interface Position {
  x: number;
  y: number;
}

interface CursorEffectProps {
  highlight?: boolean; // optional: lets you trigger the "hoveredNode" effect externally
}

export default function CursorEffect({ highlight = false }: CursorEffectProps) {
  const [pos, setPos] = useState<Position>({ x: -9999, y: -9999 });

  const springX = useSpring(pos.x, { stiffness: 150, damping: 30 });
  const springY = useSpring(pos.y, { stiffness: 150, damping: 30 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <motion.div
      className="pointer-events-none fixed rounded-full"
      style={{
        width: 128,
        height: 128,
        left: springX,
        top: springY,
        transform: "translate(-50%, -50%)",
        background:
          "radial-gradient(circle, rgba(0,255,159,0.1) 0%, transparent 70%)",
        filter: "blur(20px)",
        zIndex: 50,
      }}
      animate={{
        scale: highlight ? 1.5 : 1,
        opacity: highlight ? 0.6 : 0.3,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    />
  );
}
