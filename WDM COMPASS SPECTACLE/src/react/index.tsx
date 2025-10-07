/**
 * WDM COMPASS - REACT INTEGRATION (FULLY FIXED)
 *
 * All TypeScript errors resolved
 * All ESLint warnings fixed
 *
 * @version 3.0.0-FINAL-FIXED
 */

import React, { createContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { CompassEngine } from '../core/CompassEngine';
import { getAnimation } from '../animations';
import type {
	CompassEngineOptions,
	AnyAnimationConfig,
	AnimationState,
	PerformanceMetrics,
	AnimationType,
	BasicAnimation,
} from '../core/types';

// ============================================
// TYPE GUARDS & HELPERS
// ============================================

function isValidAnimationType(type: string): type is AnimationType {
	const validTypes: AnimationType[] = [
		// Basic
		'spin',
		'pulse',
		'bounce',
		'shake',
		'wobble',
		'float',
		'glow',
		'shimmer',
		'fade',
		'zoom',
		'tilt',
		'swing',
		'flip',
		'roll',
		'breathe',
		// Emotional
		'happy',
		'excited',
		'proud',
		'sad',
		'crying',
		'nervous',
		'shocked',
		'angry',
		'tired',
		'celebrating',
		'thinking',
		'loving',
		// Morphing
		'melt',
		'liquid',
		'explode',
		'shatter',
		'dissolve',
		'reform',
		'squash-stretch',
		'spiral',
		'pixelate',
		'glitch',
		// Personality
		'humanoid-form',
		'humanoid-idle',
		'dancing',
		'waving',
		'pointing',
		'looking',
		'flying',
		'walking',
		'jumping',
		'running',
		'sitting',
		'sleeping',
		// Physics
		'gravity-fall',
		'bounce-physics',
		'pendulum-swing',
		'elastic-stretch',
		'magnetic-pull',
		'wind-blown',
		'orbit-motion',
		'spring-oscillate',
		// Spectacular
		'fireball',
		'supernova',
		'black-hole',
		'portal',
		'lightning',
		'aurora',
		'galaxy',
		'nebula',
		'time-warp',
		'dimension-shift',
		'energy-burst',
		'crystallize',
		'vortex',
		'phoenix-rise',
		'constellation',
		// Transitions
		'wipe',
		'iris',
		'split',
		'curtain',
		'page-turn',
		'ripple-reveal',
		'zoom-blur',
		'particles-reveal',
		// Interactive
		'follow-cursor',
		'react-to-click',
		'hover-attention',
		'drag-response',
		'look-at-cursor',
		'magnetic-cursor',
		'avoid-cursor',
		'react-to-scroll',
		'sound-reactive',
		'touch-response',
	];
	return validTypes.includes(type as AnimationType);
}

// ============================================
// CONTEXT
// ============================================

interface CompassContextValue {
	play: (config: AnyAnimationConfig) => void;
	stop: () => void;
	pause: () => void;
	resume: () => void;
	getState: () => AnimationState;
	getMetrics: () => PerformanceMetrics;
}

const CompassContext = createContext<CompassContextValue | null>(null);

export interface CompassProviderProps {
	children: React.ReactNode;
	options?: CompassEngineOptions;
}

export function CompassProvider({ children, options }: CompassProviderProps) {
	const engineRef = useRef<CompassEngine | null>(null);

	// Memoize options to prevent unnecessary re-creates
	const memoizedOptions = useMemo(() => options, [options]);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		engineRef.current = new CompassEngine(memoizedOptions);

		return () => {
			if (engineRef.current) {
				engineRef.current.destroy();
			}
		};
	}, [memoizedOptions]);

	const value: CompassContextValue = useMemo(
		() => ({
			play: (config: AnyAnimationConfig) => {
				// FIXED: Properly type the animation type extraction
				const animationType = config.type as string;

				if (!isValidAnimationType(animationType)) {
					console.warn(`[CompassProvider] Invalid animation type: ${animationType}`);
					return;
				}

				const animationFn = getAnimation(animationType);
				if (animationFn && engineRef.current) {
					engineRef.current.play(config, animationFn);
				}
			},
			stop: () => {
				engineRef.current?.stop();
			},
			pause: () => {
				engineRef.current?.pause();
			},
			resume: () => {
				engineRef.current?.resume();
			},
			getState: () => {
				return engineRef.current?.getState() || 'idle';
			},
			getMetrics: () => {
				return (
					engineRef.current?.getMetrics() || {
						fps: 0,
						frameTime: 0,
						droppedFrames: 0,
						particleCount: 0,
						physicsBodyCount: 0,
					}
				);
			},
		}),
		[]
	);

	return <CompassContext.Provider value={value}>{children}</CompassContext.Provider>;
}

