/**
 * CANVAS RENDERER - High-Performance Canvas Management
 *
 * Handles:
 * - HiDPI canvas setup
 * - Efficient clearing strategies
 * - Context state management
 * - Offscreen canvas support
 * - Memory optimization
 *
 * @version 3.0.0
 * @module CanvasRenderer
 */

export interface CanvasRendererOptions {
	size: number;
	enableHiDPI: boolean;
	backgroundColor: string | 'transparent';
}

export class CanvasRenderer {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private options: CanvasRendererOptions;
	private pixelRatio: number;
	private offscreenCanvas: HTMLCanvasElement | null = null;
	private offscreenCtx: CanvasRenderingContext2D | null = null;

	constructor(canvas: HTMLCanvasElement, options: CanvasRendererOptions) {
		this.canvas = canvas;
		this.options = options;
		this.pixelRatio = this.calculatePixelRatio();

		// Get 2D context with optimizations
		const ctx = canvas.getContext('2d', {
			alpha: options.backgroundColor === 'transparent',
			desynchronized: true, // Hint for better performance
			willReadFrequently: false,
		});

		if (!ctx) {
			throw new Error('Failed to get 2D rendering context');
		}

		this.ctx = ctx;
		this.setupCanvas();

		// Create offscreen canvas for double buffering (if supported)
		this.setupOffscreenCanvas();
	}

	/**
	 * Calculate pixel ratio for HiDPI displays
	 */
	private calculatePixelRatio(): number {
		if (!this.options.enableHiDPI) return 1;

		const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

		// Cap at 2x to balance quality and performance
		return Math.min(dpr, 2);
	}

	/**
	 * Setup canvas dimensions and styling
	 */
	private setupCanvas(): void {
		const { size } = this.options;
		const scaledSize = size * this.pixelRatio;

		// Set internal resolution
		this.canvas.width = scaledSize;
		this.canvas.height = scaledSize;

		// Set display size
		this.canvas.style.width = `${size}px`;
		this.canvas.style.height = `${size}px`;

		// Scale context to handle HiDPI
		if (this.pixelRatio !== 1) {
			this.ctx.scale(this.pixelRatio, this.pixelRatio);
		}

		// Set default context properties for better rendering
		this.ctx.imageSmoothingEnabled = true;
		this.ctx.imageSmoothingQuality = 'high';
	}

	/**
	 * Setup offscreen canvas for double buffering
	 */
	private setupOffscreenCanvas(): void {
		try {
			if (typeof OffscreenCanvas !== 'undefined') {
				// Use OffscreenCanvas if available (better performance)
				const offscreen = new OffscreenCanvas(this.canvas.width, this.canvas.height);
				this.offscreenCtx = offscreen.getContext('2d') as unknown as CanvasRenderingContext2D;
			} else {
				// Fallback to regular canvas
				this.offscreenCanvas = document.createElement('canvas');
				this.offscreenCanvas.width = this.canvas.width;
				this.offscreenCanvas.height = this.canvas.height;
				this.offscreenCtx = this.offscreenCanvas.getContext('2d');
			}
		} catch {
			// Offscreen canvas not supported, continue without it
			this.offscreenCtx = null;
		}
	}

	/**
	 * Clear canvas efficiently
	 */
	clear(color?: string): void {
		// const { size } = this.options;
		const bgColor = color || this.options.backgroundColor;

		// Save current context state
		this.ctx.save();

		// Reset transform to clear entire canvas
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);

		if (bgColor === 'transparent') {
			// Clear with transparency
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		} else {
			// Fill with solid color (faster than clearRect + fillRect)
			this.ctx.fillStyle = bgColor;
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		}

