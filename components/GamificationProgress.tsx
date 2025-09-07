'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Flame, Star, Zap, Trophy, Target, BookOpen } from 'lucide-react';

const progressStats = [
	{
		id: 1,
		title: 'Total Lessons',
		current: 42,
		total: 120,
		icon: BookOpen,
		color: '#00ff9f',
		description: 'Interactive lessons completed',
	},
	{
		id: 2,
		title: 'Modules Mastered',
		current: 3,
		total: 8,
		icon: Target,
		color: '#39e6ff',
		description: 'Complete learning modules',
	},
	{
		id: 3,
		title: 'Capstone Projects',
		current: 1,
		total: 4,
		icon: Trophy,
		color: '#ff6b6b',
		description: 'Real-world portfolio pieces',
	},
];

const badges = [
	{ id: 1, name: 'First Steps', icon: Star, earned: true, rarity: 'common' },
	{ id: 2, name: 'HTML Master', icon: Flame, earned: true, rarity: 'rare' },
	{ id: 3, name: 'CSS Wizard', icon: Zap, earned: true, rarity: 'epic' },
	{ id: 4, name: 'JS Ninja', icon: Target, earned: false, rarity: 'legendary' },
	{ id: 5, name: 'React Pro', icon: Trophy, earned: false, rarity: 'legendary' },
];