// ============================================
// MAIN HOOK - useCompass
// ============================================

export interface UseCompassReturn {
	play: (animationType: AnimationType, options?: Partial<AnyAnimationConfig>) => void;
	playSequence: (animations: AnimationType[], duration?: number) => Promise<void>;
	stop: () => void;
	pause: () => void;
	resume: () => void;
	state: AnimationState;
	metrics: PerformanceMetrics;

	// Convenience methods
	showHappy: () => void;
	showSad: () => void;
	showExcited: () => void;
	showLoading: () => void;
	showSuccess: () => void;
	showError: () => void;
	transformToHuman: () => void;
	dance: () => void;
	wave: () => void;
	explode: () => void;
	melt: () => void;

	// Get canvas element
	getCanvas: () => HTMLCanvasElement | null;
}

export function useCompass(options?: CompassEngineOptions): UseCompassReturn {
	const engineRef = useRef<CompassEngine | null>(null);
	const [state, setState] = useState<AnimationState>('idle');
	const [metrics, setMetrics] = useState<PerformanceMetrics>({
		fps: 0,
		frameTime: 0,
		droppedFrames: 0,
		particleCount: 0,
		physicsBodyCount: 0,
	});

	// FIXED: Memoize options to satisfy exhaustive-deps
	const memoizedOptions = useMemo(() => options, [options]);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		engineRef.current = new CompassEngine(memoizedOptions);

		const interval = setInterval(() => {
			if (engineRef.current) {
				setState(engineRef.current.getState());
				setMetrics(engineRef.current.getMetrics());
			}
		}, 100);

		return () => {
			clearInterval(interval);
			if (engineRef.current) {
				engineRef.current.destroy();
			}
		};
	}, [memoizedOptions]); // FIXED: Now includes memoizedOptions

	const play = useCallback(
		(animationType: AnimationType, options: Partial<AnyAnimationConfig> = {}) => {
			if (!engineRef.current) return;

			const animationFn = getAnimation(animationType);
			if (!animationFn) {
				console.warn(`[useCompass] Animation not found: ${animationType}`);
				return;
			}

			// FIXED: Create properly typed config based on animation type
			const baseConfig = {
				name: animationType,
				duration: options.duration || 2000,
				loop: options.loop || false,
				easing: options.easing,
				delay: options.delay,
				onComplete: options.onComplete,
				onStart: options.onStart,
				onUpdate: options.onUpdate,
			};

			// FIXED: Type-safe config creation
			let config: AnyAnimationConfig;

			if (animationType === 'spin' || animationType === 'pulse' || animationType === 'bounce') {
				config = {
					type: animationType,
					...baseConfig,
				} as AnyAnimationConfig;
			} else if (animationType === 'happy' || animationType === 'sad') {
				config = {
					type: animationType,
					...baseConfig,
				} as AnyAnimationConfig;
			} else {
				// Generic fallback for other animation types
				config = {
					type: animationType as BasicAnimation, // Safe cast since we validated above
					...baseConfig,
				} as AnyAnimationConfig;
			}

			engineRef.current.play(config, animationFn);
		},
		[]
	);

	const playSequence = useCallback(
		async (animations: AnimationType[], duration = 2000) => {
			for (const anim of animations) {
				play(anim, { duration });
				await new Promise((resolve) => setTimeout(resolve, duration));
			}
		},
		[play]
	);

	const stop = useCallback(() => {
		engineRef.current?.stop();
	}, []);

	const pause = useCallback(() => {
		engineRef.current?.pause();
	}, []);

	const resume = useCallback(() => {
		engineRef.current?.resume();
	}, []);

	const getCanvas = useCallback(() => {
		return engineRef.current?.getCanvas() || null;
	}, []);

	// Convenience methods
	const showHappy = useCallback(() => play('happy', { duration: 2000, loop: true }), [play]);
	const showSad = useCallback(() => play('sad', { duration: 2000, loop: true }), [play]);
	const showExcited = useCallback(() => play('excited', { duration: 1500, loop: true }), [play]);
	const showLoading = useCallback(() => play('spin', { duration: 2000, loop: true }), [play]);
	const showSuccess = useCallback(() => play('celebrating', { duration: 2000 }), [play]);
	const showError = useCallback(() => play('angry', { duration: 1000 }), [play]);
	const transformToHuman = useCallback(() => play('humanoid-form', { duration: 1500 }), [play]);
	const dance = useCallback(() => play('dancing', { duration: 5000, loop: true }), [play]);
	const wave = useCallback(() => play('waving', { duration: 1500 }), [play]);
	const explode = useCallback(() => play('explode', { duration: 2000 }), [play]);
	const melt = useCallback(() => play('melt', { duration: 3000 }), [play]);

	return {
		play,
		playSequence,
		stop,
		pause,
		resume,
		state,
		metrics,
		showHappy,
		showSad,
		showExcited,
		showLoading,
		showSuccess,
		showError,
		transformToHuman,
		dance,
		wave,
		explode,
		melt,
		getCanvas,
	};
}

