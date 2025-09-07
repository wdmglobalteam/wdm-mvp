'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';

const pillars = [
	{ id: 1, name: 'HTML & CSS Foundations', x: 20, y: 60, active: true },
	{ id: 2, name: 'JavaScript Fundamentals', x: 35, y: 30, active: false },
	{ id: 3, name: 'React Components', x: 50, y: 20, active: false },
	{ id: 4, name: 'Advanced Styling', x: 65, y: 30, active: false },
	{ id: 5, name: 'State Management', x: 80, y: 60, active: false },
];

const connections = [
	{ from: 1, to: 2 },
	{ from: 2, to: 3 },
	{ from: 3, to: 4 },
	{ from: 4, to: 5 },
];

export function HeroSection() {
	const [hoveredPillar, setHoveredPillar] = useState<number | null>(null);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const getConnectionPath = (from: (typeof pillars)[0], to: (typeof pillars)[0]) => {
		const dx = to.x - from.x;
		const midX = from.x + dx * 0.5;
		const midY = Math.min(from.y, to.y) - 10;

		return `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;
	};

	if (!mounted) return null;

	return (
		<section className="relative min-h-screen flex items-center justify-center overflow-hidden">
			{/* Starfield Background */}
			<div className="absolute inset-0">
				{[...Array(50)].map((_, i) => (
					<motion.div
						key={i}
						className="absolute w-1 h-1 bg-white/20 rounded-full"
						style={{
							left: `${Math.random() * 100}%`,
							top: `${Math.random() * 100}%`,
						}}
						animate={{
							opacity: [0.2, 0.8, 0.2],
							scale: [1, 1.5, 1],
						}}
						transition={{
							duration: 2 + Math.random() * 3,
							repeat: Infinity,
							delay: Math.random() * 2,
						}}
					/>
				))}
			</div>

			{/* Pillar Map */}
			<div className="relative w-full max-w-6xl mx-auto px-4">
				<svg
					viewBox="0 0 100 80"
					className="w-full h-96 md:h-[500px]"
					style={{ filter: 'drop-shadow(0 0 20px rgba(0, 255, 159, 0.3))' }}
				>
					{/* Connection Lines */}
					{connections.map((conn, index) => {
						const fromPillar = pillars.find((p) => p.id === conn.from)!;
						const toPillar = pillars.find((p) => p.id === conn.to)!;

						return (
							<motion.path
								key={index}
								d={getConnectionPath(fromPillar, toPillar)}
								stroke="url(#pulseGradient)"
								strokeWidth="0.3"
								fill="none"
								initial={{ pathLength: 0 }}
								animate={{ pathLength: 1 }}
								transition={{ duration: 2, delay: index * 0.5 }}
							/>
						);
					})}

					{/* Gradient Definitions */}
					<defs>
						<linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
							<stop offset="0%" stopColor="#00ff9f" stopOpacity="0.8">
								<animate
									attributeName="stop-opacity"
									values="0.8;0.3;0.8"
									dur="2s"
									repeatCount="indefinite"
								/>
							</stop>
							<stop offset="50%" stopColor="#39e6ff" stopOpacity="1">
								<animate attributeName="stop-opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
							</stop>
							<stop offset="100%" stopColor="#00ff9f" stopOpacity="0.8">
								<animate
									attributeName="stop-opacity"
									values="0.8;0.3;0.8"
									dur="2s"
									repeatCount="indefinite"
								/>
							</stop>
						</linearGradient>

						<radialGradient id="pillarGlow" cx="50%" cy="50%" r="50%">
							<stop offset="0%" stopColor="#00ff9f" stopOpacity="0.8" />
							<stop offset="70%" stopColor="#00ff9f" stopOpacity="0.3" />
							<stop offset="100%" stopColor="#00ff9f" stopOpacity="0" />
						</radialGradient>
					</defs>

					{/* Pillars */}
					{pillars.map((pillar) => (
						<g key={pillar.id}>
							{/* Glow Effect */}
							{(pillar.active || hoveredPillar === pillar.id) && (
								<motion.circle
									cx={pillar.x}
									cy={pillar.y}
									r="4"
									fill="url(#pillarGlow)"
									initial={{ scale: 0 }}
									animate={{ scale: pillar.active ? [1, 1.2, 1] : 1 }}
									transition={{
										duration: pillar.active ? 2 : 0.3,
										repeat: pillar.active ? Infinity : 0,
									}}
								/>
							)}

							{/* Main Pillar Node */}
							<motion.circle
								cx={pillar.x}
								cy={pillar.y}
								r={pillar.active ? '2.5' : '2'}
								fill={pillar.active ? '#00ff9f' : hoveredPillar === pillar.id ? '#39e6ff' : '#ffffff'}
								stroke={pillar.active ? '#00ff9f' : '#ffffff'}
								strokeWidth="0.2"
								className="cursor-pointer"
								onMouseEnter={() => setHoveredPillar(pillar.id)}
								onMouseLeave={() => setHoveredPillar(null)}
								whileHover={{ scale: 1.2 }}
								whileTap={{ scale: 0.9 }}
							/>

							{/* Tooltip */}
							{hoveredPillar === pillar.id && (
								<motion.g
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.8 }}
								>
									<rect
										x={pillar.x - 8}
										y={pillar.y - 8}
										width="16"
										height="4"
										rx="1"
										fill="rgba(0, 0, 0, 0.8)"
										stroke="#00ff9f"
										strokeWidth="0.1"
									/>
									<text
										x={pillar.x}
										y={pillar.y - 6}
										textAnchor="middle"
										className="fill-white text-[2px] font-medium"
									>
										{pillar.name}
									</text>
								</motion.g>
							)}
						</g>
					))}
				</svg>

				{/* CTA Overlay */}
				<motion.div
					className="absolute inset-0 flex flex-col items-center justify-center text-center z-10"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 1, duration: 0.8 }}
				>
					<motion.h1
						className="text-4xl md:text-6xl text-white mb-6 tracking-tight"
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 1.2, duration: 0.6 }}
					>
						Master Web Development
					</motion.h1>

					<motion.p
						className="text-xl text-gray-300 mb-8 max-w-2xl"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1.4, duration: 0.6 }}
					>
						Journey through interconnected learning paths designed for true mastery
					</motion.p>

					<div className="flex flex-col sm:flex-row gap-4">
						<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
							<Button
								size="lg"
								className="bg-[#00ff9f] text-black hover:bg-[#00ff9f]/90 border-2 border-[#00ff9f] shadow-[0_0_20px_rgba(0,255,159,0.5)] hover:shadow-[0_0_30px_rgba(0,255,159,0.7)] transition-all duration-300"
							>
								⚡ Start Your Path
							</Button>
						</motion.div>

						<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
							<Button
								variant="outline"
								size="lg"
								className="border-[#39e6ff] text-[#39e6ff] hover:bg-[#39e6ff]/10 hover:border-[#39e6ff] transition-all duration-300"
							>
								Explore First
							</Button>
						</motion.div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
