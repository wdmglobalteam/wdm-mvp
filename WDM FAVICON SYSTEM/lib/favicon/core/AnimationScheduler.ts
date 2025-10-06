export class AnimationScheduler {
  private rafId: number | null = null;
  private lastTime = 0;
  
  constructor(private options: { targetFPS: number; onFrame: (time: number, delta: number) => void; monitoring: boolean }) {}
  
  start(): void {
    const animate = (time: number) => {
      const delta = time - this.lastTime;
      this.lastTime = time;
      this.options.onFrame(time, delta);
      this.rafId = requestAnimationFrame(animate);
    };
    this.rafId = requestAnimationFrame(animate);
  }
  
  stop(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}