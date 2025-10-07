/**
 * WDM COMPASS ENGINE - CORE RENDERING SYSTEM
 *
 * Main animation engine with support for:
 * - 80+ animations across 8 categories
 * - Physics simulation
 * - Particle systems
 * - Personality/humanoid modes
 * - Interactive behaviors
 * - Performance monitoring
 *
 * @version 3.0.0
 * @module CompassEngine
 */

/**
 * WDM COMPASS ENGINE - FIXED COMPLETE VERSION
 *
 * @version 3.0.0-FINAL
 */

import type {
	CompassEngineOptions,
	AnyAnimationConfig,
	AnimationState,
	RenderContext,
	CompassElement,
	PersonalityState,
	PhysicsWorld,
	ParticleEmitter,
	PerformanceMetrics,
	Point,
	Particle,
} from './types';

import { AnimationScheduler } from './AnimationScheduler';
import { CanvasRenderer } from './CanvasRenderer';
import { PersonalityEngine } from './PersonalityEngine';
import { PhysicsEngine } from './PhysicsEngine';
import type { Color } from '../core/types';

const DEFAULT_OPTIONS: Required<CompassEngineOptions> = {
	size: 160,
	enableHiDPI: true,
	backgroundColor: 'transparent',
	primaryColor: '#0B63FF',
	accentColor: '#FFB400',
	neutralColor: '#0F1724',
	enablePhysics: true,
	enableParticles: true,
	enablePersonality: true,
	enableInteractive: true,
	targetFPS: 60,
	reducedMotion: false,
	maxParticles: 200,
	seed: 1337,
};

export class CompassEngine {
	private options: Required<CompassEngineOptions>;
	private canvas: HTMLCanvasElement;
	private renderer: CanvasRenderer;
	private scheduler: AnimationScheduler;
	private personalityEngine?: PersonalityEngine;
	private physicsEngine?: PhysicsEngine;

	private currentAnimation: {
		config: AnyAnimationConfig;
		state: AnimationState;
		startTime: number;
		pauseTime?: number;
		loopIndex?: number;
	} | null = null;

	private compassState: CompassElement;
	private personalityState?: PersonalityState;
	private physicsWorld?: PhysicsWorld;
	private particleEmitters: ParticleEmitter[] = [];

	private inputState = {
		mouse: { x: 0, y: 0 },
		clicks: [] as Point[],
		touches: [] as Point[],
		scroll: { x: 0, y: 0 },
	};

	private performanceMetrics: PerformanceMetrics = {
		fps: 0,
		frameTime: 0,
		droppedFrames: 0,
		particleCount: 0,
		physicsBodyCount: 0,
	};

	private frameCount = 0;
	private lastFrameTime = 0;
	private startTime = 0;
	private emitterCleanupInterval: number | null = null;
	private animationFunction: ((ctx: RenderContext) => void) | null = null;

	constructor(options: CompassEngineOptions = {}) {
		this.options = { ...DEFAULT_OPTIONS, ...options };

		if (typeof window !== 'undefined' && window.matchMedia) {
			const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			if (prefersReducedMotion) {
				this.options.reducedMotion = true;
			}
		}

		this.canvas = this.createCanvas();

		try {
			this.renderer = new CanvasRenderer(this.canvas, {
				size: this.options.size,
				enableHiDPI: this.options.enableHiDPI,
				backgroundColor: this.options.backgroundColor,
			});
		} catch (error) {
			console.error('[CompassEngine] Failed to initialize renderer:', error);
			throw error;
		}

		this.scheduler = new AnimationScheduler({
			targetFPS: this.options.targetFPS,
			onFrame: this.onFrame.bind(this),
			monitoring: true,
			adaptiveThrottling: true,
			backgroundThrottling: true,
		});

		if (this.options.enablePersonality) {
			this.personalityEngine = new PersonalityEngine(this.options.size);
		}

		if (this.options.enablePhysics) {
			this.physicsEngine = new PhysicsEngine({
				size: this.options.size,
				gravity: { x: 0, y: 0.5 },
			});
			this.physicsWorld = this.physicsEngine.getWorld();
		}

		this.compassState = this.createDefaultCompassState();

		if (this.options.enableInteractive) {
			this.setupInputListeners();
		}

		this.setupEmitterCleanup();
		this.renderInitialFrame();
	}

