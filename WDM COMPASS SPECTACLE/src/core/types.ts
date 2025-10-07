/**
 * WDM COMPASS - COMPLETE TYPE SYSTEM
 *
 * All type definitions for the entire animation system.
 * This file has ZERO dependencies and is imported by everything else.
 *
 * @version 3.0.0
 */

// ============================================
// BASIC TYPES
// ============================================

export interface Point {
	x: number;
	y: number;
}

export interface Color {
	r: number;
	g: number;
	b: number;
	a?: number;
}

export interface Size {
	width: number;
	height: number;
}

export interface Scale {
	x: number;
	y: number;
}

// ============================================
// ANIMATION CATEGORIES
// ============================================

export type AnimationCategory =
	| 'basic'
	| 'emotional'
	| 'morphing'
	| 'personality'
	| 'physics'
	| 'spectacular'
	| 'transitions'
	| 'interactive';

export type AnimationState = 'idle' | 'playing' | 'paused' | 'completed';

// ============================================
// ANIMATION TYPE UNIONS
// ============================================

export type BasicAnimation =
	| 'spin'
	| 'pulse'
	| 'bounce'
	| 'shake'
	| 'wobble'
	| 'float'
	| 'glow'
	| 'shimmer'
	| 'fade'
	| 'zoom'
	| 'tilt'
	| 'swing'
	| 'flip'
	| 'roll'
	| 'breathe';

export type EmotionalAnimation =
	| 'happy'
	| 'excited'
	| 'proud'
	| 'sad'
	| 'crying'
	| 'nervous'
	| 'shocked'
	| 'angry'
	| 'tired'
	| 'celebrating'
	| 'thinking'
	| 'loving';

export type MorphingAnimation =
	| 'melt'
	| 'liquid'
	| 'explode'
	| 'shatter'
	| 'dissolve'
	| 'reform'
	| 'squash-stretch'
	| 'spiral'
	| 'pixelate'
	| 'glitch';

export type PersonalityAnimation =
	| 'humanoid-form'
	| 'humanoid-idle'
	| 'dancing'
	| 'waving'
	| 'pointing'
	| 'looking'
	| 'flying'
	| 'walking'
	| 'jumping'
	| 'running'
	| 'sitting'
	| 'sleeping';

export type PhysicsAnimation =
	| 'gravity-fall'
	| 'bounce-physics'
	| 'pendulum-swing'
	| 'elastic-stretch'
	| 'magnetic-pull'
	| 'wind-blown'
	| 'orbit-motion'
	| 'spring-oscillate';

export type SpectacularAnimation =
	| 'fireball'
	| 'supernova'
	| 'black-hole'
	| 'portal'
	| 'lightning'
	| 'aurora'
	| 'galaxy'
	| 'nebula'
	| 'time-warp'
	| 'dimension-shift'
	| 'energy-burst'
	| 'crystallize'
	| 'vortex'
	| 'phoenix-rise'
	| 'constellation';

export type TransitionAnimation =
	| 'wipe'
	| 'iris'
	| 'split'
	| 'curtain'
	| 'page-turn'
	| 'ripple-reveal'
	| 'zoom-blur'
	| 'particles-reveal';

export type InteractiveAnimation =
	| 'follow-cursor'
	| 'react-to-click'
	| 'hover-attention'
	| 'drag-response'
	| 'look-at-cursor'
	| 'magnetic-cursor'
	| 'avoid-cursor'
	| 'react-to-scroll'
	| 'sound-reactive'
	| 'touch-response';

export type AnimationType =
	| BasicAnimation
	| EmotionalAnimation
	| MorphingAnimation
	| PersonalityAnimation
	| PhysicsAnimation
	| SpectacularAnimation
	| TransitionAnimation
	| InteractiveAnimation;

// ============================================
// EASING FUNCTIONS
// ============================================

export type EasingFunction = (t: number) => number;

export type EasingName =
	| 'linear'
	| 'easeInQuad'
	| 'easeOutQuad'
	| 'easeInOutQuad'
	| 'easeInCubic'
	| 'easeOutCubic'
	| 'easeInOutCubic'
	| 'easeInQuart'
	| 'easeOutQuart'
	| 'easeInOutQuart'
	| 'easeInQuint'
	| 'easeOutQuint'
	| 'easeInOutQuint'
	| 'easeInSine'
	| 'easeOutSine'
	| 'easeInOutSine'
	| 'easeInExpo'
	| 'easeOutExpo'
	| 'easeInOutExpo'
	| 'easeInCirc'
	| 'easeOutCirc'
	| 'easeInOutCirc'
	| 'easeInBack'
	| 'easeOutBack'
	| 'easeInOutBack'
	| 'easeInElastic'
	| 'easeOutElastic'
	| 'easeInOutElastic'
	| 'easeInBounce'
	| 'easeOutBounce'
	| 'easeInOutBounce';

// ============================================
// BASE ANIMATION CONFIG
// ============================================

export interface BaseAnimationConfig {
	name: string;
	duration: number;
	delay?: number;
	loop?: boolean;
	loopCount?: number;
	easing?: EasingName | EasingFunction;
	onStart?: () => void;
	onUpdate?: (progress: number) => void;
	onComplete?: () => void;
}

