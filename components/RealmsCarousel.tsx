// components/RealmsCarousel.tsx

'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, Users, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';

/* -------------------------
   Data
   ------------------------- */
const realms = [
	{
		id: 1,
		title: 'Frontend Mastery',
		description: 'Master React, Next.js, and modern CSS techniques',
		duration: '12 weeks',
		students: '2,847',
		difficulty: 'Intermediate',
		progress: 65,
		image:
			'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
		accent: '#00ff9f',
	},
	{
		id: 2,
		title: 'Backend Engineering',
		description: 'Build scalable APIs with Node.js, Python, and databases',
		duration: '16 weeks',
		students: '1,924',
		difficulty: 'Advanced',
		progress: 30,
		image:
			'https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
		accent: '#39e6ff',
	},
	{
		id: 3,
		title: 'Full-Stack Projects',
		description: 'End-to-end application development and deployment',
		duration: '20 weeks',
		students: '3,156',
		difficulty: 'Expert',
		progress: 85,
		image:
			'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
		accent: '#ff6b9d',
	},
	{
		id: 4,
		title: 'DevOps & Cloud',
		description: 'Master deployment, CI/CD, and cloud infrastructure',
		duration: '14 weeks',
		students: '1,543',
		difficulty: 'Advanced',
		progress: 45,
		image:
			'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
		accent: '#ff8c42',
	},
	{
		id: 5,
		title: 'UI/UX Design',
		description: 'Design thinking, prototyping, and user experience',
		duration: '10 weeks',
		students: '2,234',
		difficulty: 'Beginner',
		progress: 90,
		image:
			'https://images.unsplash.com/photo-1558655146-9f40138edfeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
		accent: '#a855f7',
	},
];

/* -------------------------
   Helpers
   ------------------------- */
function mod(n: number, m: number) {
	return ((n % m) + m) % m;
}

/* -------------------------
   RealmCard
   ------------------------- */
