/**
 * WDM Favicon Animation System - Type Definitions
 * 
 * Complete type system for the favicon animation framework.
 * Zero dependencies, maximum type safety.
 */

// ============================================
// CORE TYPES
// ============================================

/**
 * Animation states
 */
export type AnimationState = 
  | 'idle'
  | 'running'
  | 'paused'
  | 'completed'
  | 'error';

/**
 * Easing function type
 */
export type EasingFunction = (t: number) => number;

/**
 * Color in various formats
 */
export type Color = string | { r: number; g: number; b: number; a?: number };

/**
 * 2D Point
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Rectangle bounds
 */
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ============================================
// ANIMATION CONFIGURATION
// ============================================

/**
 * Base animation configuration
 */
export interface AnimationConfig {
  /** Animation name/identifier */
  name: string;
  
  /** Duration in milliseconds */
  duration: number;
  
  /** Easing function */
  easing?: EasingFunction | keyof typeof import('../utils/easing').Easing;
  
  /** Loop animation */
  loop?: boolean;
  
  /** Loop count (infinite if loop=true and loopCount undefined) */
  loopCount?: number;
  
  /** Delay before starting (ms) */
  delay?: number;
  
  /** Auto-reverse animation */
  autoReverse?: boolean;
  
  /** Callback on animation complete */
  onComplete?: () => void;
  
  /** Callback on animation start */
  onStart?: () => void;
  
  /** Callback on each frame */
  onUpdate?: (progress: number) => void;
}

/**
 * Keyframe definition
 */
export interface Keyframe {
  /** Time in animation (0-1) */
  time: number;
  
  /** Values at this keyframe */
  values: Record<string, number | string | Color>;
  
  /** Easing to next keyframe */
  easing?: EasingFunction;
}

/**
 * Animation timeline
 */
export interface Timeline {
  keyframes: Keyframe[];
  duration: number;
  loop?: boolean;
}

// ============================================
// LOADER ANIMATIONS
// ============================================

/**
 * Circular loader configuration
 */
export interface CircularLoaderConfig extends AnimationConfig {
  type: 'circular-loader';
  radius?: number;
  lineWidth?: number;
  color?: Color;
  backgroundColor?: Color;
  startAngle?: number;
  showPercentage?: boolean;
  clockwise?: boolean;
}

/**
 * Square loader configuration
 */
export interface SquareLoaderConfig extends AnimationConfig {
  type: 'square-loader';
  size?: number;
  lineWidth?: number;
  color?: Color;
  gradient?: boolean;
  cornerRadius?: number;
}

/**
 * Bar loader configuration
 */
export interface BarLoaderConfig extends AnimationConfig {
  type: 'bar-loader';
  width?: number;
  height?: number;
  color?: Color;
  backgroundColor?: Color;
  direction?: 'horizontal' | 'vertical';
}

/**
 * Dots loader configuration
 */
export interface DotsLoaderConfig extends AnimationConfig {
  type: 'dots-loader';
  dotCount?: number;
  dotSize?: number;
  spacing?: number;
  color?: Color;
  pattern?: 'wave' | 'pulse' | 'bounce';
}

/**
 * Spinner loader configuration
 */
export interface SpinnerLoaderConfig extends AnimationConfig {
  type: 'spinner-loader';
  radius?: number;
  lineWidth?: number;
  color?: Color;
  speed?: number;
  segments?: number;
}

// ============================================
// INDICATOR ANIMATIONS
// ============================================

/**
 * Badge configuration
 */
export interface BadgeConfig extends AnimationConfig {
  type: 'badge';
  count: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  backgroundColor?: Color;
  textColor?: Color;
  size?: number;
  animate?: 'pop' | 'slide' | 'fade' | 'none';
}

/**
 * Pulse configuration
 */
export interface PulseConfig extends AnimationConfig {
  type: 'pulse';
  minScale?: number;
  maxScale?: number;
  color?: Color;
  intensity?: number;
}

/**
 * Blink configuration
 */
export interface BlinkConfig extends AnimationConfig {
  type: 'blink';
  onDuration?: number;
  offDuration?: number;
  color?: Color;
}

/**
 * Status dot configuration
 */
export interface StatusDotConfig extends AnimationConfig {
  type: 'status-dot';
  status: 'online' | 'offline' | 'away' | 'busy';
  position?: 'top-right' | 'bottom-right';
  size?: number;
  pulse?: boolean;
}

/**
 * Progress ring configuration
 */
export interface ProgressRingConfig extends AnimationConfig {
  type: 'progress-ring';
  progress: number;
  radius?: number;
  lineWidth?: number;
  color?: Color;
  backgroundColor?: Color;
  showPercentage?: boolean;
}

// ============================================
// EFFECT ANIMATIONS
// ============================================

/**
 * Wave configuration
 */
export interface WaveConfig extends AnimationConfig {
  type: 'wave';
  amplitude?: number;
  frequency?: number;
  speed?: number;
  color?: Color;
  lineWidth?: number;
}

/**
 * Ripple configuration
 */
export interface RippleConfig extends AnimationConfig {
  type: 'ripple';
  maxRadius?: number;
  color?: Color;
  lineWidth?: number;
  rippleCount?: number;
  speed?: number;
}

/**
 * Particle system configuration
 */
export interface ParticlesConfig extends AnimationConfig {
  type: 'particles';
  particleCount?: number;
  particleSize?: number;
  colors?: Color[];
  velocity?: { min: number; max: number };
  lifetime?: number;
  gravity?: boolean;
}

/**
 * Confetti configuration
 */