export function GamificationProgress() {
	const [showFutureJourney, setShowFutureJourney] = useState(false);
	const [animateConnections, setAnimateConnections] = useState(false);
	const [hoveredJourneyItem, setHoveredJourneyItem] = useState<number | null>(null);

	useEffect(() => {
		const timer = setTimeout(() => {
			setAnimateConnections(true);
		}, 1000);
		return () => clearTimeout(timer);
	}, []);

	const getRarityColor = (rarity: string) => {
		switch (rarity) {
			case 'common':
				return '#888';
			case 'rare':
				return '#00ff9f';
			case 'epic':
				return '#39e6ff';
			case 'legendary':
				return '#ff6b6b';
			default:
				return '#888';
		}
	};

	const CircularProgress = ({
		current,
		total,
		color,
		size = 120,
		delay = 0,
	}: {
		current: number;
		total: number;
		color: string;
		size?: number;
		delay?: number;
	}) => {
		const radius = (size - 12) / 2;
		const circumference = radius * 2 * Math.PI;
		const progress = (current / total) * 100;
		const strokeDasharray = circumference;
		const strokeDashoffset = circumference - (progress / 100) * circumference;

		return (
			<div className="relative" style={{ width: size, height: size }}>
				<svg width={size} height={size} className="transform -rotate-90">
					{/* Background circle */}
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						stroke="rgba(255, 255, 255, 0.1)"
						strokeWidth="6"
						fill="transparent"
					/>
					{/* Progress circle */}
					<motion.circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						stroke={color}
						strokeWidth="6"
						fill="transparent"
						strokeDasharray={strokeDasharray}
						strokeDashoffset={strokeDashoffset}
						strokeLinecap="round"
						initial={{ strokeDashoffset: circumference }}
						animate={{ strokeDashoffset }}
						transition={{ duration: 2, delay, ease: 'easeOut' }}
						style={{
							filter: `drop-shadow(0 0 10px ${color}50)`,
						}}
					/>
				</svg>

				{/* Center content */}
				<div className="absolute inset-0 flex flex-col items-center justify-center">
					<motion.span
						className="text-2xl text-white"
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: delay + 1.5, duration: 0.5, type: 'spring' }}
					>
						{current}
					</motion.span>
					<span className="text-gray-400 text-sm">of {total}</span>
				</div>

				{/* Completion celebration */}
				{current === total && (
					<motion.div
						className="absolute inset-0 flex items-center justify-center"
						initial={{ scale: 0, opacity: 0 }}
						animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
						transition={{ delay: delay + 2, duration: 0.8 }}
					>
						<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full animate-pulse" />
					</motion.div>
				)}
			</div>
		);
	};

	return (
		<section className="py-20 relative overflow-hidden">
			<div className="container mx-auto px-4">
				<motion.div
					className="text-center mb-16"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
				>
					<h2 className="text-3xl md:text-5xl text-white mb-4">Your Progress</h2>
					<p className="text-gray-300 text-lg max-w-2xl mx-auto">
						Track your journey and celebrate achievements
					</p>
				</motion.div>

				{/* Progress Rings */}
				<div className="grid md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
					{progressStats.map((stat, index) => {
						const IconComponent = stat.icon;

						return (
							<motion.div
								key={stat.id}
								className="text-center"
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.6, delay: index * 0.2 }}
							>
								<Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700 p-6 hover:border-[#00ff9f]/30 transition-colors duration-300">
									<CardContent className="p-0">
										<div className="flex flex-col items-center">
											<div className="relative mb-4">
												<CircularProgress
													current={stat.current}
													total={stat.total}
													color={stat.color}
													delay={index * 0.3}
												/>

												{/* Icon overlay */}
												<motion.div
													className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-8"
													initial={{ scale: 0 }}
													animate={{ scale: 1 }}
													transition={{ delay: index * 0.3 + 2, duration: 0.5 }}
												>
													<div
														className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center border-2"
														style={{ borderColor: stat.color }}
													>
														<IconComponent className="w-4 h-4" style={{ color: stat.color }} />
													</div>
												</motion.div>
											</div>

											<h3 className="text-white text-lg mb-2">{stat.title}</h3>
											<p className="text-gray-400 text-sm">{stat.description}</p>
										</div>
									</CardContent>
								</Card>

								{/* Connection lines (only for first two) */}
								{index < progressStats.length - 1 && (
									<div className="hidden md:block absolute top-1/2 left-full w-8 h-0.5">
										<motion.div
											className="h-full bg-gradient-to-r from-[#00ff9f] to-[#39e6ff] rounded-full"
											initial={{ scaleX: 0 }}
											animate={animateConnections && stat.current === stat.total ? { scaleX: 1 } : {}}
											transition={{ duration: 1, delay: index * 0.5 + 3 }}
											style={{ transformOrigin: 'left' }}
										/>

										{/* Pulse effect when completed */}
										{stat.current === stat.total && animateConnections && (
											<motion.div
												className="absolute inset-0 bg-[#00ff9f] rounded-full"
												initial={{ scaleX: 0 }}
												animate={{
													scaleX: [0, 1, 0],
													opacity: [0, 1, 0],
												}}
												transition={{
													duration: 1.5,
													delay: index * 0.5 + 3.5,
													ease: 'easeOut',
												}}
											/>
										)}
									</div>
								)}
							</motion.div>
						);
					})}
				</div>

				{/* Badges Section */}
				<motion.div
					className="text-center mb-12"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 0.8 }}
				>
					<h3 className="text-2xl text-white mb-8">Achievement Badges</h3>

					<div className="flex flex-wrap justify-center gap-4 mb-8">
						{badges.map((badge, index) => {
							const IconComponent = badge.icon;
							const color = getRarityColor(badge.rarity);

							return (
								<motion.div
									key={badge.id}
									className={`relative w-16 h-16 rounded-full border-2 flex items-center justify-center cursor-pointer ${
										badge.earned ? 'opacity-100' : 'opacity-40 grayscale'
									}`}
									style={{ borderColor: color }}
									initial={{ scale: 0, rotate: -180 }}
									whileInView={{ scale: 1, rotate: 0 }}
									viewport={{ once: true }}
									transition={{
										duration: 0.6,
										delay: index * 0.1 + 1,
										type: 'spring',
										stiffness: 200,
									}}
									whileHover={{ scale: 1.1 }}
								>
									{badge.earned && (
										<motion.div
											className="absolute inset-0 rounded-full"
											style={{
												background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
											}}
											animate={{
												scale: [1, 1.2, 1],
												opacity: [0.5, 0.8, 0.5],
											}}
											transition={{
												duration: 2,
												repeat: Infinity,
												delay: index * 0.3,
											}}
										/>
									)}

									<IconComponent className="w-6 h-6" style={{ color: badge.earned ? color : '#666' }} />

									{badge.earned && (
										<motion.div
											className="absolute -top-1 -right-1 w-6 h-6"
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											transition={{ delay: index * 0.1 + 1.5, type: 'spring' }}
										>
											<div className="w-full h-full bg-[#00ff9f] rounded-full flex items-center justify-center">
												<Star className="w-3 h-3 text-black" />
											</div>
										</motion.div>
									)}
								</motion.div>
							);
						})}
					</div>
				</motion.div>

				{/* Future Journey Toggle */}
				<motion.div
					className="text-center"
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 1.2 }}
				>
					<motion.button
						className="px-6 py-3 bg-transparent border border-[#39e6ff]/50 text-[#39e6ff] rounded-lg hover:bg-[#39e6ff]/10 transition-all duration-300"
						onClick={() => setShowFutureJourney(!showFutureJourney)}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						{showFutureJourney ? 'Hide Future Journey' : 'See Your Future Journey'}
					</motion.button>

					{showFutureJourney && (
						<motion.div
							className="mt-8 grid md:grid-cols-4 gap-4"
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.5 }}
						>
							{[
								{
									name: 'Advanced React',
									icon: '⚛️',
									status: 'next',
									description: 'Hooks, Context & Performance',
								},
								{
									name: 'Node.js Backend',
									icon: '🟢',
									status: 'upcoming',
									description: 'APIs, Express & Security',
								},
								{
									name: 'Database Design',
									icon: '🗄️',
									status: 'upcoming',
									description: 'SQL, NoSQL & Relations',
								},
								{ name: 'Deployment', icon: '🚀', status: 'upcoming', description: 'Docker, AWS & CI/CD' },
							].map((future, index) => {
								const isNext = future.status === 'next';
								const isHovered = hoveredJourneyItem === index;

								return (
									<motion.div
										key={future.name}
										className={`relative p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
											isNext
												? 'border-[#00ff9f]/60 bg-gradient-to-br from-[#00ff9f]/10 to-[#39e6ff]/5'
												: 'border-dashed border-gray-600 hover:border-gray-500'
										}`}
										initial={{ opacity: 0, y: 20 }}
										animate={{
											opacity: isNext ? 1 : isHovered ? 0.9 : 0.6,
											y: 0,
											scale: isHovered ? 1.02 : 1,
										}}
										transition={{ delay: index * 0.1, duration: 0.3 }}
										onHoverStart={() => setHoveredJourneyItem(index)}
										onHoverEnd={() => setHoveredJourneyItem(null)}
										whileHover={{
											borderColor: isNext ? '#00ff9f' : '#39e6ff',
											boxShadow: isNext
												? '0 0 20px rgba(0, 255, 159, 0.3)'
												: '0 0 15px rgba(57, 230, 255, 0.2)',
										}}
									>
										{/* Glow effect for next item */}
										{isNext && (
											<motion.div
												className="absolute inset-0 bg-gradient-to-br from-[#00ff9f]/20 to-[#39e6ff]/10 rounded-lg"
												animate={{
													opacity: [0.1, 0.3, 0.1],
													scale: [1, 1.02, 1],
												}}
												transition={{ duration: 3, repeat: Infinity }}
											/>
										)}

										<div
											className={`relative w-12 h-12 border-2 rounded-full mx-auto mb-3 flex items-center justify-center ${
												isNext
													? 'border-[#00ff9f] bg-[#00ff9f]/10'
													: isHovered
													? 'border-[#39e6ff] bg-[#39e6ff]/5'
													: 'border-dashed border-gray-500'
											}`}
										>
											{isNext ? (
												<motion.div
													className="text-lg"
													animate={{
														rotate: [0, 5, -5, 0],
														scale: [1, 1.1, 1],
													}}
													transition={{ duration: 2, repeat: Infinity }}
												>
													{future.icon}
												</motion.div>
											) : isHovered ? (
												<motion.div
													className="text-lg"
													initial={{ scale: 0.5, opacity: 0 }}
													animate={{ scale: 1, opacity: 1 }}
													transition={{ duration: 0.3 }}
												>
													{future.icon}
												</motion.div>
											) : (
												<motion.div
													className="w-2 h-2 bg-gray-500 rounded-full"
													animate={
														isNext
															? {
																	backgroundColor: ['#00ff9f', '#39e6ff', '#00ff9f'],
																	scale: [1, 1.2, 1],
															  }
															: isHovered
															? {
																	backgroundColor: '#39e6ff',
																	scale: 1.2,
															  }
															: {
																	opacity: [0.5, 1, 0.5],
															  }
													}
													transition={{ duration: isNext ? 2 : 1.5, repeat: Infinity }}
												/>
											)}

											{/* Active indicator */}
											{isNext && (
												<motion.div
													className="absolute -top-1 -right-1 w-4 h-4 bg-[#00ff9f] rounded-full flex items-center justify-center"
													initial={{ scale: 0, rotate: -180 }}
													animate={{ scale: 1, rotate: 0 }}
													transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
												>
													<div className="w-2 h-2 bg-black rounded-full" />
												</motion.div>
											)}
										</div>

										<motion.p
											className={`text-sm mb-1 ${
												isNext ? 'text-white' : isHovered ? 'text-gray-200' : 'text-gray-400'
											}`}
											animate={
												isNext
													? {
															color: ['#ffffff', '#00ff9f', '#ffffff'],
													  }
													: {}
											}
											transition={{ duration: 3, repeat: Infinity }}
										>
											{future.name}
										</motion.p>

										<motion.p
											className={`text-xs ${
												isNext ? 'text-[#00ff9f]' : isHovered ? 'text-[#39e6ff]' : 'text-gray-500'
											}`}
											initial={{ opacity: 0, height: 0 }}
											animate={{
												opacity: isNext || isHovered ? 1 : 0,
												height: isNext || isHovered ? 'auto' : 0,
											}}
											transition={{ duration: 0.3 }}
										>
											{future.description}
										</motion.p>

										{/* Progress hint for next item */}
										{isNext && (
											<motion.div
												className="absolute bottom-2 left-2 right-2 h-1 bg-gray-700 rounded-full overflow-hidden"
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												transition={{ delay: 1 }}
											>
												<motion.div
													className="h-full bg-gradient-to-r from-[#00ff9f] to-[#39e6ff]"
													initial={{ width: 0 }}
													animate={{ width: '15%' }}
													transition={{ duration: 2, delay: 1.5 }}
												/>
											</motion.div>
										)}

										{/* Floating particles for active item */}
										{isNext && (
											<>
												{[...Array(3)].map((_, particleIndex) => (
													<motion.div
														key={particleIndex}
														className="absolute w-1 h-1 bg-[#00ff9f] rounded-full opacity-60"
														style={{
															left: `${20 + Math.random() * 60}%`,
															top: `${20 + Math.random() * 60}%`,
														}}
														animate={{
															y: [-5, 5, -5],
															x: [-3, 3, -3],
															opacity: [0.3, 0.8, 0.3],
														}}
														transition={{
															duration: 2 + Math.random(),
															delay: particleIndex * 0.5,
															repeat: Infinity,
														}}
													/>
												))}
											</>
										)}
									</motion.div>
								);
							})}
						</motion.div>
					)}
				</motion.div>
			</div>
		</section>
	);
}
