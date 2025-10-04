// components/PasswordStrengthMeter.tsx
"use client";
import React from "react";
import { motion } from "framer-motion";

type Props = {
  password: string;
  minLength?: number;
};

function checkRules(password: string, minLength = 6) {
  return {
    length: password.length >= minLength,
    number: /\d/.test(password),
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
  };
}

export default function PasswordStrengthMeter({ password, minLength = 6 }: Props) {
  const rules = checkRules(password, minLength);
  const score = Object.values(rules).reduce((a,b) => a + (b?1:0), 0);
  const pct = Math.floor((score / Object.keys(rules).length) * 100);
  const color = score <= 2 ? "bg-rose-500" : score === 3 ? "bg-amber-400" : "bg-emerald-400";

  return (
    <div className="p-3 rounded-md border border-gray-700 bg-[#041026]">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Password strength</div>
        <div className="text-xs text-gray-300">{pct}%</div>
      </div>
      <div className="mt-2 w-full bg-gray-800 h-2 rounded">
        <motion.div className={`${color} h-2 rounded`} style={{ width: `${pct}%` }} transition={{duration:0.25}} />
      </div>

      <ul className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-300">
        {[
          { key: "length", label: `At least ${minLength} characters` },
          { key: "number", label: "Contains a number" },
          { key: "symbol", label: "Contains a symbol" },
          { key: "upper", label: "Uppercase letter" },
          { key: "lower", label: "Lowercase letter" },
        ].map((r) => {
          const ok = (rules as any)[r.key];
          return (
            <li key={r.key} className="flex items-center gap-2">
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: ok ? 1 : 0.8, opacity: ok ? 1 : 0.6 }}
                transition={{ duration: 0.18 }}
                className={`w-5 h-5 flex items-center justify-center rounded-full ${ok ? "bg-emerald-400 text-black" : "bg-gray-800 border border-gray-700"}`}
                aria-hidden
              >
                {ok ? "✓" : "•"}
              </motion.span>
              <span className="text-xs">{r.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
