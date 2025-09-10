'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, MotionValue } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { useTypewriter } from '../hooks/useTypewriter';
import { Target, Zap, Trophy, Code2, Sparkles, Award, Layers } from 'lucide-react';

const features = [
	{
		id: 1,
		title: 'Mastery-Driven Learning',
		promise: 'Progress only when you truly understand',
		icon: Target,
		demo: 'mastery-validation',
		description: 'Our adaptive system ensures deep comprehension before advancing',
		bgGradient: 'from-emerald-500/20 via-teal-500/20 to-cyan-500/20',
	},
	{
		id: 2,
		title: 'Interactive Coding',
		promise: 'Learn by building, not just watching',
		icon: Code2,
		demo: 'live-coding',
		description: 'Hands-on exercises with real-time feedback and guidance',
		bgGradient: 'from-blue-500/20 via-indigo-500/20 to-purple-500/20',
	},
	{
		id: 3,
		title: 'Gamified Progress',
		promise: 'Stay motivated with achievement systems',
		icon: Trophy,
		demo: 'achievement-unlock',
		description: 'Earn badges, track streaks, and celebrate milestones',
		bgGradient: 'from-amber-500/20 via-orange-500/20 to-red-500/20',
	},
	{
		id: 4,
		title: 'Precision Focus',
		promise: 'Quality over quantity, always',
		icon: Zap,
		demo: 'knowledge-synthesis',
		description: 'Curated content that eliminates fluff and maximizes learning',
		bgGradient: 'from-violet-500/20 via-purple-500/20 to-fuchsia-500/20',
	},
];

export function WhyWDM() {
	const containerRef = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ['start end', 'end start'],
	});

	return (
		<section ref={containerRef} className="py-20 relative overflow-hidden">
			<div className="container mx-auto px-4">
				<motion.div
					className="text-center mb-16"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
				>
					<h2 className="text-3xl md:text-5xl text-white mb-4">Why Choose WDM?</h2>
					<p className="text-gray-300 text-lg max-w-3xl mx-auto">
						We&apos;ve reimagined web development education from the ground up
					</p>
				</motion.div>

				<div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 max-w-6xl mx-auto">
					{features.map((feature, index) => (
						<FeatureCard
							key={feature.id}
							feature={feature}
							index={index}
							scrollProgress={scrollYProgress}
						/>
					))}
				</div>
			</div>
		</section>
	);
}