// ============================================
// SPECIFIC ANIMATION CONFIGS
// ============================================

export interface BasicAnimationConfig extends BaseAnimationConfig {
	type: BasicAnimation;
}

export interface EmotionalConfig extends BaseAnimationConfig {
	type: EmotionalAnimation;
	intensity?: number;
}

export interface PersonalityConfig extends BaseAnimationConfig {
	type: PersonalityAnimation;
	bodyParts?: {
		showArms?: boolean;
		showLegs?: boolean;
		showWings?: boolean;
		showEyes?: boolean;
		showMouth?: boolean;
		showHair?: boolean;
		showGloves?: boolean;
		showBoots?: boolean;
	};
	expression?: 'happy' | 'sad' | 'angry' | 'surprised' | 'neutral';
	clothingColor?: string;
	accessoryColor?: string;
}

export interface MorphingConfig extends BaseAnimationConfig {
	type: MorphingAnimation;
	particleCount?: number;
	preserveColors?: boolean;
}

export interface PhysicsConfig extends BaseAnimationConfig {
	type: PhysicsAnimation;
	gravity?: number;
	bounce?: number;
	friction?: number;
	stiffness?: number;
	damping?: number;
	length?: number;
	amplitude?: number;
}

export interface SpectacularConfig extends BaseAnimationConfig {
	type: SpectacularAnimation;
	intensity?: number;
	particleCount?: number;
	voidSize?: number;
	accretionDiskSpeed?: number;
	starCount?: number;
	pattern?: string;
	chargeTime?: number;
	shardCount?: number;
	crystalline?: boolean;
}

export interface TransitionConfig extends BaseAnimationConfig {
	type: TransitionAnimation;
	direction?: 'horizontal' | 'vertical' | 'radial';
	pixelSize?: number;
}

export interface InteractiveConfig extends BaseAnimationConfig {
	type: InteractiveAnimation;
	damping?: number;
	sensitivity?: number;
	clickAnimation?: AnimationType;
	strength?: number;
	range?: number;
	speed?: number;
	pinchToZoom?: boolean;
	rotateGesture?: boolean;
}

export type AnyAnimationConfig =
	| BasicAnimationConfig
	| EmotionalConfig
	| PersonalityConfig
	| MorphingConfig
	| PhysicsConfig
	| SpectacularConfig
	| TransitionConfig
	| InteractiveConfig;

// ============================================
// COMPASS STRUCTURE
// ============================================

export interface GradientStop {
	offset: number;
	color: string | Color;
}

export interface Gradient {
	type: 'linear' | 'radial';
	stops: GradientStop[];
}

export interface CompassShape {
	type: 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'polygon';
	size: number;
	position: Point;
	rotation: number;
	scale: Scale;
	opacity: number;
	color?: string | Color;
	gradient?: Gradient;
	strokeWidth?: number;
	strokeColor?: string | Color;
	sides?: number;
}

export interface Needle {
	length: number;
	width: number;
	angle: number;
	color: string | Color;
	glowIntensity: number;
}

export interface Pivot {
	radius: number;
	color: string | Color;
	strokeColor?: string | Color;
	strokeWidth?: number;
}

export interface GlassOverlay {
	visible: boolean;
	opacity: number;
}

export interface CompassElement {
	rim: CompassShape;
	innerCircle: CompassShape;
	needle: Needle;
	pivot: Pivot;
	glassOverlay?: GlassOverlay;
}

// ============================================
// PERSONALITY SYSTEM
// ============================================

export interface BodySegment {
	start: Point;
	end: Point;
	joint?: Point;
	width: number;
	color: string | Color;
}

export interface BodyPart {
	type: 'arm' | 'leg' | 'wing' | 'hair' | 'tail';
	side?: 'left' | 'right';
	segments: BodySegment[];
	visible: boolean;
	currentPose?: string;
	animation?: {
		keyframes: { positions: Point[] }[];
		progress: number;
	};
}

export interface Eye {
	position: Point;
	size: number;
	openAmount: number;
	pupilPosition: Point;
}

export interface Mouth {
	type: 'smile' | 'frown' | 'neutral' | 'surprised' | 'laughing';
	position: Point;
	width: number;
	openAmount: number;
	curve: number;
}

export interface Eyebrow {
	angle: number;
	curve: number;
}

export interface Blush {
	visible: boolean;
	intensity: number;
	color: string | Color;
}

export interface Drop {
	position: Point;
	size: number;
	velocity: Point;
}

export interface Heart {
	position: Point;
	size: number;
	opacity: number;
}

export interface Expression {
	eyes: {
		left: Eye;
		right: Eye;
		blinkProgress?: number;
	};
	mouth: Mouth;
	eyebrows?: {
		left: Eyebrow;
		right: Eyebrow;
	};
	blush?: Blush;
	sweatDrops?: {
		drops: Drop[];
	};
	tearDrops?: {
		drops: Drop[];
	};
	hearts?: {
		hearts: Heart[];
	};
}