		// Restore context state
		this.ctx.restore();
	}

	/**
	 * Clear specific region (optimization for partial updates)
	 */
	clearRegion(x: number, y: number, width: number, height: number): void {
		this.ctx.clearRect(x, y, width, height);
	}

	/**
	 * Get main rendering context
	 */
	getContext(): CanvasRenderingContext2D {
		return this.ctx;
	}

	/**
	 * Get offscreen context for double buffering
	 */
	getOffscreenContext(): CanvasRenderingContext2D | null {
		return this.offscreenCtx;
	}

	/**
	 * Swap buffers (copy offscreen to main canvas)
	 */
	swapBuffers(): void {
		if (!this.offscreenCtx) return;

		this.ctx.save();
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);

		if (this.offscreenCanvas) {
			this.ctx.drawImage(this.offscreenCanvas, 0, 0);
		}

		this.ctx.restore();
	}

	/**
	 * Resize canvas (useful for responsive designs)
	 */
	resize(newSize: number): void {
		this.options.size = newSize;
		this.setupCanvas();

		// Resize offscreen canvas too
		if (this.offscreenCanvas) {
			this.offscreenCanvas.width = this.canvas.width;
			this.offscreenCanvas.height = this.canvas.height;
		}
	}

	/**
	 * Export canvas as data URL
	 */
	toDataURL(type: string = 'image/png', quality: number = 1.0): string {
		return this.canvas.toDataURL(type, quality);
	}

	/**
	 * Export canvas as Blob (async, more efficient)
	 */
	async toBlob(type: string = 'image/png', quality: number = 1.0): Promise<Blob> {
		return new Promise((resolve, reject) => {
			this.canvas.toBlob(
				(blob) => {
					if (blob) {
						resolve(blob);
					} else {
						reject(new Error('Failed to create blob'));
					}
				},
				type,
				quality
			);
		});
	}

	/**
	 * Save current context state (wrapper for consistency)
	 */
	save(): void {
		this.ctx.save();
	}

	/**
	 * Restore context state (wrapper for consistency)
	 */
	restore(): void {
		this.ctx.restore();
	}

	/**
	 * Set global alpha (wrapper with bounds checking)
	 */
	setGlobalAlpha(alpha: number): void {
		this.ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
	}

	/**
	 * Set composite operation (wrapper)
	 */
	setCompositeOperation(operation: GlobalCompositeOperation): void {
		this.ctx.globalCompositeOperation = operation;
	}

	/**
	 * Check if point is in current path
	 */
	isPointInPath(x: number, y: number): boolean {
		return this.ctx.isPointInPath(x, y);
	}

	/**
	 * Get pixel data for region (use sparingly - slow)
	 */
	getImageData(x: number, y: number, width: number, height: number): ImageData {
		return this.ctx.getImageData(x, y, width, height);
	}

	/**
	 * Put pixel data (use sparingly - slow)
	 */
	putImageData(imageData: ImageData, x: number, y: number): void {
		this.ctx.putImageData(imageData, x, y);
	}

	/**
	 * Get canvas element
	 */
	getCanvas(): HTMLCanvasElement {
		return this.canvas;
	}

	/**
	 * Get current pixel ratio
	 */
	getPixelRatio(): number {
		return this.pixelRatio;
	}

	/**
	 * Get actual canvas size (accounting for pixel ratio)
	 */
	getActualSize(): { width: number; height: number } {
		return {
			width: this.canvas.width,
			height: this.canvas.height,
		};
	}

	/**
	 * Get logical size (what user sees)
	 */
	getLogicalSize(): { width: number; height: number } {
		return {
			width: this.options.size,
			height: this.options.size,
		};
	}

	/**
	 * Cleanup and destroy
	 */
	destroy(): void {
		// Clear canvas
		this.clear();

		// Remove from DOM if attached
		if (this.canvas.parentNode) {
			this.canvas.parentNode.removeChild(this.canvas);
		}

		// Clear offscreen canvas
		if (this.offscreenCanvas) {
			this.offscreenCanvas.width = 0;
			this.offscreenCanvas.height = 0;
			this.offscreenCanvas = null;
		}

		this.offscreenCtx = null;
	}

	/**
	 * Reset all transformations
	 */
	resetTransform(): void {
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		if (this.pixelRatio !== 1) {
			this.ctx.scale(this.pixelRatio, this.pixelRatio);
		}
	}

	/**
	 * Apply clipping region
	 */
	clip(): void {
		this.ctx.clip();
	}

	/**
	 * Begin path (wrapper for consistency)
	 */
	beginPath(): void {
		this.ctx.beginPath();
	}

	/**
	 * Close path (wrapper for consistency)
	 */
	closePath(): void {
		this.ctx.closePath();
	}

	/**
	 * Fill current path (wrapper for consistency)
	 */
	fill(): void {
		this.ctx.fill();
	}

	/**
	 * Stroke current path (wrapper for consistency)
	 */
	stroke(): void {
		this.ctx.stroke();
	}
}
