/**
 * ANIMATION SCHEDULER - Advanced RAF-based Frame Management
 *
 * Features:
 * - Adaptive FPS throttling
 * - Frame time smoothing
 * - Performance monitoring
 * - Graceful degradation
 * - Background tab handling
 *
 * @version 3.0.0
 * @module AnimationScheduler
 */

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

export class AnimationScheduler {
	private rafId: number | null = null;
	private lastTime = 0;
	private options: Required<SchedulerOptions>;
	private running = false;

	// Performance monitoring
	private frameTimes: number[] = [];
	private frameTimeWindow = 60; // Track last 60 frames
	private droppedFrames = 0;
	private totalFrames = 0;
	private startTime = 0;

	// Adaptive throttling
	private targetFrameTime: number;
	private consecutiveSlowFrames = 0;
	private throttleLevel = 1; // 1 = no throttle, 2 = half speed, etc.

	// Background tab detection
	private isBackgroundTab = false;
	private backgroundFPS = 4; // Reduce to 4 FPS in background

	// Error handling
	private consecutiveErrors = 0;
	private maxConsecutiveErrors = 5;

	constructor(options: SchedulerOptions) {
		this.options = {
			adaptiveThrottling: true,
			backgroundThrottling: true,
			...options,
		};

		this.targetFrameTime = 1000 / this.options.targetFPS;
		this.setupVisibilityListener();
	}

	/**
	 * Setup listener for tab visibility changes
	 */
	private setupVisibilityListener(): void {
		if (typeof document === 'undefined') return;

		const handleVisibilityChange = () => {
			this.isBackgroundTab = document.hidden;

			if (this.options.backgroundThrottling) {
				// Restart scheduler with new settings when tab visibility changes
				if (this.running) {
					this.stop();
					this.start();
				}
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);
	}

	/**
	 * Start animation loop
	 */
	start(): void {
		if (this.rafId !== null) return;

		this.running = true;
		this.lastTime = performance.now();
		this.startTime = this.lastTime;
		this.consecutiveErrors = 0;

		const animate = (time: number) => {
			if (!this.running) return;

			try {
				const deltaTime = time - this.lastTime;

				// Throttle based on target FPS and background state
				const effectiveFrameTime =
					this.isBackgroundTab && this.options.backgroundThrottling
						? 1000 / this.backgroundFPS
						: this.targetFrameTime * this.throttleLevel;

				if (deltaTime >= effectiveFrameTime - 1) {
					// -1ms tolerance
					// Record frame time for monitoring
					if (this.options.monitoring) {
						this.recordFrameTime(deltaTime);
					}

					// Detect dropped frames
					if (deltaTime > this.targetFrameTime * 1.5) {
						this.droppedFrames++;
						this.consecutiveSlowFrames++;
					} else {
						this.consecutiveSlowFrames = 0;
					}

					// Adaptive throttling
					if (this.options.adaptiveThrottling) {
						this.adjustThrottling();
					}

					// Call frame callback with error handling
					try {
						this.options.onFrame(time, deltaTime);
						this.consecutiveErrors = 0; // Reset on success
					} catch (error) {
						this.handleFrameError(error);
					}

					this.lastTime = time;
					this.totalFrames++;
				}

				this.rafId = requestAnimationFrame(animate);
			} catch (error) {
				this.handleSchedulerError(error);
			}
		};

		this.rafId = requestAnimationFrame(animate);
	}

	/**
	 * Stop animation loop
	 */
	stop(): void {
		if (this.rafId !== null) {
			cancelAnimationFrame(this.rafId);
			this.rafId = null;
		}
		this.running = false;
	}

	/**
	 * Pause (same as stop but semantically different)
	 */
	pause(): void {
		this.stop();
	}

	/**
	 * Resume after pause
	 */
	resume(): void {
		if (!this.running) {
			this.start();
		}
	}

	/**
	 * Record frame time for performance monitoring
	 */
	private recordFrameTime(deltaTime: number): void {
		this.frameTimes.push(deltaTime);

		// Keep only recent frames
		if (this.frameTimes.length > this.frameTimeWindow) {
			this.frameTimes.shift();
		}
	}

	/**
	 * Adjust throttling based on performance
	 */
	private adjustThrottling(): void {
		// If we have 5+ consecutive slow frames, increase throttle
		if (this.consecutiveSlowFrames >= 5) {
			this.throttleLevel = Math.min(this.throttleLevel * 1.5, 4);
			this.consecutiveSlowFrames = 0;

			if (this.options.monitoring) {
				console.warn(
					`[Scheduler] Performance degraded. Throttling to ${Math.round(this.options.targetFPS / this.throttleLevel)} FPS`
				);
			}
		}

		// If performance is good for a while, try reducing throttle
		if (this.totalFrames % 300 === 0 && this.throttleLevel > 1) {
			const avgFrameTime = this.getAverageFrameTime();
			if (avgFrameTime < this.targetFrameTime * 0.8) {
				this.throttleLevel = Math.max(this.throttleLevel / 1.5, 1);

				if (this.options.monitoring) {
					console.log(
						`[Scheduler] Performance improved. Reducing throttle to ${Math.round(this.options.targetFPS / this.throttleLevel)} FPS`
					);
				}
			}
		}
	}

	/**
	 * Handle errors in frame callback
	 */
	private handleFrameError(error: unknown): void {
		this.consecutiveErrors++;

		console.error('[Scheduler] Error in frame callback:', error);

		// Stop if too many consecutive errors (potential infinite loop)
		if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
			console.error(
				`[Scheduler] ${this.maxConsecutiveErrors} consecutive errors. Stopping scheduler.`
			);
			this.stop();
		}
	}