	private createCanvas(): HTMLCanvasElement {
		const canvas = document.createElement('canvas');
		const scale = this.options.enableHiDPI ? window.devicePixelRatio || 1 : 1;

		canvas.width = this.options.size * scale;
		canvas.height = this.options.size * scale;
		canvas.style.width = `${this.options.size}px`;
		canvas.style.height = `${this.options.size}px`;

		return canvas;
	}

	private createDefaultCompassState(): CompassElement {
		const size = this.options.size;
		const center = size / 2;

		return {
			rim: {
				type: 'circle',
				size: size * 0.7,
				position: { x: center, y: center },
				rotation: 0,
				scale: { x: 1, y: 1 },
				opacity: 1,
				color: this.options.primaryColor,
				gradient: {
					type: 'radial',
					stops: [
						{ offset: 0, color: this.options.primaryColor },
						{ offset: 0.85, color: this.options.primaryColor },
						{ offset: 1, color: this.options.primaryColor },
					],
				},
				strokeWidth: 0,
			},
			innerCircle: {
				type: 'circle',
				size: size * 0.35,
				position: { x: center, y: center },
				rotation: 0,
				scale: { x: 1, y: 1 },
				opacity: 1,
				color: this.options.neutralColor,
			},
			needle: {
				length: size * 0.35,
				width: size * 0.15,
				angle: -45,
				color: this.options.accentColor,
				glowIntensity: 0,
			},
			pivot: {
				radius: size * 0.025,
				color: this.options.neutralColor,
				strokeColor: this.options.accentColor,
				strokeWidth: size * 0.00938,
			},
			glassOverlay: {
				visible: true,
				opacity: 0.4,
			},
		};
	}

	private setupInputListeners(): void {
		if (typeof window === 'undefined') return;

		const mouseTimeout: number | null = null;
		window.addEventListener('mousemove', (e) => {
			if (mouseTimeout) clearTimeout(mouseTimeout);

			const rect = this.canvas.getBoundingClientRect();
			this.inputState.mouse = {
				x: (e.clientX - rect.left) * (this.options.size / rect.width),
				y: (e.clientY - rect.top) * (this.options.size / rect.height),
			};
		});

		window.addEventListener('click', (e) => {
			const rect = this.canvas.getBoundingClientRect();
			this.inputState.clicks.push({
				x: (e.clientX - rect.left) * (this.options.size / rect.width),
				y: (e.clientY - rect.top) * (this.options.size / rect.height),
			});

			if (this.inputState.clicks.length > 5) {
				this.inputState.clicks.shift();
			}

			setTimeout(() => {
				this.inputState.clicks = [];
			}, 500);
		});

		window.addEventListener('touchmove', (e) => {
			const rect = this.canvas.getBoundingClientRect();
			this.inputState.touches = Array.from(e.touches).map((touch) => ({
				x: (touch.clientX - rect.left) * (this.options.size / rect.width),
				y: (touch.clientY - rect.top) * (this.options.size / rect.height),
			}));
		});

		window.addEventListener('touchend', () => {
			this.inputState.touches = [];
		});

		let scrollTimeout: number | null = null;
		window.addEventListener('scroll', () => {
			if (scrollTimeout) clearTimeout(scrollTimeout);

			scrollTimeout = window.setTimeout(() => {
				this.inputState.scroll = {
					x: window.scrollX,
					y: window.scrollY,
				};
			}, 16);
		});
	}

	private setupEmitterCleanup(): void {
		if (typeof window === 'undefined') return;

		this.emitterCleanupInterval = window.setInterval(() => {
			this.particleEmitters = this.particleEmitters.filter((emitter) => {
				if (emitter.particles.length === 0 && !emitter.active) {
					return false;
				}
				return true;
			});
		}, 5000);
	}