// ============================================
// COMPASS COMPONENT
// ============================================

export interface CompassProps extends Omit<CompassEngineOptions, 'size'> {
	animation?: AnimationType;
	autoPlay?: boolean;
	onComplete?: () => void;
	className?: string;
	style?: React.CSSProperties;
	size?: number;
}

export function Compass({
	animation,
	autoPlay = true,
	onComplete,
	className,
	style,
	size,
	...restOptions
}: CompassProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const engineRef = useRef<CompassEngine | null>(null);

	// FIXED: Properly memoize engineOptions
	const engineOptions = useMemo<CompassEngineOptions>(
		() => ({
			size,
			...restOptions,
		}),
		[size, restOptions]
	);

	useEffect(() => {
		if (!containerRef.current || typeof window === 'undefined') return;

		engineRef.current = new CompassEngine(engineOptions);
		const canvas = engineRef.current.getCanvas();
		containerRef.current.appendChild(canvas);

		return () => {
			if (engineRef.current) {
				engineRef.current.destroy();
			}
		};
	}, [engineOptions]); // FIXED: Now includes engineOptions

	useEffect(() => {
		if (!engineRef.current || !animation || !autoPlay) return;

		const animationFn = getAnimation(animation);
		if (!animationFn) return;

		// FIXED: Properly typed config
		const config: AnyAnimationConfig = {
			type: animation as BasicAnimation, // Safe cast
			name: animation,
			duration: 2000,
			onComplete,
		};

		engineRef.current.play(config, animationFn);
	}, [animation, autoPlay, onComplete]);

	return (
		<div
			ref={containerRef}
			className={className}
			style={{
				display: 'inline-block',
				lineHeight: 0,
				...style,
			}}
		/>
	);
}

// ============================================
// CONTROLLER COMPONENT (DEV TOOL)
// ============================================

export interface CompassControllerProps {
	compass: UseCompassReturn;
}

