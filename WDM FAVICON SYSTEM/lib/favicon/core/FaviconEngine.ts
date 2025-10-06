/**
 * WDM Favicon Animation Engine
 * 
 * Core engine that manages favicon rendering, animation scheduling,
 * and state management. Handles canvas operations and browser favicon updates.
 * 
 * @module FaviconEngine
 */

import type {
  FaviconEngineOptions,
  AnyAnimationConfig,
  AnimationState,
  AnimationInstance,
  RenderContext,
  PerformanceMetrics,
  Color
} from './types';

import { AnimationScheduler } from './AnimationScheduler';
import { CanvasRenderer } from './CanvasRenderer';
import { parseColor } from '../utils/color';

/**
 * Default engine options
 */
const DEFAULT_OPTIONS: Required<FaviconEngineOptions> = {
  size: 32,
  enableHiDPI: true,
  backgroundColor: 'transparent',
  monitoring: false,
  targetFPS: 60,
  reducedMotion: false
};

/**
 * Main favicon animation engine
 */
export class FaviconEngine {
  private options: Required<FaviconEngineOptions>;
  private canvas: HTMLCanvasElement;
  private renderer: CanvasRenderer;
  private scheduler: AnimationScheduler;
  private faviconLink: HTMLLinkElement;
  
  private currentAnimation: AnimationInstance | null = null;
  private animationCallbacks: Map<string, (ctx: RenderContext) => void> = new Map();
  
  private startTime: number = 0;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private droppedFrames: number = 0;
  