	private onFrame(time: number, deltaTime: number): void {
		if (!this.currentAnimation) return;

		const { config, startTime, state } = this.currentAnimation;

		if (state === 'paused') return;

		const elapsed = time - startTime;
		const duration = config.duration;
		let progress = Math.min(elapsed / duration, 1);

		if (config.easing) {
			progress = this.applyEasing(config.easing, progress);
		}

		const ctx: RenderContext = {
			ctx: this.renderer.getContext(),
			canvas: this.canvas,
			size: this.options.size,
			time,
			deltaTime,
			progress,
			state: {
				compass: this.compassState,
				personality: this.personalityState,
				physics: this.physicsWorld,
				emitters: this.particleEmitters,
			},
			input: this.inputState,
		};

		if (this.options.enablePhysics && this.physicsWorld && this.physicsEngine) {
			try {
				this.physicsEngine.update(deltaTime / 1000);
			} catch (error) {
				console.error('[CompassEngine] Physics update error:', error);
			}
		}

		if (this.options.enableParticles) {
			try {
				this.updateParticles(deltaTime);
			} catch (error) {
				console.error('[CompassEngine] Particle update error:', error);
			}
		}

		if (this.options.enablePersonality && this.personalityState && this.personalityEngine) {
			try {
				this.personalityEngine.update(this.personalityState, deltaTime, ctx);
			} catch (error) {
				console.error('[CompassEngine] Personality update error:', error);
			}
		}

		this.renderer.clear(this.options.backgroundColor);

		try {
			if (this.animationFunction) {
				this.animationFunction(ctx);
			}
		} catch (error) {
			console.error('[CompassEngine] Animation execution error:', error);
		}

		this.renderCompass(ctx);

		if (
			this.personalityState &&
			this.personalityState.mode === 'humanoid' &&
			this.personalityEngine
		) {
			try {
				this.personalityEngine.render(ctx, this.personalityState);
			} catch (error) {
				console.error('[CompassEngine] Personality render error:', error);
			}
		}

		if (this.options.enableParticles) {
			try {
				this.renderParticles(ctx);
			} catch (error) {
				console.error('[CompassEngine] Particle render error:', error);
			}
		}

		if (config.onUpdate) {
			try {
				config.onUpdate(progress);
			} catch (error) {
				console.error('[CompassEngine] onUpdate callback error:', error);
			}
		}

		if (progress >= 1) {
			this.handleAnimationComplete();
		}

		this.trackPerformance(time, deltaTime);
		this.lastFrameTime = time;
	}

	private applyEasing(easing: string | ((t: number) => number), progress: number): number {
		if (typeof easing === 'function') {
			return easing(progress);
		}

		// Basic easing functions inline
		const easings: Record<string, (t: number) => number> = {
			linear: (t) => t,
			easeInQuad: (t) => t * t,
			easeOutQuad: (t) => t * (2 - t),
			easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
			easeInCubic: (t) => t * t * t,
			easeOutCubic: (t) => --t * t * t + 1,
			easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
		};

		return easings[easing as string]?.(progress) ?? progress;
	}

	private updateParticles(deltaTime: number): void {
		const maxParticles = this.options.maxParticles;
		let totalParticles = 0;

		this.particleEmitters.forEach((emitter) => {
			if (!emitter.active && emitter.particles.length === 0) return;

			emitter.particles = emitter.particles.filter((particle) => {
				particle.life -= deltaTime;
				if (particle.life <= 0) return false;

				particle.velocity.x += particle.acceleration.x * deltaTime * 0.001;
				particle.velocity.y += particle.acceleration.y * deltaTime * 0.001;
				particle.position.x += particle.velocity.x * deltaTime * 0.001;
				particle.position.y += particle.velocity.y * deltaTime * 0.001;

				if (emitter.config.gravity) {
					particle.velocity.x += emitter.config.gravity.x * deltaTime * 0.001;
					particle.velocity.y += emitter.config.gravity.y * deltaTime * 0.001;
				}

				if (emitter.config.friction) {
					const frictionFactor = Math.pow(1 - emitter.config.friction, deltaTime * 0.001);
					particle.velocity.x *= frictionFactor;
					particle.velocity.y *= frictionFactor;
				}

				particle.rotation += particle.rotationSpeed * deltaTime * 0.001;

				if (emitter.config.fadeOut) {
					particle.opacity = particle.life / particle.maxLife;
				}

				if (emitter.config.trail && particle.trail) {
					particle.trail.push({ x: particle.position.x, y: particle.position.y });
					if (particle.trail.length > 10) {
						particle.trail.shift();
					}
				}

				return true;
			});

			totalParticles += emitter.particles.length;

			if (emitter.active && totalParticles < maxParticles) {
				const particlesToEmit = Math.floor(emitter.rate * deltaTime * 0.001);
				for (let i = 0; i < particlesToEmit; i++) {
					if (totalParticles >= maxParticles) break;
					if (emitter.particles.length >= emitter.maxParticles) break;

					emitter.particles.push(this.createParticle(emitter));
					totalParticles++;
				}
			}
		});

		this.performanceMetrics.particleCount = totalParticles;
	}