	/**
	 * Handle errors in scheduler itself
	 */
	private handleSchedulerError(error: unknown): void {
		console.error('[Scheduler] Critical scheduler error:', error);
		this.stop();
	}

	/**
	 * Get performance statistics
	 */
	getStats(): PerformanceStats {
		const avgFrameTime = this.getAverageFrameTime();
		const minFrameTime = this.frameTimes.length > 0 ? Math.min(...this.frameTimes) : 0;
		const maxFrameTime = this.frameTimes.length > 0 ? Math.max(...this.frameTimes) : 0;

		const fps = avgFrameTime > 0 ? 1000 / avgFrameTime : 0;

		return {
			fps: Math.round(fps),
			avgFrameTime: Math.round(avgFrameTime * 100) / 100,
			minFrameTime: Math.round(minFrameTime * 100) / 100,
			maxFrameTime: Math.round(maxFrameTime * 100) / 100,
			droppedFrames: this.droppedFrames,
			totalFrames: this.totalFrames,
		};
	}

	/**
	 * Calculate average frame time
	 */
	private getAverageFrameTime(): number {
		if (this.frameTimes.length === 0) return 0;

		const sum = this.frameTimes.reduce((a, b) => a + b, 0);
		return sum / this.frameTimes.length;
	}

	/**
	 * Get current FPS
	 */
	getCurrentFPS(): number {
		const avgFrameTime = this.getAverageFrameTime();
		return avgFrameTime > 0 ? Math.round(1000 / avgFrameTime) : 0;
	}

	/**
	 * Check if scheduler is running
	 */
	isRunning(): boolean {
		return this.running;
	}

	/**
	 * Get target FPS
	 */
	getTargetFPS(): number {
		return this.options.targetFPS;
	}

	/**
	 * Set target FPS (will take effect on next start)
	 */
	setTargetFPS(fps: number): void {
		this.options.targetFPS = Math.max(1, Math.min(fps, 120));
		this.targetFrameTime = 1000 / this.options.targetFPS;
	}

	/**
	 * Get elapsed time since start
	 */
	getElapsedTime(): number {
		return this.lastTime - this.startTime;
	}

	/**
	 * Reset statistics
	 */
	resetStats(): void {
		this.frameTimes = [];
		this.droppedFrames = 0;
		this.totalFrames = 0;
		this.consecutiveSlowFrames = 0;
		this.throttleLevel = 1;
	}

	/**
	 * Enable/disable monitoring
	 */
	setMonitoring(enabled: boolean): void {
		this.options.monitoring = enabled;
	}

	/**
	 * Enable/disable adaptive throttling
	 */
	setAdaptiveThrottling(enabled: boolean): void {
		this.options.adaptiveThrottling = enabled;
		if (!enabled) {
			this.throttleLevel = 1;
		}
	}

	/**
	 * Get current throttle level
	 */
	getThrottleLevel(): number {
		return this.throttleLevel;
	}

	/**
	 * Check if running in background
	 */
	isBackground(): boolean {
		return this.isBackgroundTab;
	}

	/**
	 * Force throttle level (for testing or manual control)
	 */
	setThrottleLevel(level: number): void {
		this.throttleLevel = Math.max(1, Math.min(level, 4));
	}

	/**
	 * Cleanup and destroy
	 */
	destroy(): void {
		this.stop();
		this.resetStats();
	}
}