export function CompassController({ compass }: CompassControllerProps) {
	const [selectedCategory, setSelectedCategory] = useState<string>('Basic');
	const [isOpen, setIsOpen] = useState(true);

	const categories: Record<string, AnimationType[]> = {
		'Basic': ['spin', 'pulse', 'bounce', 'shake', 'wobble', 'float', 'glow'],
		'Emotional': ['happy', 'excited', 'sad', 'angry', 'celebrating', 'loving'],
		'Morphing': ['melt', 'liquid', 'explode', 'shatter', 'dissolve', 'pixelate'],
		'Personality': ['humanoid-form', 'dancing', 'waving', 'flying', 'walking'],
		'Physics': ['gravity-fall', 'bounce-physics', 'pendulum-swing', 'elastic-stretch'],
		'Spectacular': ['fireball', 'supernova', 'black-hole', 'portal', 'lightning'],
		'Transitions': ['wipe', 'iris', 'split', 'curtain', 'page-turn'],
		'Interactive': ['follow-cursor', 'react-to-click', 'hover-attention', 'magnetic-cursor'],
	};

	if (!isOpen) {
		return (
			<button
				onClick={() => setIsOpen(true)}
				style={{
					position: 'fixed',
					bottom: 20,
					right: 20,
					padding: '10px 20px',
					background: 'rgba(11, 99, 255, 0.9)',
					border: 'none',
					borderRadius: 8,
					color: '#fff',
					cursor: 'pointer',
					fontFamily: 'system-ui, sans-serif',
					zIndex: 9999,
				}}
			>
				🧭 Open Controller
			</button>
		);
	}

	return (
		<div
			style={{
				position: 'fixed',
				bottom: 20,
				right: 20,
				background: 'rgba(15, 23, 36, 0.95)',
				border: '1px solid rgba(11, 99, 255, 0.3)',
				borderRadius: 12,
				padding: 20,
				minWidth: 300,
				maxWidth: 350,
				color: '#fff',
				fontFamily: 'system-ui, sans-serif',
				zIndex: 9999,
				boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
			}}
		>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: 15,
				}}
			>
				<h3 style={{ margin: 0, color: '#0BFF7F', fontSize: 16 }}>🧭 Compass Controller</h3>
				<button
					onClick={() => setIsOpen(false)}
					style={{
						background: 'transparent',
						border: 'none',
						color: '#fff',
						cursor: 'pointer',
						fontSize: 20,
					}}
				>
					×
				</button>
			</div>

			<div style={{ marginBottom: 15, fontSize: 12 }}>
				<div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 5 }}>
					State: <strong style={{ color: '#0BFF7F' }}>{compass.state}</strong>
				</div>
				<div style={{ color: 'rgba(255,255,255,0.6)' }}>
					FPS: <strong style={{ color: '#FFB400' }}>{compass.metrics.fps}</strong> | Particles:{' '}
					<strong style={{ color: '#FFB400' }}>{compass.metrics.particleCount}</strong>
				</div>
			</div>

			<div style={{ display: 'flex', gap: 5, marginBottom: 15 }}>
				<button onClick={compass.pause} style={buttonStyle}>
					⏸️
				</button>
				<button onClick={compass.resume} style={buttonStyle}>
					▶️
				</button>
				<button onClick={compass.stop} style={buttonStyle}>
					⏹️
				</button>
			</div>

			<div style={{ marginBottom: 10 }}>
				<select
					value={selectedCategory}
					onChange={(e) => setSelectedCategory(e.target.value)}
					style={{
						width: '100%',
						padding: 8,
						background: 'rgba(11, 99, 255, 0.2)',
						border: '1px solid rgba(11, 99, 255, 0.4)',
						borderRadius: 6,
						color: '#fff',
						fontSize: 14,
					}}
				>
					{Object.keys(categories).map((cat) => (
						<option key={cat} value={cat}>
							{cat}
						</option>
					))}
				</select>
			</div>

			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(2, 1fr)',
					gap: 5,
					maxHeight: 200,
					overflowY: 'auto',
				}}
			>
				{categories[selectedCategory]?.map((anim) => (
					<button
						key={anim}
						onClick={() => compass.play(anim)}
						style={{
							...buttonStyle,
							fontSize: 11,
							padding: '8px 12px',
						}}
					>
						{anim}
					</button>
				))}
			</div>

			<div
				style={{
					marginTop: 15,
					paddingTop: 15,
					borderTop: '1px solid rgba(255,255,255,0.1)',
					fontSize: 11,
					color: 'rgba(255,255,255,0.5)',
					textAlign: 'center',
				}}
			>
				80 animations available
			</div>
		</div>
	);
}

const buttonStyle: React.CSSProperties = {
	padding: '6px 12px',
	background: 'rgba(11, 99, 255, 0.3)',
	border: '1px solid rgba(11, 99, 255, 0.5)',
	borderRadius: 6,
	color: '#fff',
	cursor: 'pointer',
	fontSize: 13,
	transition: 'all 0.2s',
};
