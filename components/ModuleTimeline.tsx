'use client';

import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle, Lock, Play, ChevronLeft, ChevronRight, Star, Clock } from 'lucide-react';

/* ----------------------------- Types & Data ----------------------------- */

type Status = 'completed' | 'active' | 'current' | 'locked';

type ModuleItem = {
	id: number;
	title: string;
	lessons: number;
	mastery: number; // 0-100
	status: Status;
	preview: string;
};

const BASE_MODULES: ModuleItem[] = [
	{
		id: 1,
		title: 'HTML Foundations',
		status: 'completed',
		mastery: 95,
		lessons: 12,
		preview: 'Semantic markup and accessibility principles',
	},
	{
		id: 2,
		title: 'CSS Mastery',
		status: 'completed',
		mastery: 88,
		lessons: 18,
		preview: 'Advanced layouts with Grid and Flexbox',
	},
	{
		id: 3,
		title: 'JavaScript Core',
		status: 'active',
		mastery: 67,
		lessons: 24,
		preview: 'ES6+ features and async programming',
	},
	{
		id: 4,
		title: 'React Fundamentals',
		status: 'current',
		mastery: 45,
		lessons: 20,
		preview: 'Components, hooks, and state management',
	},
	{
		id: 5,
		title: 'Advanced React',
		status: 'locked',
		mastery: 0,
		lessons: 16,
		preview: 'Performance optimization and patterns',
	},
	{
		id: 6,
		title: 'Next.js Deep Dive',
		status: 'locked',
		mastery: 0,
		lessons: 22,
		preview: 'SSR, API routes, and deployment',
	},
	{
		id: 7,
		title: 'Backend Integration',
		status: 'locked',
		mastery: 0,
		lessons: 28,
		preview: 'APIs, databases, and auth',
	},
	{
		id: 8,
		title: 'DevOps Essentials',
		status: 'locked',
		mastery: 0,
		lessons: 15,
		preview: 'CI/CD pipelines and cloud deployment',
	},
];

/* ----------------------------- Constants ----------------------------- */

const ITEM_WIDTH = 220;
const AUTO_SPEED_PX_PER_MS = 0.04; // ~40px/sec
const WHEEL_SENSITIVITY = 1.0;
const MANUAL_RESUME_MS = 1200;
const ARROW_SCROLL_PIXELS = ITEM_WIDTH * 1.5;
const EASE_SCROLL_DURATION = 450;

/* ----------------------------- Helpers ----------------------------- */

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mod = (n: number, m: number) => ((n % m) + m) % m;

function getStatusIcon(status: Status) {
	switch (status) {
		case 'completed':
			return CheckCircle;
		case 'current':
			return Play;
		case 'active':
			return Clock;
		default:
			return Lock;
	}
}
function getStatusColor(status: Status) {
	switch (status) {
		case 'completed':
			return '#00ff9f';
		case 'current':
			return '#39e6ff';
		case 'active':
			return '#fbbf24';
		default:
			return '#6b7280';
	}
}

/* ----------------------------- Component ----------------------------- */

function getVisibleDuplicates() {
	if (typeof window === 'undefined') return 6;
	const screenWidth = window.innerWidth;
	return Math.ceil((screenWidth * 2) / (BASE_MODULES.length * ITEM_WIDTH));
}

