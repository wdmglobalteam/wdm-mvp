export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  
  constructor(private canvas: HTMLCanvasElement, private options: any) {
    this.ctx = canvas.getContext('2d')!;
  }
  
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }
  
  clear(color: string): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (color !== 'transparent') {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}