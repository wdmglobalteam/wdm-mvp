// --- filename: components/lessons/Celebration.tsx ---

'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CelebrationProps {
	variant: 'success' | 'failure';
	onComplete?: () => void;
	onNext?: () => void;
}

/**
 * Celebration animations (10 success variants + 1 failure)
 * Respects prefers-reduced-motion
 */
export default function Celebration({ variant, onComplete, onNext }: CelebrationProps) {
	const [showNext, setShowNext] = useState(false);
	const [successVariant] = useState(() => Math.floor(Math.random() * 10));

	// Respect reduced motion preference
	const prefersReducedMotion =
		typeof window !== 'undefined'
			? window.matchMedia('(prefers-reduced-motion: reduce)').matches
			: false;

	useEffect(() => {
		if (prefersReducedMotion) {
			setShowNext(true);
			return;
		}

		const timer = setTimeout(
			() => {
				setShowNext(true);
				onComplete?.();
			},
			variant === 'success' ? 1500 : 1000
		);

		return () => clearTimeout(timer);
	}, [variant, onComplete, prefersReducedMotion]);

	if (variant === 'failure') {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
			>
				<motion.div
					animate={
						prefersReducedMotion
							? {}
							: {
									x: [0, -10, 10, -10, 10, 0],
									rotate: [0, -2, 2, -2, 2, 0],
								}
					}
					transition={{ duration: 0.5 }}
					className="bg-red-950 border-4 border-red-600 rounded-lg p-12 text-center"
				>
					<div className="text-6xl mb-4">✗</div>
					<h2 className="text-3xl font-bold text-red-400 mb-2">Not Quite...</h2>
					<p className="text-gray-300">Review the tips and try again!</p>
				</motion.div>
			</motion.div>
		);
	}

	// Success animations (10 variants)
	const successAnimations = [
		// Variant 0: Scale burst
		<motion.div
			key="burst"
			initial={{ scale: 0, rotate: -180 }}
			animate={{ scale: 1, rotate: 0 }}
			transition={{ type: 'spring', stiffness: 200 }}
			className="text-8xl"
		>
			✓
		</motion.div>,

		// Variant 1: Confetti explosion
		<motion.div
			key="confetti"
			initial={{ y: -100, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ type: 'spring', damping: 10 }}
			className="text-8xl"
		>
			🎉
		</motion.div>,

		// Variant 2: Rising star
		<motion.div
			key="star"
			initial={{ y: 100, opacity: 0, scale: 0 }}
			animate={{ y: 0, opacity: 1, scale: 1 }}
			transition={{ duration: 0.8 }}
			className="text-8xl"
		>
			⭐
		</motion.div>,

		// Variant 3: Pulse checkmark
		<motion.div
			key="pulse"
			animate={
				prefersReducedMotion
					? {}
					: {
							scale: [1, 1.2, 1, 1.1, 1],
						}
			}
			transition={{ duration: 1 }}
			className="text-8xl text-green-500"
		>
			✓
		</motion.div>,

		// Variant 4: Trophy
		<motion.div
			key="trophy"
			initial={{ y: -50, rotate: -20 }}
			animate={{ y: 0, rotate: 0 }}
			transition={{ type: 'spring' }}
			className="text-8xl"
		>
			🏆
		</motion.div>,

		// Variant 5: Fire
		<motion.div
			key="fire"
			animate={
				prefersReducedMotion
					? {}
					: {
							scale: [1, 1.1, 1, 1.15, 1],
						}
			}
			className="text-8xl"
		>
			🔥
		</motion.div>,

		// Variant 6: Rocket
		<motion.div
			key="rocket"
			initial={{ y: 100, x: -50 }}
			animate={{ y: -20, x: 20 }}
			transition={{ duration: 1 }}
			className="text-8xl"
		>
			🚀
		</motion.div>,

		// Variant 7: Lightning
		<motion.div
			key="lightning"
			initial={{ opacity: 0, scale: 0.5 }}
			animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1, 1] }}
			transition={{ duration: 0.8 }}
			className="text-8xl"
		>
			⚡
		</motion.div>,

		// Variant 8: Crown
		<motion.div
			key="crown"
			initial={{ y: -100, rotate: 180 }}
			animate={{ y: 0, rotate: 0 }}
			transition={{ type: 'spring', bounce: 0.5 }}
			className="text-8xl"
		>
			👑
		</motion.div>,

		// Variant 9: Diamond
		<motion.div
			key="diamond"
			animate={
				prefersReducedMotion
					? {}
					: {
							rotate: [0, 360],
							scale: [1, 1.2, 1],
						}
			}
			transition={{ duration: 1.2 }}
			className="text-8xl"
		>
			💎
		</motion.div>,
	];

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
		>
			<div className="text-center">
				{successAnimations[successVariant]}

				<motion.h2
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
					className="text-4xl font-bold text-green-400 mt-6 mb-3"
				>
					Mastery Achieved!
				</motion.h2>

				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
					className="text-gray-300 text-lg mb-8"
				>
					You&apos;ve unlocked the next lesson
				</motion.p>

				{showNext && onNext && (
					<motion.button
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						onClick={onNext}
						className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
					>
						Continue →
					</motion.button>
				)}
			</div>
		</motion.div>
	);
}
