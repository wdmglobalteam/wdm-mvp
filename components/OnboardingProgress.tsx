// components/OnboardingProgress.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";

interface OnboardingProgressProps {
  percent: number; // 0..100
}

export default function OnboardingProgress({ percent }: OnboardingProgressProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const gradient = `linear-gradient(90deg, #00ff9f ${clamped}%, #39e6ff ${clamped}%)`;

  return (
    <div className="w-full">
      <div className="text-xs text-gray-400 mb-2">Onboarding progress</div>
      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-2 rounded-full"
          style={{ width: `${clamped}%`, background: gradient }}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 14 }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={clamped}
        />
      </div>
    </div>
  );
}