	private createParticle(emitter: ParticleEmitter): Particle {
		const cfg = emitter.config;
		const angle = this.random(cfg.angle.min, cfg.angle.max);
		const velocity = this.random(cfg.velocity.min, cfg.velocity.max);
		const size = this.random(cfg.size.min, cfg.size.max);
		const life = this.random(cfg.lifespan.min, cfg.lifespan.max);

		return {
			id: `particle-${Date.now()}-${Math.random()}`,
			position: { ...emitter.position },
			velocity: {
				x: Math.cos(angle) * velocity,
				y: Math.sin(angle) * velocity,
			},
			acceleration: { x: 0, y: 0 },
			life,
			maxLife: life,
			size,
			color: cfg.colors[Math.floor(Math.random() * cfg.colors.length)],
			rotation: Math.random() * Math.PI * 2,
			rotationSpeed: (Math.random() - 0.5) * Math.PI,
			opacity: 1,
			shape: cfg.shapes[Math.floor(Math.random() * cfg.shapes.length)],
			trail: cfg.trail ? [] : undefined,
		};
	}

	private random(min: number, max: number): number {
		return min + Math.random() * (max - min);
	}

	private parseColor(color: string | Color): string {
		if (typeof color === 'string') return color;
		const { r, g, b, a = 1 } = color;
		return `rgba(${r}, ${g}, ${b}, ${a})`;
	}

	private renderCompass(ctx: RenderContext): void {
		const canvas = ctx.ctx;
		const state = this.compassState;
		const size = this.options.size;

		canvas.save();
		canvas.translate(state.rim.position.x, state.rim.position.y);
		canvas.rotate(state.rim.rotation);
		canvas.scale(state.rim.scale.x, state.rim.scale.y);
		canvas.globalAlpha = state.rim.opacity;

		if (state.rim.gradient) {
			const gradient =
				state.rim.gradient.type === 'radial'
					? canvas.createRadialGradient(0, 0, 0, 0, 0, state.rim.size / 2)
					: canvas.createLinearGradient(-state.rim.size / 2, 0, state.rim.size / 2, 0);

			state.rim.gradient.stops.forEach((stop) => {
				gradient.addColorStop(stop.offset, this.parseColor(stop.color));
			});
			canvas.fillStyle = gradient;
		} else {
			canvas.fillStyle = this.parseColor(state.rim.color!);
		}

		canvas.beginPath();
		canvas.arc(0, 0, state.rim.size / 2, 0, Math.PI * 2);
		canvas.fill();
		canvas.restore();

		canvas.save();
		canvas.translate(state.innerCircle.position.x, state.innerCircle.position.y);
		canvas.globalAlpha = state.innerCircle.opacity;
		canvas.fillStyle = this.parseColor(state.innerCircle.color!);
		canvas.beginPath();
		canvas.arc(0, 0, state.innerCircle.size / 2, 0, Math.PI * 2);
		canvas.fill();
		canvas.restore();

		if (state.glassOverlay?.visible) {
			canvas.save();
			canvas.globalAlpha = state.glassOverlay.opacity;
			const glassGradient = canvas.createLinearGradient(0, 0, 0, size);
			glassGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
			glassGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
			glassGradient.addColorStop(1, 'rgba(255, 255, 255, 0.3)');
			canvas.fillStyle = glassGradient;
			canvas.beginPath();
			canvas.ellipse(size / 2, size * 0.375, size * 0.3125, size * 0.1875, 0, 0, Math.PI * 2);
			canvas.fill();
			canvas.restore();
		}

		canvas.save();
		canvas.translate(size / 2, size / 2);
		canvas.rotate((state.needle.angle * Math.PI) / 180);

		if (state.needle.glowIntensity > 0) {
			canvas.shadowColor = this.parseColor(state.needle.color);
			canvas.shadowBlur = state.needle.glowIntensity * 20;
		}

		canvas.fillStyle = this.parseColor(state.needle.color);
		canvas.beginPath();
		canvas.moveTo(0, 0);
		canvas.lineTo(state.needle.length, -state.needle.length);
		canvas.lineTo(state.needle.length * 0.7, -state.needle.length * 0.3);
		canvas.closePath();
		canvas.fill();
		canvas.restore();

		canvas.save();
		canvas.translate(size / 2, size / 2);
		canvas.fillStyle = this.parseColor(state.pivot.color);
		canvas.strokeStyle = this.parseColor(state.pivot.strokeColor!);
		canvas.lineWidth = state.pivot.strokeWidth!;
		canvas.beginPath();
		canvas.arc(0, 0, state.pivot.radius, 0, Math.PI * 2);
		canvas.fill();
		canvas.stroke();
		canvas.restore();
	}