function FeatureCard({
	feature,
	index,
	scrollProgress,
}: {
	feature: (typeof features)[0];
	index: number;
	scrollProgress: MotionValue<number>;
}) {
	const [isHovered, setIsHovered] = useState(false);
	const [isDemoActive, setIsDemoActive] = useState(false);
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const cardRef = useRef<HTMLDivElement>(null);
	const IconComponent = feature.icon;

	// Parallax effect
	const y = useTransform(
		scrollProgress,
		[0, 1],
		[index % 2 === 0 ? 50 : -50, index % 2 === 0 ? -50 : 50]
	);

	// Mouse tracking for 3D tilt effect
	const handleMouseMove = (e: React.MouseEvent) => {
		if (!cardRef.current) return;

		const rect = cardRef.current.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;

		const mouseX = e.clientX - centerX;
		const mouseY = e.clientY - centerY;

		setMousePosition({ x: mouseX, y: mouseY });
	};

	const triggerDemo = () => {
		setIsDemoActive(true);
		setTimeout(() => setIsDemoActive(false), 3000);
	};

	// Calculate 3D transforms
	const rotateX = mousePosition.y / 10;
	const rotateY = -mousePosition.x / 10;

	return (
		<motion.div
			ref={cardRef}
			style={{ y }}
			initial={{ opacity: 0, y: 30 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.6, delay: index * 0.1 }}
			onMouseMove={handleMouseMove}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => {
				setIsHovered(false);
				setMousePosition({ x: 0, y: 0 });
			}}
			onClick={triggerDemo}
			className="perspective-1000"
		>
			<Card
				className="h-full min-h-[420px] bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700 cursor-pointer overflow-hidden group relative"
				style={{
					transform: isHovered
						? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`
						: 'rotateX(0deg) rotateY(0deg) scale(1)',
					transition: 'transform 0.1s ease-out',
					transformStyle: 'preserve-3d',
				}}
			>
				{/* Animated background gradient */}
				<motion.div
					className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
					animate={
						isHovered
							? {
									background: [
										`linear-gradient(45deg, rgba(72, 61, 139, 0.2), rgba(0, 191, 255, 0.15))`, // deep indigo + cyan glow
										`linear-gradient(135deg, rgba(123, 104, 238, 0.25), rgba(0, 255, 204, 0.1))`, // electric violet + aurora teal
										`linear-gradient(225deg, rgba(255, 255, 255, 0.08), rgba(30, 144, 255, 0.2))`, // faint starlight silver + sapphire
										`linear-gradient(315deg, rgba(186, 85, 211, 0.25), rgba(0, 206, 209, 0.15))`, // orchid glow + deep turquoise
									],
							  }
							: {}
					}
					transition={{ duration: 4, repeat: Infinity }}
				/>

				{/* Glowing border effect */}
				<motion.div
					className="absolute inset-0 border border-transparent rounded-lg"
					animate={
						isHovered
							? {
									borderColor: ['rgba(0,255,159,0.3)', 'rgba(57,230,255,0.3)', 'rgba(0,255,159,0.3)'],
							  }
							: {}
					}
					transition={{ duration: 2, repeat: Infinity }}
				/>

				{/* Sparkle effects */}
				<AnimatePresence>
					{isDemoActive && (
						<>
							{[...Array(6)].map((_, i) => (
								<motion.div
									key={i}
									className="absolute w-1 h-1 bg-[#00ff9f] rounded-full"
									initial={{
										opacity: 0,
										scale: 0,
										x: Math.random() * 300,
										y: Math.random() * 200,
									}}
									animate={{
										opacity: [0, 1, 0],
										scale: [0, 1, 0],
										x: Math.random() * 300,
										y: Math.random() * 200,
									}}
									exit={{ opacity: 0, scale: 0 }}
									transition={{
										duration: 1.5,
										delay: i * 0.2,
										repeat: 2,
									}}
								/>
							))}
						</>
					)}
				</AnimatePresence>

				<CardContent className="p-6 md:p-8 h-full flex flex-col relative z-10">
					<div className="flex items-start gap-4 mb-6">
						<motion.div
							className="flex-shrink-0"
							animate={
								isHovered
									? {
											scale: 1.1,
											rotate: [0, 5, -5, 0],
											y: [-2, 2, -2, 0],
									  }
									: { scale: 1, rotate: 0 }
							}
							transition={{ duration: 0.6, repeat: isHovered ? Infinity : 0, repeatDelay: 1 }}
						>
							<div className="w-12 h-12 bg-gradient-to-br from-[#00ff9f]/20 to-[#39e6ff]/20 rounded-lg flex items-center justify-center relative overflow-hidden">
								{/* Icon glow effect */}
								<motion.div
									className="absolute inset-0 bg-[#00ff9f]/10 rounded-lg"
									animate={
										isDemoActive
											? {
													scale: [1, 1.5, 1],
													opacity: [0.1, 0.3, 0.1],
											  }
											: {}
									}
									transition={{ duration: 1, repeat: 3 }}
								/>
								<IconComponent className="w-6 h-6 text-[#00ff9f] relative z-10" />
							</div>
						</motion.div>

						<div className="flex-1">
							<motion.h3
								className="text-xl text-white mb-2"
								animate={
									isDemoActive
										? {
												color: ['#ffffff', '#00ff9f', '#39e6ff', '#ffffff'],
										  }
										: {}
								}
								transition={{ duration: 1.5 }}
							>
								{feature.title}
							</motion.h3>
							<p className="text-[#00ff9f] font-medium mb-3">{feature.promise}</p>
							<p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
						</div>
					</div>

					{/* Interactive Demo Area */}
					<div className="flex-1 flex items-center justify-center relative min-h-32">
						<DemoComponent type={feature.demo} isActive={isDemoActive} isHovered={isHovered} />
					</div>

					{/* Interactive status indicator */}
					<motion.div
						className="mt-4 text-center text-xs relative"
						animate={{ opacity: isHovered ? 1 : 0.6 }}
						transition={{ duration: 0.3 }}
					>
						<motion.span
							className="text-gray-400"
							animate={
								isDemoActive
									? {
											color: ['rgba(156, 163, 175, 1)', 'rgba(0, 255, 159, 1)', 'rgba(156, 163, 175, 1)'],
									  }
									: {}
							}
							transition={{ duration: 1 }}
						>
							{isDemoActive ? 'Demo Active!' : isHovered ? 'Click to see demo' : 'Hover to explore'}
						</motion.span>

						{/* Pulsing dot indicator */}
						<motion.div
							className="absolute -right-6 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full"
							animate={
								isDemoActive
									? {
											backgroundColor: ['#00ff9f', '#39e6ff', '#00ff9f'],
											scale: [1, 1.5, 1],
									  }
									: isHovered
									? {
											backgroundColor: '#00ff9f',
											scale: 1.2,
									  }
									: {
											backgroundColor: '#6b7280',
											scale: 1,
									  }
							}
							transition={{ duration: 0.5, repeat: isDemoActive ? Infinity : 0 }}
						/>
					</motion.div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

function DemoComponent({
	type,
	isActive,
}: {
	type: string;
	isActive: boolean;
	isHovered: boolean;
}) {
	const [progress, setProgress] = useState(0);
	const [typedText, setTypedText] = useState('');
	const [achievements, setAchievements] = useState<string[]>([]);
	const [knowledgeNodes, setKnowledgeNodes] = useState<Array<{ id: number; connected: boolean }>>(
		[]
	);

	// Initialize knowledge nodes
	useEffect(() => {
		setKnowledgeNodes([
			{ id: 1, connected: false },
			{ id: 2, connected: false },
			{ id: 3, connected: false },
			{ id: 4, connected: false },
		]);
	}, []);

	// Mastery validation demo
	useEffect(() => {
		if (type === 'mastery-validation' && isActive) {
			let currentProgress = 0;
			const timer = setInterval(() => {
				currentProgress += 15;
				setProgress(currentProgress);
				if (currentProgress >= 100) {
					clearInterval(timer);
					setTimeout(() => setProgress(0), 1000);
				}
			}, 200);
			return () => clearInterval(timer);
		}
	}, [isActive, type, knowledgeNodes.length]);

	// Live coding demo (fixed to finish properly)
	useEffect(() => {
		if (type === 'live-coding' && isActive) {
			const code = `function learn() {\n  const skill = practice();\n  return skill.master();\n}`;
			let i = 0;
			const timer = setInterval(() => {
				if (i < code.length) {
					setTypedText(code.slice(0, i + 1));
					i++;
				} else {
					clearInterval(timer);
					setTimeout(() => setTypedText(''), 2000); // longer delay before reset
				}
			}, 20);
			return () => clearInterval(timer);
		}
	}, [isActive, type, knowledgeNodes.length]);

	// Achievement unlock demo (fixed guard)
	useEffect(() => {
		if (type === 'achievement-unlock' && isActive) {
			const achievementList = [
				'🚀 First Code',
				'⚡ 10 Lessons',
				'🏆 Module Complete',
				'🔥 Streak Master',
			];
			let current = 0;
			const timer = setInterval(() => {
				if (current < achievementList.length) {
					setAchievements((prev) => [...prev, achievementList[current]]);
					current++;
				} else {
					clearInterval(timer);
					setTimeout(() => setAchievements([]), 1000);
				}
			}, 600);
			return () => clearInterval(timer);
		}
	}, [isActive, type]);

	// Knowledge synthesis demo
	useEffect(() => {
		if (type === 'knowledge-synthesis' && isActive) {
			let current = 0;
			const timer = setInterval(() => {
				if (current < knowledgeNodes.length) {
					setKnowledgeNodes((prev) =>
						prev.map((node, index) => (index === current ? { ...node, connected: true } : node))
					);
					current++;
				} else {
					clearInterval(timer);
					setTimeout(() => {
						setKnowledgeNodes((prev) => prev.map((node) => ({ ...node, connected: false })));
					}, 1000);
				}
			}, 500);
			return () => clearInterval(timer);
		}
	}, [isActive, type, knowledgeNodes.length]);

	const { text, cursor, start, skip } = useTypewriter({
		baseSpeed: 36,
		jitter: 18,
		pauseOnComplete: 1200,
	});

	useEffect(() => {
		if (isActive) {
			start(`function learn() {\n  const skill = practice();\n  return skill.master();\n}`);
		} else {
			skip(); // instantly finish if demo deactivates
		}
	}, [isActive, start, skip]);

	switch (type) {
		case 'mastery-validation':
			return (
				<div className="relative">
					<motion.div className="w-20 h-20 relative">
						<svg className="w-full h-full transform -rotate-90">
							<circle
								cx="40"
								cy="40"
								r="32"
								stroke="rgba(255,255,255,0.1)"
								strokeWidth="4"
								fill="transparent"
							/>
							<motion.circle
								cx="40"
								cy="40"
								r="32"
								stroke="url(#masteryGradient)"
								strokeWidth="4"
								fill="transparent"
								strokeDasharray={`${2 * Math.PI * 32}`}
								initial={{ strokeDashoffset: `${2 * Math.PI * 32}` }}
								animate={{
									strokeDashoffset: `${2 * Math.PI * 32 * (1 - progress / 100)}`,
								}}
								transition={{ duration: 0.5 }}
								strokeLinecap="round"
							/>
							<defs>
								<linearGradient id="masteryGradient">
									<stop offset="0%" stopColor="#00ff9f" />
									<stop offset="100%" stopColor="#39e6ff" />
								</linearGradient>
							</defs>
						</svg>
						<motion.div
							className="absolute inset-0 flex items-center justify-center text-white text-sm"
							animate={progress === 100 ? { scale: [1, 1.2, 1] } : {}}
						>
							{progress}%
						</motion.div>
					</motion.div>

					{progress === 100 && (
						<motion.div
							className="absolute -top-2 -right-2 text-[#00ff9f]"
							initial={{ scale: 0, rotate: -180 }}
							animate={{ scale: 1, rotate: 0 }}
							transition={{ type: 'spring', stiffness: 200 }}
						>
							<Award className="w-6 h-6" />
						</motion.div>
					)}
				</div>
			);

		// live-coding demo using useTypewriter
		case 'live-coding': {
			return (
				<div className="bg-gray-900/80 rounded-lg p-4 font-mono text-xs w-full max-w-64 border border-[#00ff9f]/20">
					<motion.div
						className="text-[#00ff9f] min-h-16 relative"
						style={{ fontSize: '10px', lineHeight: '1.4' }}
					>
						<pre className="whitespace-pre-wrap">{text}</pre>
						<span className="typewriter-cursor text-[#39e6ff] ml-1" aria-hidden="true">
							{cursor}
						</span>
					</motion.div>

					{text.includes('master()') && (
						<motion.div
							className="absolute -top-2 right-2 flex items-center gap-1 bg-[#00ff9f] text-black px-2 py-1 rounded text-xs"
							initial={{ y: -10, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
						>
							<Sparkles className="w-3 h-3" />
							<span>Compiled!</span>
						</motion.div>
					)}
				</div>
			);
		}

		case 'achievement-unlock':
			return (
				<div className="space-y-2 w-full">
					<AnimatePresence>
						{achievements.map((achievement, index) => {
							if (!achievement) return null; // ✅ guard fix
							return (
								<motion.div
									key={index}
									className="flex items-center gap-2 bg-gradient-to-r from-[#00ff9f]/10 to-[#39e6ff]/10 border border-[#00ff9f]/30 rounded-lg px-3 py-2 relative"
									initial={{ x: 100, opacity: 0, scale: 0.8 }}
									animate={{ x: 0, opacity: 1, scale: 1 }}
									exit={{ x: -100, opacity: 0, scale: 0.8 }}
									transition={{
										type: 'spring',
										stiffness: 200,
										delay: index * 0.1,
									}}
								>
									<motion.span
										className="text-lg"
										animate={{ rotate: [0, 15, -15, 0] }}
										transition={{ duration: 0.5, delay: 0.2 }}
									>
										{achievement.split(' ')[0]}
									</motion.span>
									<span className="text-white text-sm">{achievement.split(' ').slice(1).join(' ')}</span>

									{/* Sparkle effect */}
									<motion.div
										className="absolute -top-1 -right-1 w-2 h-2 bg-[#00ff9f] rounded-full"
										animate={{
											scale: [0, 1, 0],
											opacity: [0, 1, 0],
										}}
										transition={{ duration: 1, delay: 0.3 }}
									/>
								</motion.div>
							);
						})}
					</AnimatePresence>
				</div>
			);

		case 'knowledge-synthesis':
			return (
				<div className="relative w-32 h-20">
					<svg width="128" height="80" className="absolute inset-0">
						{/* Connection lines */}
						{knowledgeNodes.map((node, index) => {
							if (index === knowledgeNodes.length - 1) return null;
							const x1 = 20 + index * 30;
							const y1 = 40;
							const x2 = 20 + (index + 1) * 30;
							const y2 = 40;

							return (
								<motion.line
									key={`line-${index}`}
									x1={x1}
									y1={y1}
									x2={x2}
									y2={y2}
									stroke="#00ff9f"
									strokeWidth="2"
									initial={{ pathLength: 0 }}
									animate={{
										pathLength: node.connected && knowledgeNodes[index + 1]?.connected ? 1 : 0,
										opacity: node.connected && knowledgeNodes[index + 1]?.connected ? 1 : 0.3,
									}}
									transition={{ duration: 0.5 }}
								/>
							);
						})}

						{/* Knowledge nodes */}
						{knowledgeNodes.map((node, index) => (
							<motion.circle
								key={`node-${index}`}
								cx={20 + index * 30}
								cy={40}
								r="6"
								fill={node.connected ? '#00ff9f' : '#374151'}
								stroke={node.connected ? '#39e6ff' : '#6b7280'}
								strokeWidth="2"
								animate={{
									scale: node.connected ? [1, 1.3, 1] : 1,
									fill: node.connected ? ['#00ff9f', '#39e6ff', '#00ff9f'] : '#374151',
								}}
								transition={{ duration: 0.5 }}
							/>
						))}
					</svg>

					{/* Synthesis completion effect */}
					{knowledgeNodes.every((node) => node.connected) && (
						<motion.div
							className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#00ff9f]"
							initial={{ scale: 0, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ delay: 0.5 }}
						>
							<Layers className="w-6 h-6" />
						</motion.div>
					)}
				</div>
			);

		default:
			return null;
	}
}
