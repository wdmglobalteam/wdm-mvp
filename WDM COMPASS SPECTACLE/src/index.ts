/**
 * WDM COMPASS LIVING SPECTACLE - MAIN ENTRY POINT
 *
 * @version 3.0.0-FINAL
 */

// ============================================
// CORE EXPORTS
// ============================================\\

import { CompassEngine as CompassEngineClass } from './core/CompassEngine';
import type { CompassEngineOptions } from './core/types';

export { CompassEngine } from './core/CompassEngine';
export { CanvasRenderer } from './core/CanvasRenderer';
export { AnimationScheduler } from './core/AnimationScheduler';
export { PersonalityEngine } from './core/PersonalityEngine';
export { PhysicsEngine } from './core/PhysicsEngine';
export { MorphEngine } from './core/MorphEngine';

// ============================================
// TYPE EXPORTS
// ============================================

export type {
	// Core types
	Point,
	Color,
	Size,
	Scale,
	AnimationCategory,
	AnimationState,
	EasingFunction,
	EasingName,

	// Animation types
	AnimationType,
	BasicAnimation,
	EmotionalAnimation,
	MorphingAnimation,
	PersonalityAnimation,
	PhysicsAnimation,
	SpectacularAnimation,
	TransitionAnimation,
	InteractiveAnimation,

	// Config types
	BaseAnimationConfig,
	BasicAnimationConfig,
	EmotionalConfig,
	PersonalityConfig,
	MorphingConfig,
	PhysicsConfig,
	SpectacularConfig,
	TransitionConfig,
	InteractiveConfig,
	AnyAnimationConfig,

	// Compass types
	CompassShape,
	CompassElement,
	Needle,
	Pivot,

	// Personality types
	PersonalityState,
	BodyPart,
	Expression,

	// Physics types
	PhysicsWorld,
	PhysicsBody,
	PhysicsConstraint,

	// Particle types
	Particle,
	ParticleEmitter,
	ParticleEmitterConfig,

	// Render types
	RenderContext,

	// Engine types
	CompassEngineOptions,

	// Performance types
	PerformanceMetrics,
	PerformanceStats,

	// Scheduler types
	SchedulerOptions,
} from './core/types';

// ============================================
// ANIMATION EXPORTS
// ============================================

export {
	getAnimation,
	getAllAnimationNames,
	getAnimationsByCategory,
	hasAnimation,
	getAnimationCount,
	ANIMATION_REGISTRY,
} from './animations';

export type { AnimationName } from './animations';

// ============================================
// REACT EXPORTS
// ============================================

export { useCompass, Compass, CompassProvider, CompassController } from './react';

export type {
	UseCompassReturn,
	CompassProps,
	CompassProviderProps,
	CompassControllerProps,
} from './react';

// ============================================
// METADATA
// ============================================

export const VERSION = '3.0.0';
export const TOTAL_ANIMATIONS = 80;

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

export function createCompass(options?: Partial<CompassEngineOptions>) {
	return new CompassEngineClass(options);
}
