'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Lock, Code, Palette, Zap, Database } from 'lucide-react';

const realms = [
	{
		id: 1,
		title: 'HTML Foundation',
		icon: Code,
		progress: 85,
		locked: false,
		description: 'Master semantic markup and accessibility',
	},
	{
		id: 2,
		title: 'CSS Mastery',
		icon: Palette,
		progress: 60,
		locked: false,
		description: 'Advanced styling and responsive design',
	},
	{
		id: 3,
		title: 'JavaScript Core',
		icon: Zap,
		progress: 30,
		locked: false,
		description: 'Dynamic interactions and logic',
	},
	{
		id: 4,
		title: 'Backend Basics',
		icon: Database,
		progress: 0,
		locked: true,
		description: 'Server-side development fundamentals',
	},
];

const CircularProgress = ({ progress, size = 80 }: { progress: number; size?: number }) => {
	const radius = (size - 8) / 2;
	const circumference = radius * 2 * Math.PI;
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
					strokeWidth="4"
					fill="transparent"
				/>
				{/* Progress circle */}
				<motion.circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke="url(#progressGradient)"
					strokeWidth="4"
					fill="transparent"
					strokeDasharray={strokeDasharray}
					strokeDashoffset={strokeDashoffset}
					strokeLinecap="round"
					initial={{ strokeDashoffset: circumference }}
					animate={{ strokeDashoffset }}
					transition={{ duration: 1, delay: 0.5 }}
				/>
				<defs>
					<linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#00ff9f" />
						<stop offset="100%" stopColor="#39e6ff" />
					</linearGradient>
				</defs>
			</svg>

			{/* Percentage text */}
			<div className="absolute inset-0 flex items-center justify-center">
				<span className="text-sm text-white">{progress}%</span>
			</div>
		</div>
	);
};

export function RealmsCarousel() {
	const [hoveredRealm, setHoveredRealm] = useState<number | null>(null);
	const scrollRef = useRef<HTMLDivElement>(null);

	return (
		<section className="py-20 relative overflow-hidden">
			<div className="container mx-auto px-4">
				<motion.div
					className="text-center mb-12"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
				>
					<h2 className="text-3xl md:text-5xl text-white mb-4">Learning Realms</h2>
					<p className="text-gray-300 text-lg max-w-2xl mx-auto">
						Progress through interconnected domains of web development mastery
					</p>
				</motion.div>

				{/* Mobile: Horizontal Scroll */}
				<div className="md:hidden">
					<div
						ref={scrollRef}
						className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
						style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
					>
						{realms.map((realm, index) => (
							<motion.div
								key={realm.id}
								className="min-w-[280px] snap-center"
								initial={{ opacity: 0, x: 50 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, delay: index * 0.1 }}
							>
								<RealmCard
									realm={realm}
									isHovered={hoveredRealm === realm.id}
									onHover={() => setHoveredRealm(realm.id)}
									onLeave={() => setHoveredRealm(null)}
								/>
							</motion.div>
						))}
					</div>
				</div>

				{/* Desktop: Grid */}
				<div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
					{realms.map((realm, index) => (
						<motion.div
							key={realm.id}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: index * 0.1 }}
						>
							<RealmCard
								realm={realm}
								isHovered={hoveredRealm === realm.id}
								onHover={() => setHoveredRealm(realm.id)}
								onLeave={() => setHoveredRealm(null)}
							/>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}

function RealmCard({
	realm,
	isHovered,
	onHover,
	onLeave,
}: {
	realm: (typeof realms)[0];
	isHovered: boolean;
	onHover: () => void;
	onLeave: () => void;
}) {
	const IconComponent = realm.icon;

	return (
		<Card
			className={`relative h-64 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700 cursor-pointer transition-all duration-300 overflow-hidden ${
				realm.locked ? 'opacity-60' : ''
			}`}
			onMouseEnter={onHover}
			onMouseLeave={onLeave}
		>
			<motion.div
				className="absolute inset-0"
				animate={
					isHovered && !realm.locked
						? {
								background: [
									'linear-gradient(45deg, rgba(0,255,159,0.1), rgba(57,230,255,0.1))',
									'linear-gradient(45deg, rgba(57,230,255,0.1), rgba(0,255,159,0.1))',
								],
						  }
						: {}
				}
				transition={{ duration: 2, repeat: Infinity }}
			/>

			{realm.locked && (
				<motion.div
					className="absolute inset-0 bg-black/30 flex items-center justify-center z-10"
					animate={isHovered ? { scale: [1, 1.05, 1] } : {}}
					transition={{ duration: 0.5 }}
				>
					<Lock className="w-8 h-8 text-gray-400" />
				</motion.div>
			)}

			<CardContent className="p-6 h-full flex flex-col items-center justify-between relative z-10">
				<div className="text-center">
					<motion.div
						className="mb-4"
						animate={isHovered && !realm.locked ? { rotate: [0, 5, -5, 0] } : {}}
						transition={{ duration: 0.6, repeat: isHovered ? Infinity : 0, repeatDelay: 2 }}
					>
						<IconComponent
							className={`w-8 h-8 mx-auto ${realm.locked ? 'text-gray-500' : 'text-[#00ff9f]'}`}
						/>
					</motion.div>

					<h3 className="text-white text-lg mb-2">{realm.title}</h3>
					<p className="text-gray-400 text-sm">{realm.description}</p>
				</div>

				<div className="flex flex-col items-center gap-2">
					<CircularProgress progress={realm.progress} size={60} />

					{!realm.locked && isHovered && (
						<motion.div
							className="w-12 h-0.5 bg-gradient-to-r from-[#00ff9f] to-[#39e6ff] rounded-full"
							initial={{ width: 0 }}
							animate={{ width: 48 }}
							transition={{ duration: 0.3 }}
						/>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
