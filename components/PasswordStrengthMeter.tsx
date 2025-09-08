// components/PasswordStrengthMeter.tsx
'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export type ComplexityResult = {
	length: boolean;
	number: boolean;
	upper: boolean;
	lower: boolean;
	symbol: boolean;
	score: number; // 0..100
	valid: boolean;
};

export function validatePasswordComplexity(pw: string, minLen = 6): ComplexityResult {
	const length = pw.length >= minLen;
	const number = /[0-9]/.test(pw);
	const upper = /[A-Z]/.test(pw);
	const lower = /[a-z]/.test(pw);
	const symbol = /[^A-Za-z0-9]/.test(pw);

	const rules = [length, number, upper, lower, symbol];
	const passed = rules.filter(Boolean).length;
	const score = Math.round((passed / rules.length) * 100);
	const valid = passed === rules.length;

	return { length, number, upper, lower, symbol, score, valid };
}

export default function PasswordStrengthMeter({
	password,
	minLength = 6,
	className = '',
}: {
	password: string;
	minLength?: number;
	className?: string;
}) {
	const res = useMemo(
		() => validatePasswordComplexity(password ?? '', minLength),
		[password, minLength]
	);

	// color mapping: red -> amber -> emerald
	const color =
		res.score < 40
			? 'from-[#ff6b6b] to-[#ffb97a]'
			: res.score < 80
			? 'from-[#ffb97a] to-[#ffd86b]'
			: 'from-[#00ff9f] to-[#39e6ff]';

	return (
		<div className={`w-full ${className}`}>
			{/* progress bar */}
			<div className="w-full bg-white/4 rounded-full h-2 overflow-hidden mb-3">
				<motion.div
					className={`h-2 rounded-full bg-gradient-to-r ${color}`}
					initial={{ width: 0 }}
					animate={{ width: `${res.score}%` }}
					transition={{ type: 'spring', stiffness: 120, damping: 18 }}
					aria-hidden
				/>
			</div>

			{/* rules list */}
			<div className="grid grid-cols-1 gap-1 text-xs">
				<RuleRow label={`Min ${minLength} characters`} passed={res.length} />
				<RuleRow label="At least 1 number" passed={res.number} />
				<RuleRow label="At least 1 uppercase" passed={res.upper} />
				<RuleRow label="At least 1 lowercase" passed={res.lower} />
				<RuleRow label="At least 1 symbol" passed={res.symbol} />
			</div>

			{/* hidden accessible text */}
			<div className="sr-only" aria-live="polite">
				{res.valid
					? 'Password meets complexity requirements.'
					: `Password strength ${res.score} percent.`}
			</div>
		</div>
	);
}

function RuleRow({ label, passed }: { label: string; passed: boolean }) {
	return (
		<div className="flex items-center gap-2">
			<span
				className={`w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-medium ${
					passed
						? 'bg-[#00ff9f] text-black shadow-[0_0_8px_rgba(0,255,159,0.2)]'
						: 'bg-white/6 text-gray-300'
				}`}
				aria-hidden
			>
				{passed ? '✓' : '–'}
			</span>
			<span className={`text-xs ${passed ? 'text-emerald-300' : 'text-gray-400'}`}>{label}</span>
		</div>
	);
}