export function ModuleTimeline(): React.JSX.Element {
	const shouldReduceMotion = useReducedMotion();

	const containerRef = useRef<HTMLDivElement | null>(null);
	const scrollerRef = useRef<HTMLDivElement | null>(null);

	const scrollRef = useRef<number>(0);
	const lastFrameTime = useRef<number | null>(null);
	const rafRef = useRef<number | null>(null);
	const manualTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const [isManuallyScrolling, setIsManuallyScrolling] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
	// start with 1 to avoid SSR mismatch
	const [dupCount, setDupCount] = useState(1);

	useEffect(() => {
		setDupCount(getVisibleDuplicates()); // update after mount
		const handleResize = () => setDupCount(getVisibleDuplicates());
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const modules = useMemo(() => {
		const arr: ModuleItem[] = [];
		for (let i = 0; i < dupCount; i++) {
			for (const m of BASE_MODULES) arr.push({ ...m });
		}
		return arr;
	}, [dupCount]);

	const baseCount = BASE_MODULES.length;
	const totalWidth = useMemo(() => ITEM_WIDTH * modules.length, [modules.length]);

	const applyTransform = useCallback(() => {
		const el = scrollerRef.current;
		if (!el) return;
		el.style.transform = `translate3d(${-scrollRef.current}px, 0, 0)`;
	}, []);

	/* rAF auto-scroll */
	useEffect(() => {
		if (shouldReduceMotion) return;
		let mounted = true;

		function tick(ts: number) {
			if (!mounted) return;
			if (lastFrameTime.current == null) lastFrameTime.current = ts;
			const dt = ts - lastFrameTime.current;
			lastFrameTime.current = ts;

			if (!isPaused && !isManuallyScrolling) {
				const inc = AUTO_SPEED_PX_PER_MS * dt;
				scrollRef.current = mod(scrollRef.current + inc, totalWidth);
				applyTransform();
			}
			rafRef.current = requestAnimationFrame(tick);
		}

		rafRef.current = requestAnimationFrame(tick);
		return () => {
			mounted = false;
			lastFrameTime.current = null;
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
			rafRef.current = null;
		};
	}, [isPaused, isManuallyScrolling, totalWidth, applyTransform, shouldReduceMotion]);

	/* Wheel handling */
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const onWheel = (e: WheelEvent) => {
			const horiz = Math.abs(e.deltaX) > Math.abs(e.deltaY);
			const wantIntercept = horiz || e.shiftKey;
			if (!wantIntercept) return;

			e.preventDefault();
			setIsManuallyScrolling(true);
			setIsPaused(true);
			if (manualTimeoutRef.current) clearTimeout(manualTimeoutRef.current);

			const delta = (e.deltaX || e.deltaY) * WHEEL_SENSITIVITY;
			scrollRef.current = mod(scrollRef.current + delta, totalWidth);
			applyTransform();

			manualTimeoutRef.current = setTimeout(() => {
				setIsManuallyScrolling(false);
				setIsPaused(false);
			}, MANUAL_RESUME_MS);
		};

		container.addEventListener('wheel', onWheel, { passive: false });
		return () => {
			container.removeEventListener('wheel', onWheel);
			if (manualTimeoutRef.current) {
				clearTimeout(manualTimeoutRef.current);
				manualTimeoutRef.current = null;
			}
		};
	}, [applyTransform, totalWidth]);

	/* Pointer drag */
	useEffect(() => {
		const el = scrollerRef.current;
		if (!el) return;

		let pointerDown = false;
		let dragging = false;
		let startX = 0;
		let startScroll = 0;
		const DRAG_THRESHOLD = 6;

		const onPointerDown = (ev: PointerEvent) => {
			pointerDown = true;
			dragging = false;
			startX = ev.clientX;
			startScroll = scrollRef.current;
		};

		const onPointerMove = (ev: PointerEvent) => {
			if (!pointerDown) return;
			const dx = ev.clientX - startX;
			if (!dragging && Math.abs(dx) > DRAG_THRESHOLD) {
				dragging = true;
				setIsManuallyScrolling(true);
				setIsPaused(true);
				try {
					(ev.target as Element).setPointerCapture?.((ev as unknown as PointerEvent).pointerId);
				} catch {}
			}
			if (dragging) {
				scrollRef.current = mod(startScroll - dx, totalWidth);
				applyTransform();
				if (manualTimeoutRef.current) {
					clearTimeout(manualTimeoutRef.current);
					manualTimeoutRef.current = null;
				}
			}
		};

		const onPointerUp = (ev: PointerEvent) => {
			if (!pointerDown) return;
			if (dragging) {
				manualTimeoutRef.current = setTimeout(() => {
					setIsManuallyScrolling(false);
					setIsPaused(false);
				}, MANUAL_RESUME_MS);
			}
			try {
				(ev.target as Element).releasePointerCapture?.((ev as unknown as PointerEvent).pointerId);
			} catch {}
			dragging = false;
			pointerDown = false;
		};

		el.style.touchAction = 'pan-y';
		el.addEventListener('pointerdown', onPointerDown);
		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', onPointerUp);
		window.addEventListener('pointercancel', onPointerUp);

		return () => {
			el.removeEventListener('pointerdown', onPointerDown);
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', onPointerUp);
			window.removeEventListener('pointercancel', onPointerUp);
			if (manualTimeoutRef.current) {
				clearTimeout(manualTimeoutRef.current);
				manualTimeoutRef.current = null;
			}
		};
	}, [applyTransform, totalWidth]);

	/* Smooth arrow-driven scroll */
	const animateScrollTo = useCallback(
		(target: number, duration = EASE_SCROLL_DURATION) => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
			const start = performance.now();
			const from = scrollRef.current;
			const travel = target - from;

			function step(now: number) {
				const t = clamp((now - start) / duration, 0, 1);
				const ease = 1 - Math.pow(1 - t, 3);
				scrollRef.current = mod(from + travel * ease, totalWidth);
				applyTransform();
				if (t < 1) rafRef.current = requestAnimationFrame(step);
				else rafRef.current = null;
			}
			rafRef.current = requestAnimationFrame(step);
		},
		[applyTransform, totalWidth]
	);

	const scrollByPixels = useCallback(
		(deltaPixels: number) => {
			setIsManuallyScrolling(true);
			setIsPaused(true);
			if (manualTimeoutRef.current) clearTimeout(manualTimeoutRef.current);

			const target = mod(scrollRef.current + deltaPixels, totalWidth);
			animateScrollTo(target, EASE_SCROLL_DURATION);

			manualTimeoutRef.current = setTimeout(() => {
				setIsManuallyScrolling(false);
				setIsPaused(false);
			}, MANUAL_RESUME_MS + 200);
		},
		[animateScrollTo, totalWidth]
	);

	/* Cleanup */
	useEffect(() => {
		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
			if (manualTimeoutRef.current) clearTimeout(manualTimeoutRef.current);
		};
	}, []);

	/* -------------------- Render -------------------- */
	return (
		<section className="py-20 relative overflow-visible">
			<div className="container mx-auto px-4">
				<motion.div
					className="text-center mb-10"
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
				>
					<h2 className="text-3xl md:text-5xl text-white mb-4 font-semibold">Learning Journey</h2>
					<p className="text-gray-300 text-lg max-w-2xl mx-auto">
						Follow the structured path from foundations to mastery
					</p>
				</motion.div>

				<div
					ref={containerRef}
					className="relative w-full bg-transparent rounded-xl"
					onMouseEnter={() => setIsPaused(true)}
					onMouseLeave={() => {
						if (!isManuallyScrolling) setIsPaused(false);
						setActiveModuleId(null);
					}}
				>
					{/* Left Arrow */}
					<button
						aria-label="Scroll left"
						className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#39e6ff] transition"
						onClick={() => scrollByPixels(-ARROW_SCROLL_PIXELS)}
					>
						<ChevronLeft className="w-5 h-5 text-white" />
					</button>

					{/* Right Arrow */}
					<button
						aria-label="Scroll right"
						className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#39e6ff] transition"
						onClick={() => scrollByPixels(ARROW_SCROLL_PIXELS)}
					>
						<ChevronRight className="w-5 h-5 text-white" />
					</button>

					{/* Scroller */}
					<div className="overflow-hidden w-full">
						<div
							ref={scrollerRef}
							className="flex items-start gap-6 py-12 will-change-transform"
							style={{
								width: `${modules.length * ITEM_WIDTH}px`,
								transform: `translate3d(${-scrollRef.current}px,0,0)`,
							}}
						>
							{modules.map((module, idx) => {
								const baseIndex = idx % baseCount;
								const base = BASE_MODULES[baseIndex];
								const key = `${base.id}-${Math.floor(idx / baseCount)}`;
								const Icon = getStatusIcon(base.status);

								return (
									<div
										key={key}
										className="flex items-center flex-shrink-0 w-[220px] justify-center"
										style={{ width: ITEM_WIDTH }}
									>
										<div className="relative flex flex-col items-center">
											<button
												aria-label={`${base.title} module`}
												className="relative w-16 h-16 rounded-full flex items-center justify-center z-10 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#39e6ff] focus-visible:outline-none transition-transform"
												style={{
													backgroundColor: base.status === 'locked' ? '#111827' : '#0b1220',
													border: `2px solid ${getStatusColor(base.status)}`,
													boxShadow:
														activeModuleId === base.id ? `0 8px 30px ${getStatusColor(base.status)}40` : 'none',
												}}
												onClick={() => {
													if (isPaused) {
														setIsPaused(false);
														setActiveModuleId(null);
													} else {
														setIsPaused(true);
														setActiveModuleId(base.id);
													}
												}}
											>
												<Icon className="w-7 h-7" style={{ color: getStatusColor(base.status) }} />

												{base.status === 'completed' && (
													<motion.div
														className="absolute -top-2 -right-2 w-6 h-6 bg-[#00ff9f] rounded-full flex items-center justify-center"
														initial={{ scale: 0, rotate: -90 }}
														animate={{ scale: 1, rotate: 0 }}
														transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.45 }}
													>
														<Star className="w-3 h-3 text-black" />
													</motion.div>
												)}

												{base.status === 'current' && !shouldReduceMotion && (
													<motion.span
														className="absolute inset-0 rounded-full border-2 pointer-events-none"
														aria-hidden
														animate={{ scale: [1, 1.4, 1], opacity: [1, 0, 1] }}
														transition={{ duration: 2.2, repeat: Infinity }}
														style={{ borderColor: getStatusColor(base.status) }}
													/>
												)}
											</button>

											<div className="mt-3 text-center w-full px-2">
												<div className="text-white text-sm font-medium truncate">{base.title}</div>
												<div className="text-gray-400 text-xs mt-1">{base.lessons} lessons</div>

												{base.mastery > 0 && (
													<div className="mt-2 w-12 h-1 bg-gray-700 rounded-full mx-auto overflow-hidden">
														<motion.div
															className="h-full rounded-full"
															initial={{ width: 0 }}
															animate={{ width: `${clamp(base.mastery / 100) * 100}%` }}
															transition={{ duration: 0.9, ease: 'easeOut' }}
															style={{ background: 'linear-gradient(90deg,#00ff9f,#39e6ff)' }}
														/>
													</div>
												)}
											</div>
										</div>

										{/* connector line */}
										{idx < modules.length - 1 && (
											<div
												aria-hidden
												className="h-0.5 mx-4 flex-grow rounded-full"
												style={{
													background: `linear-gradient(90deg, ${getStatusColor(
														base.status
													)}30, #2d3748, ${getStatusColor(modules[(idx + 1) % modules.length].status)}30)`,
													minWidth: 48,
												}}
											/>
										)}
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