export type PersonalityMode = 'compass' | 'transitioning' | 'humanoid';
export type Mood =
	| 'neutral'
	| 'happy'
	| 'sad'
	| 'angry'
	| 'excited'
	| 'nervous'
	| 'proud'
	| 'calm'
	| 'focused';

export interface PersonalityState {
	mode: PersonalityMode;
	mood: Mood;
	energy: number;
	attention: Point | null;
	bodyParts: BodyPart[];
	expression: Expression;
	transitionProgress?: number;
}

// ============================================
// PHYSICS SYSTEM
// ============================================

export interface PhysicsBody {
	id: string;
	position: Point;
	velocity: Point;
	acceleration: Point;
	rotation: number;
	angularVelocity: number;
	mass: number;
	friction: number;
	bounce: number;
	fixed: boolean;
}

export interface PhysicsConstraint {
	type: 'spring' | 'distance' | 'pin' | 'rope';
	bodyA: string;
	bodyB?: string;
	point?: Point;
	length?: number;
	stiffness?: number;
	damping?: number;
}

export interface PhysicsWorld {
	gravity: Point;
	wind: Point;
	bodies: Map<string, PhysicsBody>;
	constraints: PhysicsConstraint[];
	timeScale: number;
}

// ============================================
// PARTICLE SYSTEM
// ============================================

export type ParticleShape = 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'sparkle';

export interface Particle {
	id: string;
	position: Point;
	velocity: Point;
	acceleration: Point;
	life: number;
	maxLife: number;
	size: number;
	color: string | Color;
	rotation: number;
	rotationSpeed: number;
	opacity: number;
	shape: ParticleShape;
	trail?: Point[];
}

export interface ParticleEmitterConfig {
	lifespan: { min: number; max: number };
	velocity: { min: number; max: number };
	angle: { min: number; max: number };
	size: { min: number; max: number };
	colors: (string | Color)[];
	shapes: ParticleShape[];
	gravity?: Point;
	friction?: number;
	fadeOut?: boolean;
	trail?: boolean;
}

export interface ParticleEmitter {
	id: string;
	position: Point;
	rate: number;
	active: boolean;
	particles: Particle[];
	maxParticles: number;
	config: ParticleEmitterConfig;
}

// ============================================
// RENDER CONTEXT
// ============================================

export interface InputState {
	mouse: Point;
	clicks: Point[];
	touches: Point[];
	scroll: Point;
}

export interface RenderState {
	compass: CompassElement;
	personality?: PersonalityState;
	physics?: PhysicsWorld;
	emitters: ParticleEmitter[];
}

export interface RenderContext {
	ctx: CanvasRenderingContext2D;
	canvas: HTMLCanvasElement;
	size: number;
	time: number;
	deltaTime: number;
	progress: number;
	state: RenderState;
	input?: InputState;
}

// ============================================
// ENGINE OPTIONS
// ============================================

export interface CompassEngineOptions {
	size?: number;
	enableHiDPI?: boolean;
	backgroundColor?: string | 'transparent';
	primaryColor?: string;
	accentColor?: string;
	neutralColor?: string;
	enablePhysics?: boolean;
	enableParticles?: boolean;
	enablePersonality?: boolean;
	enableInteractive?: boolean;
	targetFPS?: number;
	reducedMotion?: boolean;
	maxParticles?: number;
	seed?: number;
}

// ============================================
// PERFORMANCE METRICS
// ============================================

export interface PerformanceMetrics {
	fps: number;
	frameTime: number;
	droppedFrames: number;
	particleCount: number;
	physicsBodyCount: number;
	avgFrameTime?: number;
	minFrameTime?: number;
	maxFrameTime?: number;
	totalFrames?: number;
}

// ============================================
// ANIMATION PRESETS
// ============================================

export interface AnimationPreset {
	name: string;
	config: AnyAnimationConfig;
	description?: string;
}

export interface AnimationSequence {
	animations: AnyAnimationConfig[];
	totalDuration: number;
}

// ============================================
// EXPORT OPTIONS
// ============================================

export interface ExportOptions {
	format: 'png' | 'jpeg' | 'webp' | 'gif';
	quality?: number;
	width?: number;
	height?: number;
	frames?: number;
	fps?: number;
}

// ============================================
// UTILITY TYPES
// ============================================

export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// ============================================
// ERROR TYPES
// ============================================

export interface CompassErrorInfo {
	code: string;
	message: string;
	context?: Record<string, unknown>;
}

// ============================================
// SCHEDULER OPTIONS
// ============================================

export interface SchedulerOptions {
	targetFPS: number;
	onFrame: (time: number, deltaTime: number) => void;
	monitoring: boolean;
	adaptiveThrottling?: boolean;
	backgroundThrottling?: boolean;
}

export interface PerformanceStats {
	fps: number;
	avgFrameTime: number;
	minFrameTime: number;
	maxFrameTime: number;
	droppedFrames: number;
	totalFrames: number;
}

// ============================================
// RENDERER OPTIONS
// ============================================

export interface CanvasRendererOptions {
	size: number;
	enableHiDPI: boolean;
	backgroundColor: string | 'transparent';
}