function RealmCard({
	realm,
	isGloballyHovered,
	onHover,
	onLeave,
	cardWidth,
}: {
	realm: (typeof realms)[0];
	isGloballyHovered: boolean;
	onHover: () => void;
	onLeave: () => void;
	cardWidth: number;
}) {
	const [isHovered, setIsHovered] = useState(false);
	const dimmed = isGloballyHovered && !isHovered;

	return (
		<motion.div
			className="flex-shrink-0"
			style={{ width: cardWidth }}
			animate={{
				opacity: dimmed ? 0.5 : 1,
				filter: dimmed ? 'blur(2px) brightness(0.8)' : 'none',
				scale: isHovered ? 1.05 : 1,
				zIndex: isHovered ? 10 : 1,
			}}
			transition={{ duration: 0.35 }}
			onHoverStart={() => {
				setIsHovered(true);
				onHover();
			}}
			onHoverEnd={() => {
				setIsHovered(false);
				onLeave();
			}}
			onClick={() => {
				setIsHovered(true);
				onHover();
			}}
		>
			<Card className="h-full bg-gradient-to-br from-gray-900/80 to-gray-800/40 border-gray-700 overflow-hidden relative rounded-xl">
				<CardContent className="p-0 relative z-10">
					<div className="relative h-48 overflow-hidden rounded-t-xl">
						<motion.img
							src={realm.image}
							alt={realm.title}
							className="w-full h-full object-cover"
							animate={isHovered ? { scale: 1.04 } : { scale: 1 }}
							transition={{ duration: 0.4 }}
						/>
						<div className="absolute top-4 left-4">
							<Badge variant="secondary" className="bg-black/60 text-white border-0 backdrop-blur-sm">
								{realm.difficulty}
							</Badge>
						</div>
					</div>
					<div className="p-6">
						<motion.h3
							className="text-xl text-white mb-3"
							animate={isHovered ? { color: realm.accent } : { color: '#ffffff' }}
							transition={{ duration: 0.4 }}
						>
							{realm.title}
						</motion.h3>
						<p className="text-gray-300 text-sm mb-4 leading-relaxed">{realm.description}</p>
						<div className="flex items-center justify-between text-xs text-gray-400 mb-4">
							<div className="flex items-center gap-1">
								<Clock className="w-3 h-3" />
								<span>{realm.duration}</span>
							</div>
							<div className="flex items-center gap-1">
								<Users className="w-3 h-3" />
								<span>{realm.students}</span>
							</div>
							<div className="flex items-center gap-1">
								<Trophy className="w-3 h-3" />
								<span>Certificate</span>
							</div>
						</div>
						<button className="cursor-pointer w-full py-2 px-4 rounded-lg bg-gradient-to-r from-gray-700 to-gray-600 text-white text-sm transition-all duration-200">
							View Details
						</button>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

/* -------------------------
   RealmsCarousel
   ------------------------- */
export function RealmsCarousel() {
	const [currentPage, setCurrentPage] = useState(0);
	const [cardsPerPage, setCardsPerPage] = useState(3);
	const [hoveredCard, setHoveredCard] = useState<number | null>(null);
	const [isAnimating, setIsAnimating] = useState(false);

	const containerRef = useRef<HTMLDivElement | null>(null);

	// Duplicate realms to create an infinite effect
	const duplicatedRealms = useMemo(() => {
		const copies = 3; // enough for smooth looping
		const arr: typeof realms = [];
		for (let i = 0; i < copies; i++) arr.push(...realms);
		return arr;
	}, []);

	useEffect(() => {
		function measure() {
			const containerWidth = containerRef.current?.offsetWidth ?? 0;
			if (containerWidth <= 480) setCardsPerPage(1);
			else if (containerWidth <= 900) setCardsPerPage(2);
			else setCardsPerPage(3);
		}
		measure();
		window.addEventListener('resize', measure);
		return () => window.removeEventListener('resize', measure);
	}, []);

	const totalPages = Math.ceil(duplicatedRealms.length / cardsPerPage);

	const navigateToPage = useCallback(
		(page: number) => {
			if (isAnimating) return;
			setIsAnimating(true);
			setCurrentPage(mod(page, totalPages));
			setTimeout(() => setIsAnimating(false), 700);
		},
		[isAnimating, totalPages]
	);

	const getTargetX = (page: number) => {
		const containerWidth = containerRef.current?.offsetWidth ?? 0;
		return -page * containerWidth;
	};

	const handleDragEnd = useCallback(
		(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
			if (info.offset.x < -50) navigateToPage(currentPage + 1);
			else if (info.offset.x > 50) navigateToPage(currentPage - 1);
		},
		[navigateToPage, currentPage]
	);

	return (
		<section className="py-20 relative overflow">
			<div className="container mx-auto px-4">
				<motion.div
					className="text-center mb-12"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
				>
					<h2 className="text-3xl md:text-5xl text-white mb-4">Learning Realms</h2>
					<p className="text-gray-300 text-lg max-w-3xl mx-auto">
						Explore specialized learning paths designed to take you from beginner to expert
					</p>
				</motion.div>

				<div className="relative overflow-hidden p-3 pr-0" ref={containerRef}>
					<motion.div
						className="flex gap-6"
						drag="x"
						dragConstraints={{ left: 0, right: 0 }}
						dragElastic={0.1}
						onDragEnd={handleDragEnd}
						animate={{ x: getTargetX(currentPage) }}
						transition={{ type: 'tween', duration: 0.7, ease: 'easeInOut' }}
					>
						{duplicatedRealms.map((realm, i) => (
							<RealmCard
								key={`${realm.id}-${i}`}
								realm={realm}
								isGloballyHovered={hoveredCard !== null && hoveredCard === realm.id}
								onHover={() => setHoveredCard(realm.id)}
								onLeave={() => setHoveredCard((prev) => (prev === realm.id ? null : prev))}
								cardWidth={Math.floor((containerRef.current?.offsetWidth ?? 900) / cardsPerPage) - 24}
							/>
						))}
					</motion.div>

					{/* Arrows */}
					<button
						onClick={() => navigateToPage(currentPage - 1)}
						className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
						aria-label="Previous"
					>
						<ChevronLeft className="w-5 h-5" />
					</button>
					<button
						onClick={() => navigateToPage(currentPage + 1)}
						className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
						aria-label="Next"
					>
						<ChevronRight className="w-5 h-5" />
					</button>
				</div>
			</div>
		</section>
	);
}