	private renderParticles(ctx: RenderContext): void {
		const canvas = ctx.ctx;

		this.particleEmitters.forEach((emitter) => {
			emitter.particles.forEach((particle) => {
				canvas.save();
				canvas.translate(particle.position.x, particle.position.y);
				canvas.rotate(particle.rotation);
				canvas.globalAlpha = particle.opacity;

				if (particle.trail && particle.trail.length > 1) {
					canvas.strokeStyle = this.parseColor(particle.color);
					canvas.lineWidth = particle.size * 0.5;
					canvas.globalAlpha = particle.opacity * 0.3;
					canvas.beginPath();
					canvas.moveTo(
						particle.trail[0].x - particle.position.x,
						particle.trail[0].y - particle.position.y
					);
					for (let i = 1; i < particle.trail.length; i++) {
						canvas.lineTo(
							particle.trail[i].x - particle.position.x,
							particle.trail[i].y - particle.position.y
						);
					}
					canvas.stroke();
					canvas.globalAlpha = particle.opacity;
				}

				canvas.fillStyle = this.parseColor(particle.color);

				switch (particle.shape) {
					case 'circle':
						canvas.beginPath();
						canvas.arc(0, 0, particle.size, 0, Math.PI * 2);
						canvas.fill();
						break;
					case 'square':
						canvas.fillRect(-particle.size, -particle.size, particle.size * 2, particle.size * 2);
						break;
					case 'triangle':
						canvas.beginPath();
						canvas.moveTo(0, -particle.size);
						canvas.lineTo(particle.size, particle.size);
						canvas.lineTo(-particle.size, particle.size);
						canvas.closePath();
						canvas.fill();
						break;
					case 'star':
						this.drawStar(canvas, 0, 0, 5, particle.size, particle.size * 0.5);
						break;
					case 'heart':
						this.drawHeart(canvas, 0, 0, particle.size);
						break;
					case 'sparkle':
						this.drawSparkle(canvas, 0, 0, particle.size);
						break;
				}

				canvas.restore();
			});
		});
	}

	private drawStar(
		ctx: CanvasRenderingContext2D,
		cx: number,
		cy: number,
		spikes: number,
		outer: number,
		inner: number
	): void {
		let rot = (Math.PI / 2) * 3;
		const step = Math.PI / spikes;

		ctx.beginPath();
		ctx.moveTo(cx, cy - outer);
		for (let i = 0; i < spikes; i++) {
			ctx.lineTo(cx + Math.cos(rot) * outer, cy + Math.sin(rot) * outer);
			rot += step;
			ctx.lineTo(cx + Math.cos(rot) * inner, cy + Math.sin(rot) * inner);
			rot += step;
		}
		ctx.lineTo(cx, cy - outer);
		ctx.closePath();
		ctx.fill();
	}

