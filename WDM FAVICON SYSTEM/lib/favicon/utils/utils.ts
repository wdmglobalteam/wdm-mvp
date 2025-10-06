export function parseColor(color: any): string {
  if (typeof color === 'string') return color;
  const { r, g, b, a = 1 } = color;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function interpolateColor(from: string, to: string, progress: number): string {
  return from; // Simplified
}