export interface ConfettiConfig extends AnimationConfig {
  type: 'confetti';
  particleCount?: number;
  colors?: Color[];
  spread?: number;
  velocity?: number;
  gravity?: number;
}

/**
 * Glow configuration
 */
export interface GlowConfig extends AnimationConfig {
  type: 'glow';
  color?: Color;
  intensity?: number;
  radius?: number;
  pulseSpeed?: number;
}

/**
 * Shimmer configuration
 */
export interface ShimmerConfig extends AnimationConfig {
  type: 'shimmer';
  angle?: number;
  width?: number;
  color?: Color;
  speed?: number;
}

/**
 * Morph configuration
 */
export interface MorphConfig extends AnimationConfig {
  type: 'morph';
  fromShape: 'circle' | 'square' | 'triangle' | 'star';
  toShape: 'circle' | 'square' | 'triangle' | 'star';
  color?: Color;
}

// ============================================
// BRANDING ANIMATIONS
// ============================================

/**
 * Logo spin configuration
 */
export interface LogoSpinConfig extends AnimationConfig {
  type: 'logo-spin';
  speed?: number;
  direction?: 'clockwise' | 'counterclockwise';
  continuous?: boolean;
}

/**
 * Logo scale configuration
 */
export interface LogoScaleConfig extends AnimationConfig {
  type: 'logo-scale';
  minScale?: number;
  maxScale?: number;
  pattern?: 'pulse' | 'bounce' | 'elastic';
}

/**
 * Logo bounce configuration
 */
export interface LogoBounceConfig extends AnimationConfig {
  type: 'logo-bounce';
  height?: number;
  bounces?: number;
  gravity?: number;
}

/**
 * Logo flip configuration
 */
export interface LogoFlipConfig extends AnimationConfig {
  type: 'logo-flip';
  axis?: 'x' | 'y' | 'both';
  flips?: number;
}

/**
 * Logo reveal configuration
 */
export interface LogoRevealConfig extends AnimationConfig {
  type: 'logo-reveal';
  direction?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  style?: 'wipe' | 'fade' | 'slide';
}

// ============================================
// UNION TYPES
// ============================================

/**
 * All animation configurations
 */
export type AnyAnimationConfig =
  | CircularLoaderConfig
  | SquareLoaderConfig
  | BarLoaderConfig
  | DotsLoaderConfig
  | SpinnerLoaderConfig
  | BadgeConfig
  | PulseConfig
  | BlinkConfig
  | StatusDotConfig
  | ProgressRingConfig
  | WaveConfig
  | RippleConfig
  | ParticlesConfig
  | ConfettiConfig
  | GlowConfig
  | ShimmerConfig
  | MorphConfig
  | LogoSpinConfig
  | LogoScaleConfig
  | LogoBounceConfig
  | LogoFlipConfig
  | LogoRevealConfig;

// ============================================
// ENGINE TYPES
// ============================================

/**
 * Favicon engine options
 */
export interface FaviconEngineOptions {
  /** Canvas size (default: 32) */
  size?: number;
  
  /** Enable device pixel ratio scaling */
  enableHiDPI?: boolean;
  
  /** Background color */
  backgroundColor?: Color;
  
  /** Enable performance monitoring */
  monitoring?: boolean;
  
  /** Target FPS (default: 60) */
  targetFPS?: number;
  
  /** Enable reduced motion */
  reducedMotion?: boolean;
}

/**
 * Render context
 */
export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  size: number;
  time: number;
  deltaTime: number;
  progress: number;
}

/**
 * Animation instance
 */
export interface AnimationInstance {
  id: string;
  config: AnyAnimationConfig;
  state: AnimationState;
  startTime: number;
  currentTime: number;
  progress: number;
  loopCount: number;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  droppedFrames: number;
  memoryUsage?: number;
}

// ============================================
// GENERATOR TYPES
// ============================================

/**
 * Animation generator options
 */
export interface GeneratorOptions {
  /** Canvas size */
  size?: number;
  
  /** Color scheme */
  colors?: {
    primary: Color;
    secondary?: Color;
    accent?: Color;
  };
  
  /** Animation style */
  style?: 'minimal' | 'modern' | 'playful' | 'professional';
  
  /** Speed preset */
  speed?: 'slow' | 'normal' | 'fast';
}

/**
 * Preset definition
 */
export interface Preset {
  name: string;
  description: string;
  config: AnyAnimationConfig;
  preview?: string;
  tags?: string[];
}

/**
 * Animation sequence
 */
export interface AnimationSequence {
  animations: AnyAnimationConfig[];
  transitions?: {
    from: number;
    to: number;
    duration: number;
    easing?: EasingFunction;
  }[];
}

// ============================================
// REACT TYPES
// ============================================

/**
 * React hook options
 */
export interface UseFaviconOptions extends FaviconEngineOptions {
  /** Auto-start on mount */
  autoStart?: boolean;
  
  /** Cleanup on unmount */
  cleanup?: boolean;
}

/**
 * Favicon context value
 */
export interface FaviconContextValue {
  /** Play an animation */
  play: (config: AnyAnimationConfig) => void;
  
  /** Stop current animation */
  stop: () => void;
  
  /** Pause current animation */
  pause: () => void;
  
  /** Resume paused animation */
  resume: () => void;
  
  /** Get current state */
  getState: () => AnimationState;
  
  /** Get performance metrics */
  getMetrics: () => PerformanceMetrics;
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Required fields
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Optional fields
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Extract animation type
 */
export type ExtractAnimationType<T extends AnyAnimationConfig> = T['type'];