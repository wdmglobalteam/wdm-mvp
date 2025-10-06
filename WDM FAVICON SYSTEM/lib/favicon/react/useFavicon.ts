/**
 * WDM Favicon React Hook
 * 
 * React hook for controlling favicon animations in Next.js/React apps.
 * Provides a clean API for playing animations and managing state.
 * 
 * @module useFavicon
 */

import { useEffect, useRef, useCallback } from 'react';
import { FaviconEngine } from '../core/FaviconEngine';
import { getAnimation } from '../animations';
import type { 
  AnyAnimationConfig, 
  AnimationState, 
  PerformanceMetrics,
  UseFaviconOptions 
} from '../core/types';

/**
 * React hook for favicon animations
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const favicon = useFavicon();
 *   
 *   const handleUpload = async () => {
 *     favicon.play({
 *       type: 'circular-loader',
 *       duration: 2000,
 *       loop: true
 *     });
 *     
 *     await uploadFile();
 *     
 *     favicon.play({
 *       type: 'confetti',
 *       duration: 1500
 *     });
 *   };
 * }
 * ```
 */
export function useFavicon(options: UseFaviconOptions = {}) {
  const engineRef = useRef<FaviconEngine | null>(null);
  const mountedRef = useRef(false);
  
  // Initialize engine
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    mountedRef.current = true;
    
    // Create engine
    engineRef.current = new FaviconEngine({
      size: options.size || 32,
      enableHiDPI: options.enableHiDPI !== false,
      backgroundColor: options.backgroundColor || 'transparent',
      monitoring: options.monitoring || false,
      targetFPS: options.targetFPS || 60,
      reducedMotion: options.reducedMotion || false
    });
    
    // Register all animations
    const animations = getAnimation as any;
    Object.entries(animations.ANIMATION_REGISTRY || {}).forEach(([type, animationFn]) => {
      if (engineRef.current) {
        engineRef.current.registerAnimation(type, (ctx) => {
          if (!engineRef.current) return;
          const config = (engineRef.current as any).currentAnimation?.config;
          if (config) {
            (animationFn as any)(ctx, config);
          }
        });
      }
    });
    
    // Cleanup
    return () => {
      mountedRef.current = false;
      if (options.cleanup !== false && engineRef.current) {
        engineRef.current.destroy();
      }
    };
  }, []);
  
  /**
   * Play an animation
   */
  const play = useCallback((config: AnyAnimationConfig) => {
    if (!engineRef.current || !mountedRef.current) return;
    engineRef.current.play(config);
  }, []);
  
  /**
   * Stop current animation
   */
  const stop = useCallback(() => {
    if (!engineRef.current || !mountedRef.current) return;
    engineRef.current.stop();
  }, []);
  
  /**
   * Pause current animation
   */
  const pause = useCallback(() => {
    if (!engineRef.current || !mountedRef.current) return;
    engineRef.current.pause();
  }, []);
  
  /**
   * Resume paused animation
   */
  const resume = useCallback(() => {
    if (!engineRef.current || !mountedRef.current) return;
    engineRef.current.resume();
  }, []);
  
  /**
   * Get current state
   */
  const getState = useCallback((): AnimationState => {
    if (!engineRef.current || !mountedRef.current) return 'idle';
    return engineRef.current.getState();
  }, []);
  
  /**
   * Get performance metrics
   */
  const getMetrics = useCallback((): PerformanceMetrics => {
    if (!engineRef.current || !mountedRef.current) {
      return { fps: 0, frameTime: 0, droppedFrames: 0 };
    }
    return engineRef.current.getMetrics();
  }, []);
  
  /**
   * Convenience methods for common animations
   */
  const showLoading = useCallback((options?: { style?: 'circular' | 'square' | 'spinner' }) => {
    const style = options?.style || 'circular';
    const typeMap = {
      circular: 'circular-loader',
      square: 'square-loader',
      spinner: 'spinner-loader'
    };
    
    play({
      type: typeMap[style] as any,
      name: 'loading',
      duration: 2000,
      loop: true
    });
  }, [play]);
  
  const showSuccess = useCallback((options?: { style?: 'confetti' | 'pulse' | 'glow' }) => {
    const style = options?.style || 'confetti';
    
    play({
      type: style as any,
      name: 'success',
      duration: 1500
    });
  }, [play]);
  
  const showError = useCallback(() => {
    play({
      type: 'blink',
      name: 'error',
      duration: 600,
      color: '#FF4B4B'
    });
  }, [play]);
  
  const showNotification = useCallback((count: number) => {
    play({
      type: 'badge',
      name: 'notification',
      duration: 300,
      count,
      animate: 'pop'
    });
  }, [play]);
  
  return {
    // Core methods
    play,
    stop,
    pause,
    resume,
    getState,
    getMetrics,
    
    // Convenience methods
    showLoading,
    showSuccess,
    showError,
    showNotification
  };
}

/**
 * Hook return type
 */
export type UseFaviconReturn = ReturnType<typeof useFavicon>;