  /**
   * Create a new favicon engine
   */
  constructor(options: FaviconEngineOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    
    // Check for reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        this.options.reducedMotion = true;
      }
    }
    
    // Create canvas
    this.canvas = this.createCanvas();
    
    // Initialize renderer
    this.renderer = new CanvasRenderer(this.canvas, this.options);
    
    // Initialize scheduler
    this.scheduler = new AnimationScheduler({
      targetFPS: this.options.targetFPS,
      onFrame: this.onFrame.bind(this),
      monitoring: this.options.monitoring
    });
    
    // Get or create favicon link
    this.faviconLink = this.getFaviconLink();
    
    // Initialize with transparent background
    this.renderer.clear(this.options.backgroundColor);
    this.updateFavicon();
  }
  
  /**
   * Create and configure canvas element
   */
  private createCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const scale = this.options.enableHiDPI ? (window.devicePixelRatio || 1) : 1;
    
    canvas.width = this.options.size * scale;
    canvas.height = this.options.size * scale;
    
    // Apply CSS size
    canvas.style.width = `${this.options.size}px`;
    canvas.style.height = `${this.options.size}px`;
    
    return canvas;
  }
  
  /**
   * Get or create favicon link element
   */
  private getFaviconLink(): HTMLLinkElement {
    let link = document.querySelector('link[rel*="icon"]') as HTMLLinkElement;
    
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      document.head.appendChild(link);
    }
    
    return link;
  }
  
  /**
   * Frame callback from scheduler
   */
  private onFrame(time: number, deltaTime: number): void {
    if (!this.currentAnimation) return;
    
    const { config, startTime } = this.currentAnimation;
    const elapsed = time - startTime;
    const duration = config.duration;
    
    // Calculate progress
    let progress = Math.min(elapsed / duration, 1);
    
    // Apply easing
    if (config.easing) {
      const easingFn = typeof config.easing === 'function' 
        ? config.easing 
        : this.getEasingFunction(config.easing);
      progress = easingFn(progress);
    }
    
    // Update instance
    this.currentAnimation.currentTime = time;
    this.currentAnimation.progress = progress;
    
    // Create render context
    const ctx: RenderContext = {
      ctx: this.renderer.getContext(),
      canvas: this.canvas,
      size: this.options.size,
      time,
      deltaTime,
      progress
    };
    
    // Clear canvas
    this.renderer.clear(this.options.backgroundColor);
    
    // Execute animation callback
    const callback = this.animationCallbacks.get(config.type);
    if (callback) {
      callback(ctx);
    }
    
    // Update favicon
    this.updateFavicon();
    
    // Handle completion
    if (progress >= 1) {
      this.handleAnimationComplete();
    }
    
    // Performance monitoring
    if (this.options.monitoring) {
      this.trackPerformance(time, deltaTime);
    }
  }
  
  /**
   * Handle animation completion
   */
  private handleAnimationComplete(): void {
    if (!this.currentAnimation) return;
    
    const { config } = this.currentAnimation;
    
    // Handle looping
    if (config.loop) {
      const loopCount = config.loopCount || Infinity;
      this.currentAnimation.loopCount++;
      
      if (this.currentAnimation.loopCount < loopCount) {
        // Restart animation
        this.currentAnimation.startTime = performance.now();
        this.currentAnimation.progress = 0;
        return;
      }
    }
    
    // Handle auto-reverse
    if (config.autoReverse && this.currentAnimation.loopCount < 2) {
      // Reverse and continue
      this.currentAnimation.loopCount++;
      this.currentAnimation.startTime = performance.now();
      // TODO: Implement reverse logic
    }
    
    // Animation complete
    this.currentAnimation.state = 'completed';
    
    if (config.onComplete) {
      config.onComplete();
    }
    
    this.stop();
  }
  
  /**
   * Update favicon with current canvas content
   */
  private updateFavicon(): void {
    const dataURL = this.canvas.toDataURL('image/png');
    this.faviconLink.href = dataURL;
  }
  
  /**
   * Track performance metrics
   */
  private trackPerformance(time: number, deltaTime: number): void {
    this.frameCount++;
    
    // Check for dropped frames
    const expectedFrameTime = 1000 / this.options.targetFPS;
    if (deltaTime > expectedFrameTime * 1.5) {
      this.droppedFrames++;
    }
    
    this.lastFrameTime = time;
  }
  
  /**
   * Get easing function by name
   */
  private getEasingFunction(name: string): (t: number) => number {
    // Import easing functions dynamically
    const { Easing } = require('../utils/easing');
    return Easing[name as keyof typeof Easing] || Easing.linear;
  }
  
  /**
   * Register an animation callback
   */
  public registerAnimation(
    type: string,
    callback: (ctx: RenderContext) => void
  ): void {
    this.animationCallbacks.set(type, callback);
  }
  
  /**
   * Play an animation
   */
  public play(config: AnyAnimationConfig): void {
    // Stop current animation
    if (this.currentAnimation) {
      this.stop();
    }
    
    // Handle reduced motion
    if (this.options.reducedMotion) {
      // Show final frame only
      const ctx: RenderContext = {
        ctx: this.renderer.getContext(),
        canvas: this.canvas,
        size: this.options.size,
        time: 0,
        deltaTime: 0,
        progress: 1
      };
      
      this.renderer.clear(this.options.backgroundColor);
      const callback = this.animationCallbacks.get(config.type);
      if (callback) {
        callback(ctx);
      }
      this.updateFavicon();
      return;
    }
    
    // Create animation instance
    this.currentAnimation = {
      id: this.generateId(),
      config,
      state: 'running',
      startTime: performance.now() + (config.delay || 0),
      currentTime: 0,
      progress: 0,
      loopCount: 0
    };
    
    // Call onStart callback
    if (config.onStart) {
      config.onStart();
    }
    
    // Start scheduler
    this.scheduler.start();
  }
  
  /**
   * Stop current animation
   */
  public stop(): void {
    if (this.currentAnimation) {
      this.currentAnimation.state = 'completed';
      this.currentAnimation = null;
    }
    
    this.scheduler.stop();
    
    // Clear canvas
    this.renderer.clear(this.options.backgroundColor);
    this.updateFavicon();
  }
  
  /**
   * Pause current animation
   */
  public pause(): void {
    if (this.currentAnimation) {
      this.currentAnimation.state = 'paused';
      this.scheduler.stop();
    }
  }
  
  /**
   * Resume paused animation
   */
  public resume(): void {
    if (this.currentAnimation && this.currentAnimation.state === 'paused') {
      this.currentAnimation.state = 'running';
      this.currentAnimation.startTime = performance.now() - 
        (this.currentAnimation.currentTime - this.currentAnimation.startTime);
      this.scheduler.start();
    }
  }
  
  /**
   * Get current animation state
   */
  public getState(): AnimationState {
    return this.currentAnimation?.state || 'idle';
  }
  
  /**
   * Get performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    const elapsed = this.lastFrameTime - this.startTime;
    const fps = elapsed > 0 ? (this.frameCount / elapsed) * 1000 : 0;
    const avgFrameTime = elapsed / this.frameCount;
    
    return {
      fps: Math.round(fps),
      frameTime: Math.round(avgFrameTime * 100) / 100,
      droppedFrames: this.droppedFrames,
      memoryUsage: (performance as any).memory?.usedJSHeapSize
    };
  }
  
  /**
   * Get canvas renderer
   */
  public getRenderer(): CanvasRenderer {
    return this.renderer;
  }
  
  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Destroy engine and cleanup
   */
  public destroy(): void {
    this.stop();
    this.animationCallbacks.clear();
    
    // Reset favicon
    this.faviconLink.href = '';
  }
}