'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, Users, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';

/* -------------------------
   Data (unchanged visuals)
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
		gradient: 'from-emerald-500/20 to-teal-500/20',
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
		gradient: 'from-blue-500/20 to-indigo-500/20',
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
		gradient: 'from-purple-500/20 to-pink-500/20',
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
		gradient: 'from-orange-500/20 to-red-500/20',
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
		gradient: 'from-violet-500/20 to-purple-500/20',
		accent: '#a855f7',
	},
];

/* -------------------------
   Small helper: Circular progress
   (unchanged visual)
   ------------------------- */
function CircularProgress({
	progress,
	size = 60,
	strokeWidth = 4,
	color = '#00ff9f',
}: {
	progress: number;
	size?: number;
	strokeWidth?: number;
	color?: string;
}) {
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const strokeDasharray = `${circumference} ${circumference}`;
	const strokeDashoffset = circumference - (progress / 100) * circumference;

	return (
		<div className="relative" style={{ width: size, height: size }}>
			<svg className="transform -rotate-90" width={size} height={size}>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke="rgba(255,255,255,0.08)"
					strokeWidth={strokeWidth}
					fill="transparent"
				/>
				<motion.circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke={color}
					strokeWidth={strokeWidth}
					fill="transparent"
					strokeDasharray={strokeDasharray}
					initial={{ strokeDashoffset: circumference }}
					animate={{ strokeDashoffset }}
					transition={{ duration: 1.2, ease: 'easeInOut' }}
					strokeLinecap="round"
				/>
			</svg>
			<div className="absolute inset-0 flex items-center justify-center text-white text-sm">
				{progress}%
			</div>
		</div>
	);
}

/* -------------------------
   RealmCard
   - Uses local hover for subtle per-card visuals.
   - Exposes keyboard focus and accepts global hover marker.
   ------------------------- */