	private drawHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
		ctx.beginPath();
		ctx.moveTo(cx, cy + size * 0.3);
		ctx.bezierCurveTo(cx, cy, cx - size, cy - size * 0.5, cx - size, cy - size);
		ctx.bezierCurveTo(cx - size, cy - size * 1.5, cx, cy - size * 1.3, cx, cy - size * 0.5);
		ctx.bezierCurveTo(cx, cy - size * 1.3, cx + size, cy - size * 1.5, cx + size, cy - size);
		ctx.bezierCurveTo(cx + size, cy - size * 0.5, cx, cy, cx, cy + size * 0.3);
		ctx.closePath();
		ctx.fill();
	}

	private drawSparkle(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
		ctx.beginPath();
		ctx.moveTo(cx, cy - size);
		ctx.lineTo(cx + size * 0.2, cy - size * 0.2);
		ctx.lineTo(cx + size, cy);
		ctx.lineTo(cx + size * 0.2, cy + size * 0.2);
		ctx.lineTo(cx, cy + size);
		ctx.lineTo(cx - size * 0.2, cy + size * 0.2);
		ctx.lineTo(cx - size, cy);
		ctx.lineTo(cx - size * 0.2, cy - size * 0.2);
		ctx.closePath();
		ctx.fill();
	}

	private handleAnimationComplete(): void {
		if (!this.currentAnimation) return;

		const { config } = this.currentAnimation;

		if (config.loop) {
			const loopCount = config.loopCount || Infinity;
			const currentLoop = this.currentAnimation.loopIndex || 0;

			if (currentLoop < loopCount - 1) {
				this.currentAnimation.startTime = performance.now();
				this.currentAnimation.loopIndex = currentLoop + 1;
				return;
			}
		}

		this.currentAnimation.state = 'completed';

		if (config.onComplete) {
			try {
				config.onComplete();
			} catch (error) {
				console.error('[CompassEngine] onComplete callback error:', error);
			}
		}

		this.stop();
	}

	private trackPerformance(time: number, deltaTime: number): void {
		this.frameCount++;
		const elapsed = time - this.startTime;

		if (elapsed > 0) {
			this.performanceMetrics.fps = Math.round((this.frameCount / elapsed) * 1000);
			this.performanceMetrics.frameTime = Math.round((elapsed / this.frameCount) * 100) / 100;
		}

		const expectedFrameTime = 1000 / this.options.targetFPS;
		if (deltaTime > expectedFrameTime * 1.5) {
			this.performanceMetrics.droppedFrames++;
		}

		if (this.physicsWorld) {
			this.performanceMetrics.physicsBodyCount = this.physicsWorld.bodies.size;
		}
	}

	private renderInitialFrame(): void {
		try {
			const ctx: RenderContext = {
				ctx: this.renderer.getContext(),
				canvas: this.canvas,
				size: this.options.size,
				time: 0,
				deltaTime: 0,
				progress: 0,
				state: {
					compass: this.compassState,
					personality: this.personalityState,
					physics: this.physicsWorld,
					emitters: this.particleEmitters,
				},
				input: this.inputState,
			};

			this.renderer.clear(this.options.backgroundColor);
			this.renderCompass(ctx);
		} catch (error) {
			console.error('[CompassEngine] Initial render failed:', error);
		}
	}

	// PUBLIC API

	public play(config: AnyAnimationConfig, animationFn?: (ctx: RenderContext) => void): void {
		if (this.currentAnimation) {
			this.stop();
		}

		this.animationFunction = animationFn || null;

		if (this.options.reducedMotion) {
			const ctx: RenderContext = {
				ctx: this.renderer.getContext(),
				canvas: this.canvas,
				size: this.options.size,
				time: 0,
				deltaTime: 0,
				progress: 1,
				state: {
					compass: this.compassState,
					personality: this.personalityState,
					physics: this.physicsWorld,
					emitters: this.particleEmitters,
				},
				input: this.inputState,
			};

			this.renderer.clear(this.options.backgroundColor);

			if (this.animationFunction) {
				try {
					this.animationFunction(ctx);
				} catch (error) {
					console.error('[CompassEngine] Reduced motion frame error:', error);
				}
			}

			this.renderCompass(ctx);
			return;
		}

		this.currentAnimation = {
			config,
			state: 'playing',
			startTime: performance.now() + (config.delay || 0),
		};

		this.startTime = performance.now();
		this.frameCount = 0;
		this.performanceMetrics.droppedFrames = 0;

		if (config.onStart) {
			try {
				config.onStart();
			} catch (error) {
				console.error('[CompassEngine] onStart callback error:', error);
			}
		}

		this.scheduler.start();
	}

	public stop(): void {
		if (this.currentAnimation) {
			this.currentAnimation.state = 'completed';
			this.currentAnimation = null;
		}

		this.scheduler.stop();
		this.animationFunction = null;

		this.particleEmitters.forEach((emitter) => {
			emitter.active = false;
		});

		this.renderInitialFrame();
	}

	public pause(): void {
		if (this.currentAnimation && this.currentAnimation.state === 'playing') {
			this.currentAnimation.state = 'paused';
			this.currentAnimation.pauseTime = performance.now();
			this.scheduler.pause();
		}
	}

	public resume(): void {
		if (
			this.currentAnimation &&
			this.currentAnimation.state === 'paused' &&
			this.currentAnimation.pauseTime
		) {
			const pauseDuration = performance.now() - this.currentAnimation.pauseTime;
			this.currentAnimation.startTime += pauseDuration;
			this.currentAnimation.state = 'playing';
			delete this.currentAnimation.pauseTime;
			this.scheduler.resume();
		}
	}

	public getState(): AnimationState {
		return this.currentAnimation?.state || 'idle';
	}

	public getMetrics(): PerformanceMetrics {
		return {
			...this.performanceMetrics,
			...this.scheduler.getStats(),
		};
	}

	public getCanvas(): HTMLCanvasElement {
		return this.canvas;
	}

	public getCompassState(): CompassElement {
		return { ...this.compassState };
	}

	public updateCompassState(updates: Partial<CompassElement>): void {
		this.compassState = { ...this.compassState, ...updates };
	}

	public createEmitter(config: Partial<ParticleEmitter>): string {
		const emitter: ParticleEmitter = {
			id: `emitter-${Date.now()}-${Math.random()}`,
			position: config.position || { x: this.options.size / 2, y: this.options.size / 2 },
			rate: config.rate || 10,
			active: true,
			particles: [],
			maxParticles: config.maxParticles || 100,
			config: config.config || {
				lifespan: { min: 500, max: 1500 },
				velocity: { min: 50, max: 150 },
				angle: { min: 0, max: Math.PI * 2 },
				size: { min: 2, max: 6 },
				colors: [this.options.primaryColor, this.options.accentColor],
				shapes: ['circle'],
				fadeOut: true,
			},
		};

		this.particleEmitters.push(emitter);
		return emitter.id;
	}

	public removeEmitter(id: string): void {
		this.particleEmitters = this.particleEmitters.filter((e) => e.id !== id);
	}

	public clearAllEmitters(): void {
		this.particleEmitters = [];
	}

	public enablePersonalityMode(): void {
		if (!this.personalityEngine) {
			this.personalityEngine = new PersonalityEngine(this.options.size);
		}
		if (!this.personalityState) {
			this.personalityState = this.personalityEngine.createHumanoidState();
		}
	}

	public disablePersonalityMode(): void {
		this.personalityState = undefined;
	}

	public getPersonalityState(): PersonalityState | undefined {
		return this.personalityState;
	}

	public destroy(): void {
		this.stop();

		if (this.emitterCleanupInterval !== null) {
			clearInterval(this.emitterCleanupInterval);
			this.emitterCleanupInterval = null;
		}

		this.particleEmitters = [];

		if (this.renderer) {
			this.renderer.destroy();
		}

		if (this.scheduler) {
			this.scheduler.destroy();
		}

		if (this.physicsEngine) {
			this.physicsEngine.clear();
		}
	}
}