function RealmCard({
	realm,
	isActive,
	isGloballyHovered,
	onHover,
	onLeave,
	cardWidth,
}: {
	realm: (typeof realms)[0];
	index: number;
	isActive: boolean;
	isGloballyHovered: boolean;
	onHover: () => void;
	onLeave: () => void;
	cardWidth: number;
}) {
	const [isHovered, setIsHovered] = useState(false);

	// reduced particle count & recycled via CSS keyframes for performance
	const floatingParticles = useMemo(() => new Array(4).fill(0), []);

	// CSS classes when another card is hovered: dim non-focused cards slightly
	const dimmed = isGloballyHovered && !isHovered;

	return (
		<motion.div
			role="option"
			aria-selected={isActive}
			tabIndex={0}
			className="flex-shrink-0"
			style={{ width: cardWidth }}
			initial={{ opacity: 0, y: 16 }}
			animate={{
				opacity: isActive ? 1 : dimmed ? 0.65 : 0.9,
				scale: isActive ? 1.03 : 1,
				transition: { type: 'spring', stiffness: 300, damping: 28 },
			}}
			onHoverStart={() => {
				setIsHovered(true);
				onHover();
			}}
			onHoverEnd={() => {
				setIsHovered(false);
				onLeave();
			}}
			onFocus={() => {
				setIsHovered(true);
				onHover();
			}}
			onBlur={() => {
				setIsHovered(false);
				onLeave();
			}}
		>
			<Card className="h-full bg-gradient-to-br from-gray-900/80 to-gray-800/40 border-gray-700 overflow-hidden group cursor-pointer relative rounded-xl">
				{/* Controlled, subtle gradient animation (slow) */}
				<motion.div
					className={`absolute inset-0 opacity-0 group-hover:opacity-80 pointer-events-none rounded-xl`}
					style={{
						background: `linear-gradient(135deg, ${realm.accent}10 0%, transparent 40%), linear-gradient(225deg, ${realm.accent}05 0%, transparent 60%)`,
						mixBlendMode: 'overlay',
						transition: 'opacity 400ms ease',
					}}
					animate={isHovered ? { opacity: 0.8 } : { opacity: 0 }}
				/>

				{/* soft glowing outline (only on hover) */}
				<motion.div
					className="absolute inset-0 rounded-xl pointer-events-none"
					animate={
						isHovered
							? {
									boxShadow: [`0 4px 20px ${realm.accent}20`, `0 10px 40px ${realm.accent}30`],
							  }
							: {}
					}
					transition={{ duration: 0.6 }}
				/>

				<CardContent className="p-0 relative z-10">
					<div className="relative h-48 overflow-hidden rounded-t-xl">
						<motion.img
							src={realm.image}
							alt={realm.title}
							className="w-full h-full object-cover"
							animate={isHovered ? { scale: 1.04 } : { scale: 1 }}
							transition={{ duration: 0.45 }}
						/>

						{/* Overlay — subtle */}
						<motion.div
							className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"
							animate={isHovered ? { opacity: 0.5 } : { opacity: 0.75 }}
							transition={{ duration: 0.35 }}
						/>

						<div className="absolute top-4 left-4">
							<Badge variant="secondary" className="bg-black/60 text-white border-0 backdrop-blur-sm">
								{realm.difficulty}
							</Badge>
						</div>

						<div className="absolute top-4 right-4">
							<CircularProgress progress={realm.progress} size={48} color={realm.accent} />
						</div>

						{/* lightweight floating particles (CSS-keyframed positions for reuse) */}
						<div aria-hidden className="absolute inset-0 pointer-events-none">
							{floatingParticles.map((_, i) => (
								<motion.span
									key={i}
									className="absolute rounded-full"
									style={{
										width: 6,
										height: 6,
										backgroundColor: realm.accent,
										opacity: isHovered ? 0.9 : 0.25,
										left: `${10 + i * 18}%`,
										top: `${20 + (i % 2) * 12}%`,
										filter: 'blur(4px)',
									}}
									animate={
										isHovered
											? {
													y: [0, -10, 0],
													opacity: [0.2, 0.9, 0.2],
											  }
											: { y: 0, opacity: 0.25 }
									}
									transition={{ duration: 2 + i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
								/>
							))}
						</div>
					</div>

					<div className="p-6">
						<motion.h3
							className="text-xl text-white mb-3"
							animate={isHovered ? { color: realm.accent } : { color: '#ffffff' }}
							transition={{ duration: 0.5 }}
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

						<motion.button
							className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-gray-700 to-gray-600 text-white text-sm transition-all duration-200 relative overflow-hidden group"
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							animate={
								isHovered
									? { background: `linear-gradient(90deg, ${realm.accent}30, ${realm.accent}50)` }
									: {}
							}
						>
							<motion.div
								className="absolute inset-0 bg-white/8"
								initial={{ x: '-100%' }}
								animate={isHovered ? { x: '100%' } : { x: '-100%' }}
								transition={{ duration: 0.45 }}
							/>
							<span className="relative z-10">{isHovered ? 'Click to Explore' : 'View Details'}</span>
						</motion.button>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

/* -------------------------
   RealmsCarousel (refactored)
   ------------------------- */
export function RealmsCarousel() {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [hoveredCard, setHoveredCard] = useState<number | null>(null);
	const [isAutoScrolling, setIsAutoScrolling] = useState(true);
	const [isManuallyInteracting, setIsManuallyInteracting] = useState(false);

	const containerRef = useRef<HTMLDivElement | null>(null);
	const innerRef = useRef<HTMLDivElement | null>(null);

	const manualInteractionTimeoutRef = useRef<number | null>(null);

	// Responsive card width: use container width to compute card size
	const [cardWidth, setCardWidth] = useState(320); // fallback

	useEffect(() => {
		function measure() {
			const containerWidth = containerRef.current?.offsetWidth ?? 0;
			// choose card width: on desktop show ~3 cards with gaps; on mobile full width
			if (containerWidth <= 480) {
				setCardWidth(containerWidth - 32); // padded
			} else if (containerWidth <= 900) {
				setCardWidth(Math.min(360, Math.floor(containerWidth * 0.8)));
			} else {
				// desktop: aim for ~3 cards visible
				const target = Math.floor((containerWidth - 96) / 3);
				setCardWidth(Math.max(300, Math.min(420, target)));
			}
		}

		measure();
		window.addEventListener('resize', measure);
		return () => window.removeEventListener('resize', measure);
	}, []);

	const totalWidth = useMemo(() => realms.length * (cardWidth + 24), [cardWidth]);

	// Auto-scroll with sane defaults (6s)
	useEffect(() => {
		if (!isAutoScrolling || isManuallyInteracting) return;
		const id = window.setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % realms.length);
		}, 6000);
		return () => clearInterval(id);
	}, [isAutoScrolling, isManuallyInteracting]);

	// Pause auto-scroll on manual interaction and resume after idle
	const pauseAutoScroll = useCallback(() => {
		setIsAutoScrolling(false);
		setIsManuallyInteracting(true);
		if (manualInteractionTimeoutRef.current) {
			window.clearTimeout(manualInteractionTimeoutRef.current);
		}
		manualInteractionTimeoutRef.current = window.setTimeout(() => {
			setIsManuallyInteracting(false);
			setIsAutoScrolling(true);
		}, 4000);
	}, []);

	// Compute target translate X for currentIndex (center the active card)
	const getTargetX = (index: number) => {
		// center active card in container
		const containerWidth = containerRef.current?.offsetWidth ?? 0;
		const itemWidth = cardWidth + 24; // including gap
		const centerOffset = (containerWidth - itemWidth) / 2;
		const x = -index * itemWidth + centerOffset;
		// clamp so we don't overscroll beyond content
		const maxLeft = 0;
		const maxRight = Math.min(0, containerWidth - totalWidth);
		return Math.max(Math.min(x, maxLeft), maxRight);
	};

	// Wheel handler: only respond to horizontal intent or Shift+Wheel
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		const onWheel = (e: WheelEvent) => {
			const absX = Math.abs(e.deltaX);
			const absY = Math.abs(e.deltaY);
			const horizontalIntent = absX > absY || e.shiftKey;

			if (!horizontalIntent) return; // let page scroll normally

			// prevent vertical scroll when we handle horizontal carousel
			e.preventDefault();
			pauseAutoScroll();

			if (e.deltaY > 0 || e.deltaX > 0) {
				setCurrentIndex((prev) => Math.min(realms.length - 1, prev + 1));
			} else {
				setCurrentIndex((prev) => Math.max(0, prev - 1));
			}
		};

		el.addEventListener('wheel', onWheel, { passive: false });
		return () => el.removeEventListener('wheel', onWheel);
	}, [pauseAutoScroll, totalWidth, cardWidth]);

	// Keyboard navigation (left / right)
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft') {
				pauseAutoScroll();
				setCurrentIndex((prev) => Math.max(0, prev - 1));
			} else if (e.key === 'ArrowRight') {
				pauseAutoScroll();
				setCurrentIndex((prev) => Math.min(realms.length - 1, prev + 1));
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [pauseAutoScroll]);

	// Drag end snapping (momentum-aware)
	const handleDragEnd = useCallback(
		(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
			pauseAutoScroll();

			// convert velocity (px/s) and offset to decide direction
			const velocity = info.velocity.x;
			const offset = info.offset.x;

			const itemSize = cardWidth + 24;
			// if a fast fling, use velocity; else use offset proportion
			if (Math.abs(velocity) > 400) {
				if (velocity > 0) {
					setCurrentIndex((prev) => Math.max(0, prev - 1));
				} else {
					setCurrentIndex((prev) => Math.min(realms.length - 1, prev + 1));
				}
				return;
			}

			if (Math.abs(offset) > itemSize * 0.3) {
				// big drag -> change index accordingly
				if (offset > 0) {
					setCurrentIndex((prev) => Math.max(0, prev - 1));
				} else {
					setCurrentIndex((prev) => Math.min(realms.length - 1, prev + 1));
				}
			} else {
				// small drag -> snap back to current
				setCurrentIndex((prev) => prev);
			}
		},
		[cardWidth, pauseAutoScroll]
	);

	// navigation helper
	const navigateToCard = useCallback(
		(index: number) => {
			pauseAutoScroll();
			setCurrentIndex(() => Math.max(0, Math.min(index, realms.length - 1)));
		},
		[pauseAutoScroll]
	);

	// Accessibility: announce active via aria (left to browser)

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
					<p className="text-gray-300 text-lg max-w-3xl mx-auto">
						Explore specialized learning paths designed to take you from beginner to expert
					</p>
				</motion.div>

				{/* DESKTOP - center 3 cards view */}
				<div
					className="hidden md:block relative overflow-visible"
					ref={containerRef}
					aria-roledescription="carousel"
				>
					<motion.div
						ref={innerRef}
						className="flex items-center gap-6 cursor-grab"
						drag="x"
						dragConstraints={{
							left: Math.min(0, (containerRef.current?.offsetWidth ?? 0) - totalWidth),
							right: 0,
						}}
						dragElastic={0.12}
						onDragStart={() => {
							pauseAutoScroll();
						}}
						onDragEnd={handleDragEnd}
						animate={{
							x: getTargetX(currentIndex),
						}}
						transition={{ type: 'spring', stiffness: 260, damping: 40 }}
						style={{ willChange: 'transform' }}
						role="list"
					>
						{/* show surrounding 3 cards visually but render all for accessibility */}
						{realms.map((realm, index) => (
							<div key={realm.id} role="listitem" aria-hidden={index !== currentIndex}>
								<RealmCard
									realm={realm}
									index={index}
									isActive={index === currentIndex}
									isGloballyHovered={hoveredCard !== null ? hoveredCard === realm.id : false}
									onHover={() => setHoveredCard(realm.id)}
									onLeave={() => setHoveredCard((prev) => (prev === realm.id ? null : prev))}
									cardWidth={cardWidth}
								/>
							</div>
						))}
					</motion.div>

					{/* Dots */}
					<div className="flex justify-center gap-2 mt-6">
						{realms.map((_, index) => (
							<button
								key={index}
								aria-label={`Go to ${index + 1}`}
								onClick={() => navigateToCard(index)}
								className="w-2 h-2 rounded-full transition-all duration-300 focus:outline-none"
								style={{
									background: index === currentIndex ? '#00ff9f' : '#374151',
									transform: index === currentIndex ? 'scale(1.2)' : 'scale(1)',
								}}
							/>
						))}
					</div>
				</div>

				{/* MOBILE - full width swipe */}
				<div className="md:hidden relative" ref={containerRef}>
					<div className="overflow-hidden">
						<motion.div
							className="flex gap-4 px-4 py-2"
							style={{ width: `${realms.length * (cardWidth + 24)}px` }}
							animate={{
								x: getTargetX(currentIndex),
							}}
							transition={{ type: 'spring', stiffness: 300, damping: 30 }}
							drag="x"
							dragConstraints={{
								left: Math.min(0, (containerRef.current?.offsetWidth ?? 0) - totalWidth),
								right: 0,
							}}
							dragElastic={0.12}
							onDragStart={() => pauseAutoScroll()}
							onDragEnd={handleDragEnd}
						>
							{realms.map((realm, index) => (
								<RealmCard
									key={realm.id}
									realm={realm}
									index={index}
									isActive={index === currentIndex}
									isGloballyHovered={hoveredCard !== null ? hoveredCard === realm.id : false}
									onHover={() => setHoveredCard(realm.id)}
									onLeave={() => setHoveredCard((prev) => (prev === realm.id ? null : prev))}
									cardWidth={cardWidth}
								/>
							))}
						</motion.div>
					</div>

					{/* Mobile dots & arrows */}
					<div className="flex justify-center gap-2 mt-4">
						{realms.map((_, index) => (
							<button
								key={index}
								aria-label={`Go to ${index + 1}`}
								onClick={() => navigateToCard(index)}
								className="w-2 h-2 rounded-full transition-all duration-300 focus:outline-none"
								style={{
									background: index === currentIndex ? '#00ff9f' : '#374151',
									transform: index === currentIndex ? 'scale(1.2)' : 'scale(1)',
								}}
							/>
						))}
					</div>

					<button
						onClick={() => navigateToCard(Math.max(0, currentIndex - 1))}
						className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
						aria-label="Previous"
					>
						<ChevronLeft className="w-5 h-5" />
					</button>

					<button
						onClick={() => navigateToCard(Math.min(realms.length - 1, currentIndex + 1))}
						className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
						aria-label="Next"
					>
						<ChevronRight className="w-5 h-5" />
					</button>
				</div>

				{/* Auto-scroll indicator */}
				<div className="flex justify-center items-center gap-2 mt-8 text-gray-400 text-sm">
					<div
						className="w-2 h-2 rounded-full"
						style={{
							background: isManuallyInteracting ? '#39e6ff' : isAutoScrolling ? undefined : '#fbbf24',
							animation: isAutoScrolling && !isManuallyInteracting ? 'pulse 1.6s infinite' : undefined,
						}}
					/>
					<span>
						{isManuallyInteracting
							? 'Manual control active'
							: isAutoScrolling
							? 'Auto-browsing enabled'
							: 'Paused'}
					</span>
					<span className="text-gray-600">•</span>
					<span className="text-xs">
						{isManuallyInteracting ? 'Drag or use arrows' : 'Swipe, drag, or use arrows'}
					</span>
				</div>
			</div>

			<style jsx>{`
				@keyframes pulse {
					0% {
						opacity: 0.5;
						transform: scale(1);
					}
					50% {
						opacity: 1;
						transform: scale(1.3);
					}
					100% {
						opacity: 0.5;
						transform: scale(1);
					}
				}
			`}</style>
		</section>
	);
}
