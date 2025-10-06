      case 'bottom':
        canvas.translate(0, size * (1 - progress));
        break;
      case 'left':
        canvas.translate(-size * (1 - progress), 0);
        break;
      case 'right':
        canvas.translate(size * (1 - progress), 0);
        break;
    }
    
    drawWDMCompass(canvas, size);
    canvas.restore();
  }
}

/**
 * Draw WDM compass logo
 */
function drawWDMCompass(canvas: CanvasRenderingContext2D, size: number): void {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.4375;
  
  // Rim gradient
  const gradient = canvas.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
  gradient.addColorStop(0, '#0B63FF');
  gradient.addColorStop(1, 'rgba(11, 99, 255, 0.8)');
  
  // Draw rim
  canvas.fillStyle = gradient;
  canvas.beginPath();
  canvas.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  canvas.fill();
  
  // Inner circle
  canvas.fillStyle = '#0F1724';
  canvas.beginPath();
  canvas.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI);
  canvas.fill();
  
  // Needle
  canvas.fillStyle = '#FFB400';
  canvas.beginPath();
  canvas.moveTo(centerX, centerY);
  canvas.lineTo(centerX + radius * 0.6, centerY - radius * 0.6);
  canvas.lineTo(centerX + radius * 0.4, centerY - radius * 0.2);
  canvas.closePath();
  canvas.fill();
  
  // Pivot
  canvas.fillStyle = '#0F1724';
  canvas.strokeStyle = '#FFB400';
  canvas.lineWidth = size * 0.01563;
  canvas.beginPath();
  canvas.arc(centerX, centerY, radius * 0.1071, 0, 2 * Math.PI);
  canvas.fill();
  canvas.stroke();
}

// ============================================
// ANIMATION REGISTRY
// ============================================

/**
 * Map of all available animations
 */
export const ANIMATION_REGISTRY = {
  // Loaders
  'circular-loader': circularLoader,
  'square-loader': squareLoader,
  'bar-loader': barLoader,
  'dots-loader': dotsLoader,
  'spinner-loader': spinnerLoader,
  'skeleton-loader': skeletonLoader,
  
  // Indicators
  'badge': badge,
  'pulse': pulse,
  'blink': blink,
  'status-dot': statusDot,
  'progress-ring': progressRing,
  
  // Effects
  'wave': wave,
  'ripple': ripple,
  'particles': particles,
  'confetti': confetti,
  'glow': glow,
  'shimmer': shimmer,
  'morph': morph,
  
  // Branding
  'logo-spin': logoSpin,
  'logo-scale': logoScale,
  'logo-bounce': logoBounce,
  'logo-flip': logoFlip,
  'logo-reveal': logoReveal
} as const;

/**
 * Get animation function by type
 */
export function getAnimation(type: string): ((ctx: RenderContext, options: any) => void) | null {
  return ANIMATION_REGISTRY[type as keyof typeof ANIMATION_REGISTRY] || null;
}/**
 * Bar progress loader
 */
export function barLoader(ctx: RenderContext, options: {
  width?: number;
  height?: number;
  color?: Color;
  backgroundColor?: Color;
  direction?: 'horizontal' | 'vertical';
}): void {
  const { ctx: canvas, size, progress } = ctx;
  const width = options.width || size * 0.8;
  const height = options.height || size * 0.15;
  const color = parseColor(options.color || '#0B63FF');
  const bgColor = parseColor(options.backgroundColor || 'rgba(11, 99, 255, 0.2)');
  const direction = options.direction || 'horizontal';
  
  const x = (size - width) / 2;
  const y = (size - height) / 2;
  
  // Background
  canvas.fillStyle = bgColor;
  canvas.fillRect(x, y, width, height);
  
  // Progress
  canvas.fillStyle = color;
  if (direction === 'horizontal') {
    canvas.fillRect(x, y, width * progress, height);
  } else {
    const progressHeight = height * progress;
    canvas.fillRect(x, y + height - progressHeight, width, progressHeight);
  }
}

/**
 * Animated dots loader (wave pattern)
 */
export function dotsLoader(ctx: RenderContext, options: {
  dotCount?: number;
  dotSize?: number;
  spacing?: number;
  color?: Color;
  pattern?: 'wave' | 'pulse' | 'bounce';
}): void {
  const { ctx: canvas, size, progress, time } = ctx;
  const dotCount = options.dotCount || 5;
  const dotSize = options.dotSize || size * 0.125;
  const spacing = options.spacing || size * 0.15;
  const color = parseColor(options.color || '#0B63FF');
  const pattern = options.pattern || 'wave';
  
  const totalWidth = (dotCount - 1) * spacing;
  const startX = (size - totalWidth) / 2;
  const centerY = size / 2;
  
  for (let i = 0; i < dotCount; i++) {
    const x = startX + i * spacing;
    let y = centerY;
    let alpha = 1;
    let scale = 1;
    
    const phase = (time * 0.003 + i * 0.2) % 1;
    
    switch (pattern) {
      case 'wave':
        y = centerY + Math.sin(phase * Math.PI * 2) * size * 0.15;
        break;
      case 'pulse':
        scale = 0.5 + Math.sin(phase * Math.PI * 2) * 0.5;
        break;
      case 'bounce':
        const bounceProgress = Math.abs(Math.sin(phase * Math.PI));
        y = centerY - bounceProgress * size * 0.2;
        break;
    }
    
    canvas.fillStyle = color;
    canvas.globalAlpha = alpha;
    canvas.beginPath();
    canvas.arc(x, y, dotSize * scale, 0, 2 * Math.PI);
    canvas.fill();
  }
  
  canvas.globalAlpha = 1;
}

/**
 * Rotating spinner loader
 */
export function spinnerLoader(ctx: RenderContext, options: {
  radius?: number;
  lineWidth?: number;
  color?: Color;
  segments?: number;
}): void {
  const { ctx: canvas, size, time } = ctx;
  const radius = options.radius || size * 0.375;
  const lineWidth = options.lineWidth || size * 0.0938;
  const color = parseColor(options.color || '#0B63FF');
  const segments = options.segments || 8;
  
  const centerX = size / 2;
  const centerY = size / 2;
  const rotation = (time * 0.002) % (2 * Math.PI);
  
  for (let i = 0; i < segments; i++) {
    const angle = rotation + (i * 2 * Math.PI / segments);
    const alpha = 1 - (i / segments);
    
    const x1 = centerX + Math.cos(angle) * radius * 0.6;
    const y1 = centerY + Math.sin(angle) * radius * 0.6;
    const x2 = centerX + Math.cos(angle) * radius;
    const y2 = centerY + Math.sin(angle) * radius;
    
    canvas.strokeStyle = color;
    canvas.globalAlpha = alpha;
    canvas.lineWidth = lineWidth;
    canvas.lineCap = 'round';
    canvas.beginPath();
    canvas.moveTo(x1, y1);
    canvas.lineTo(x2, y2);
    canvas.stroke();
  }
  
  canvas.globalAlpha = 1;
}

/**
 * Skeleton shimmer loader
 */
export function skeletonLoader(ctx: RenderContext, options: {
  color?: Color;
  shimmerColor?: Color;
}): void {
  const { ctx: canvas, size, time } = ctx;
  const color = parseColor(options.color || 'rgba(11, 99, 255, 0.2)');
  const shimmerColor = parseColor(options.shimmerColor || 'rgba(11, 99, 255, 0.4)');
  
  // Background
  canvas.fillStyle = color;
  canvas.fillRect(0, 0, size, size);
  
  // Shimmer effect
  const shimmerPos = ((time * 0.001) % 2) - 0.5;
  const gradient = canvas.createLinearGradient(
    size * shimmerPos - size * 0.5,
    0,
    size * shimmerPos + size * 0.5,
    0
  );
  
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(0.5, shimmerColor);
  gradient.addColorStop(1, 'transparent');
  
  canvas.fillStyle = gradient;
  canvas.fillRect(0, 0, size, size);
}

// ============================================
// INDICATOR ANIMATIONS (8)
// ============================================

/**
 * Notification badge
 */
export function badge(ctx: RenderContext, options: {
  count: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  backgroundColor?: Color;
  textColor?: Color;
  size?: number;
}): void {
  const { ctx: canvas, size: canvasSize } = ctx;
  const count = Math.min(options.count, 99);
  const displayText = count > 99 ? '99+' : count.toString();
  const badgeSize = options.size || canvasSize * 0.375;
  const bgColor = parseColor(options.backgroundColor || '#FF4B4B');
  const textColor = parseColor(options.textColor || '#FFFFFF');
  const position = options.position || 'top-right';
  
  let x = canvasSize * 0.75;
  let y = canvasSize * 0.25;
  
  switch (position) {
    case 'top-left':
      x = canvasSize * 0.25;
      y = canvasSize * 0.25;
      break;
    case 'bottom-right':
      x = canvasSize * 0.75;
      y = canvasSize * 0.75;
      break;
    case 'bottom-left':
      x = canvasSize * 0.25;
      y = canvasSize * 0.75;
      break;
  }
  
  // Badge circle
  canvas.fillStyle = bgColor;
  canvas.beginPath();
  canvas.arc(x, y, badgeSize, 0, 2 * Math.PI);
  canvas.fill();
  
  // Badge text
  canvas.fillStyle = textColor;
  canvas.font = `bold ${badgeSize * (count > 9 ? 0.7 : 0.9)}px Arial`;
  canvas.textAlign = 'center';
  canvas.textBaseline = 'middle';
  canvas.fillText(displayText, x, y);
}

/**
 * Pulse effect
 */
export function pulse(ctx: RenderContext, options: {
  minScale?: number;
  maxScale?: number;
  color?: Color;
  intensity?: number;
}): void {
  const { ctx: canvas, size, time } = ctx;
  const minScale = options.minScale || 0.85;
  const maxScale = options.maxScale || 1;
  const color = parseColor(options.color || '#0B63FF');
  const intensity = options.intensity || 1;
  
  const pulsePhase = (Math.sin(time * 0.003) + 1) / 2;
  const scale = minScale + (maxScale - minScale) * pulsePhase;
  const alpha = 0.5 + pulsePhase * 0.5;
  
  canvas.save();
  canvas.translate(size / 2, size / 2);
  canvas.scale(scale, scale);
  canvas.translate(-size / 2, -size / 2);
  
  canvas.globalAlpha = alpha;
  canvas.fillStyle = color;
  canvas.beginPath();
  canvas.arc(size / 2, size / 2, size * 0.4, 0, 2 * Math.PI);
  canvas.fill();
  
  canvas.restore();
}

/**
 * Blinking indicator
 */
export function blink(ctx: RenderContext, options: {
  onDuration?: number;
  offDuration?: number;
  color?: Color;
}): void {
  const { ctx: canvas, size, time } = ctx;
  const onDuration = options.onDuration || 500;
  const offDuration = options.offDuration || 500;
  const color = parseColor(options.color || '#0B63FF');
  
  const cycle = onDuration + offDuration;
  const phase = (time % cycle) / cycle;
  const isOn = phase < (onDuration / cycle);
  
  if (isOn) {
    canvas.fillStyle = color;
    canvas.beginPath();
    canvas.arc(size / 2, size / 2, size * 0.4, 0, 2 * Math.PI);
    canvas.fill();
  }
}

/**
 * Status dot indicator
 */
export function statusDot(ctx: RenderContext, options: {
  status: 'online' | 'offline' | 'away' | 'busy';
  position?: 'top-right' | 'bottom-right';
  size?: number;
  pulse?: boolean;
}): void {
  const { ctx: canvas, size: canvasSize, time } = ctx;
  const dotSize = options.size || canvasSize * 0.25;
  const position = options.position || 'bottom-right';
  const shouldPulse = options.pulse !== false;
  
  const statusColors = {
    online: '#0BFF7F',
    offline: '#666666',
    away: '#FFB400',
    busy: '#FF4B4B'
  };
  
  const color = parseColor(statusColors[options.status]);
  
  let x = canvasSize * 0.75;
  let y = position === 'top-right' ? canvasSize * 0.25 : canvasSize * 0.75;
  
  let scale = 1;
  if (shouldPulse && options.status === 'online') {
    const pulsePhase = (Math.sin(time * 0.003) + 1) / 2;
    scale = 0.9 + pulsePhase * 0.1;
  }
  
  canvas.fillStyle = color;
  canvas.beginPath();
  canvas.arc(x, y, dotSize * scale, 0, 2 * Math.PI);
  canvas.fill();
}

/**
 * Progress ring with percentage
 */
export function progressRing(ctx: RenderContext, options: {
  progress: number;
  radius?: number;
  lineWidth?: number;
  color?: Color;
  backgroundColor?: Color;
  showPercentage?: boolean;
}): void {
  // Same as circularLoader but with explicit progress parameter
  circularLoader(ctx, {
    ...options,
    showPercentage: options.showPercentage !== false
  });
}

// ============================================
// VISUAL EFFECTS (12)
// ============================================

/**
 * Wave animation
 */
export function wave(ctx: RenderContext, options: {
  amplitude?: number;
  frequency?: number;
  speed?: number;
  color?: Color;
  lineWidth?: number;
}): void {
  const { ctx: canvas, size, time } = ctx;
  const amplitude = options.amplitude || size * 0.15;
  const frequency = options.frequency || 0.1;
  const speed = options.speed || 0.002;
  const color = parseColor(options.color || '#0B63FF');
  const lineWidth = options.lineWidth || size * 0.0625;
  
  const offset = time * speed;
  
  canvas.strokeStyle = color;
  canvas.lineWidth = lineWidth;
  canvas.beginPath();
  
  for (let x = 0; x <= size; x++) {
    const y = size / 2 + Math.sin((x * frequency) + offset) * amplitude;
    if (x === 0) {
      canvas.moveTo(x, y);
    } else {
      canvas.lineTo(x, y);
    }
  }
  
  canvas.stroke();
}

/**
 * Ripple effect
 */
export function ripple(ctx: RenderContext, options: {
  maxRadius?: number;
  color?: Color;
  lineWidth?: number;
  rippleCount?: number;
  speed?: number;
}): void {
  const { ctx: canvas, size, time } = ctx;
  const maxRadius = options.maxRadius || size * 0.45;
  const color = parseColor(options.color || '#0B63FF');
  const lineWidth = options.lineWidth || size * 0.0625;
  const rippleCount = options.rippleCount || 3;
  const speed = options.speed || 0.001;
  
  const centerX = size / 2;
  const centerY = size / 2;
  
  for (let i = 0; i < rippleCount; i++) {
    const phase = ((time * speed) + (i / rippleCount)) % 1;
    const radius = maxRadius * phase;
    const alpha = 1 - phase;
    
    canvas.strokeStyle = color;
    canvas.globalAlpha = alpha;
    canvas.lineWidth = lineWidth;
    canvas.beginPath();
    canvas.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    canvas.stroke();
  }
  
  canvas.globalAlpha = 1;
}

/**
 * Particle system
 */
export function particles(ctx: RenderContext, options: {
  particleCount?: number;
  particleSize?: number;
  colors?: Color[];
  velocity?: { min: number; max: number };
}): void {
  const { ctx: canvas, size, time } = ctx;
  const particleCount = options.particleCount || 20;
  const particleSize = options.particleSize || size * 0.0625;
  const colors = options.colors || ['#0B63FF', '#FFB400', '#0BFF7F'];
  const velocity = options.velocity || { min: 0.02, max: 0.05 };
  
  // Simple particle system (stateless, deterministic)
  for (let i = 0; i < particleCount; i++) {
    const seed = i * 12345;
    const phase = ((time * (velocity.min + (seed % 100) / 100 * (velocity.max - velocity.min)) * 0.001) + (seed % 1000) / 1000) % 1;
    
    const angle = (seed % 360) * Math.PI / 180;
    const distance = phase * size * 0.5;
    const x = size / 2 + Math.cos(angle) * distance;
    const y = size / 2 + Math.sin(angle) * distance;
    const alpha = 1 - phase;
    
    const color = parseColor(colors[i % colors.length]);
    canvas.fillStyle = color;
    canvas.globalAlpha = alpha;
    canvas.beginPath();
    canvas.arc(x, y, particleSize, 0, 2 * Math.PI);
    canvas.fill();
  }
  
  canvas.globalAlpha = 1;
}

/**
 * Confetti burst
 */
export function confetti(ctx: RenderContext, options: {
  particleCount?: number;
  colors?: Color[];
  spread?: number;
  velocity?: number;
  gravity?: number;
}): void {
  const { ctx: canvas, size, progress } = ctx;
  const particleCount = options.particleCount || 30;
  const colors = options.colors || ['#0B63FF', '#FFB400', '#FF4B4B', '#0BFF7F'];
  const spread = options.spread || Math.PI;
  const velocity = options.velocity || size * 0.5;
  const gravity = options.gravity || size * 0.3;
  
  const centerX = size / 2;
  const centerY = size / 2;
  
  for (let i = 0; i < particleCount; i++) {
    const seed = i * 54321;
    const angle = -Math.PI / 2 + (spread / 2) - (seed % 1000) / 1000 * spread;
    const vel = velocity * (0.5 + (seed % 500) / 1000);
    
    const x = centerX + Math.cos(angle) * vel * progress;
    const y = centerY + Math.sin(angle) * vel * progress + gravity * progress * progress;
    const rotation = (seed % 360) + progress * 720;
    const alpha = 1 - progress;
    
    const color = parseColor(colors[i % colors.length]);
    const shapeType = seed % 3;
    
    canvas.save();
    canvas.translate(x, y);
    canvas.rotate(rotation * Math.PI / 180);
    canvas.globalAlpha = alpha;
    canvas.fillStyle = color;
    
    const particleSize = size * 0.125;
    
    if (shapeType === 0) {
      // Square
      canvas.fillRect(-particleSize / 2, -particleSize / 2, particleSize, particleSize);
    } else if (shapeType === 1) {
      // Circle
      canvas.beginPath();
      canvas.arc(0, 0, particleSize / 2, 0, 2 * Math.PI);
      canvas.fill();
    } else {
      // Triangle
      canvas.beginPath();
      canvas.moveTo(0, -particleSize / 2);
      canvas.lineTo(particleSize / 2, particleSize / 2);
      canvas.lineTo(-particleSize / 2, particleSize / 2);
      canvas.closePath();
      canvas.fill();
    }
    
    canvas.restore();
  }
}

/**
 * Glow pulse
 */
export function glow(ctx: RenderContext, options: {
  color?: Color;
  intensity?: number;
  radius?: number;
  pulseSpeed?: number;
}): void {
  const { ctx: canvas, size, time } = ctx;
  const color = parseColor(options.color || '#0B63FF');
  const intensity = options.intensity || 0.8;
  const radius = options.radius || size * 0.4;
  const pulseSpeed = options.pulseSpeed || 0.002;
  
  const pulsePhase = (Math.sin(time * pulseSpeed) + 1) / 2;
  const glowRadius = radius * (0.8 + pulsePhase * 0.2);
  const alpha = intensity * (0.6 + pulsePhase * 0.4);
  
  const gradient = canvas.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, glowRadius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, 'transparent');
  
  canvas.globalAlpha = alpha;
  canvas.fillStyle = gradient;
  canvas.fillRect(0, 0, size, size);
  canvas.globalAlpha = 1;
}

/**
 * Shimmer effect
 */
export function shimmer(ctx: RenderContext, options: {
  angle?: number;
  width?: number;
  color?: Color;
  speed?: number;
}): void {
  const { ctx: canvas, size, time } = ctx;
  const angle = (options.angle || 45) * Math.PI / 180;
  const width = options.width || size * 0.3;
  const color = parseColor(options.color || 'rgba(255, 255, 255, 0.6)');
  const speed = options.speed || 0.001;
  
  const position = ((time * speed) % 2) - 0.5;
  const distance = size * 1.5 * position;
  
  const centerX = size / 2 + Math.cos(angle) * distance;
  const centerY = size / 2 + Math.sin(angle) * distance;
  
  const perpX = -Math.sin(angle);
  const perpY = Math.cos(angle);
  
  const gradient = canvas.createLinearGradient(
    centerX - perpX * width,
    centerY - perpY * width,
    centerX + perpX * width,
    centerY + perpY * width
  );
  
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(0.5, color);
  gradient.addColorStop(1, 'transparent');
  
  canvas.fillStyle = gradient;
  canvas.fillRect(0, 0, size, size);
}

/**
 * Shape morphing
 */
export function morph(ctx: RenderContext, options: {
  fromShape: 'circle' | 'square' | 'triangle' | 'star';
  toShape: 'circle' | 'square' | 'triangle' | 'star';
  color?: Color;
}): void {
  const { ctx: canvas, size, progress } = ctx;
  const color = parseColor(options.color || '#0B63FF');
  
  // Interpolate between shapes
  const shapeSize = size * 0.6;
  const centerX = size / 2;
  const centerY = size / 2;
  
  canvas.fillStyle = color;
  
  // Simple implementation: cross-fade between shapes
  const fromAlpha = 1 - progress;
  const toAlpha = progress;
  
  // Draw from shape
  canvas.globalAlpha = fromAlpha;
  drawShape(canvas, options.fromShape, centerX, centerY, shapeSize);
  
  // Draw to shape
  canvas.globalAlpha = toAlpha;
  drawShape(canvas, options.toShape, centerX, centerY, shapeSize);
  
  canvas.globalAlpha = 1;
}

function drawShape(canvas: CanvasRenderingContext2D, shape: string, x: number, y: number, size: number): void {
  canvas.beginPath();
  
  switch (shape) {
    case 'circle':
      canvas.arc(x, y, size / 2, 0, 2 * Math.PI);
      break;
    case 'square':
      canvas.rect(x - size / 2, y - size / 2, size, size);
      break;
    case 'triangle':
      canvas.moveTo(x, y - size / 2);
      canvas.lineTo(x + size / 2, y + size / 2);
      canvas.lineTo(x - size / 2, y + size / 2);
      canvas.closePath();
      break;
    case 'star':
      drawStar(canvas, x, y, 5, size / 2, size / 4);
      break;
  }
  
  canvas.fill();
}

function drawStar(canvas: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number): void {
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  canvas.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    canvas.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    canvas.lineTo(x, y);
    rot += step;
  }
  canvas.lineTo(cx, cy - outerRadius);
  canvas.closePath();
}

// ============================================
// BRANDING ANIMATIONS (5)
// ============================================

/**
 * Logo spin
 */
export function logoSpin(ctx: RenderContext, options: {
  speed?: number;
  direction?: 'clockwise' | 'counterclockwise';
  continuous?: boolean;
}): void {
  const { ctx: canvas, size, time, progress } = ctx;
  const speed = options.speed || 0.002;
  const direction = options.direction || 'clockwise';
  const continuous = options.continuous !== false;
  
  const rotation = continuous 
    ? (time * speed) % (2 * Math.PI)
    : progress * 2 * Math.PI;
  
  const actualRotation = direction === 'counterclockwise' ? -rotation : rotation;
  
  canvas.save();
  canvas.translate(size / 2, size / 2);
  canvas.rotate(actualRotation);
  canvas.translate(-size / 2, -size / 2);
  
  // Draw WDM compass logo
  drawWDMCompass(canvas, size);
  
  canvas.restore();
}

/**
 * Logo scale
 */
export function logoScale(ctx: RenderContext, options: {
  minScale?: number;
  maxScale?: number;
  pattern?: 'pulse' | 'bounce' | 'elastic';
}): void {
  const { ctx: canvas, size, progress } = ctx;
  const minScale = options.minScale || 0.8;
  const maxScale = options.maxScale || 1.2;
  const pattern = options.pattern || 'pulse';
  
  let scale = 1;
  
  switch (pattern) {
    case 'pulse':
      scale = minScale + (maxScale - minScale) * (Math.sin(progress * Math.PI * 2) + 1) / 2;
      break;
    case 'bounce':
      scale = minScale + (maxScale - minScale) * Math.abs(Math.sin(progress * Math.PI * 4));
      break;
    case 'elastic':
      const elasticProgress = progress < 0.5 ? progress * 2 : 2 - progress * 2;
      scale = minScale + (maxScale - minScale) * Easing.easeOutElastic(elasticProgress);
      break;
  }
  
  canvas.save();
  canvas.translate(size / 2, size / 2);
  canvas.scale(scale, scale);
  canvas.translate(-size / 2, -size / 2);
  
  drawWDMCompass(canvas, size);
  
  canvas.restore();
}

/**
 * Logo bounce
 */
export function logoBounce(ctx: RenderContext, options: {
  height?: number;
  bounces?: number;
  gravity?: number;
}): void {
  const { ctx: canvas, size, progress } = ctx;
  const height = options.height || size * 0.3;
  const bounces = options.bounces || 3;
  
  // Calculate bounce position
  const bounceProgress = (progress * bounces) % 1;
  const bounceHeight = height * Math.abs(Math.sin(bounceProgress * Math.PI)) * (1 - progress);
  
  canvas.save();
  canvas.translate(0, -bounceHeight);
  
  drawWDMCompass(canvas, size);
  
  canvas.restore();
}

/**
 * Logo flip
 */
export function logoFlip(ctx: RenderContext, options: {
  axis?: 'x' | 'y' | 'both';
  flips?: number;
}): void {
  const { ctx: canvas, size, progress } = ctx;
  const axis = options.axis || 'y';
  const flips = options.flips || 1;
  
  const angle = progress * Math.PI * 2 * flips;
  
  canvas.save();
  canvas.translate(size / 2, size / 2);
  
  if (axis === 'x' || axis === 'both') {
    canvas.scale(1, Math.cos(angle));
  }
  if (axis === 'y' || axis === 'both') {
    canvas.scale(Math.cos(angle), 1);
  }
  
  canvas.translate(-size / 2, -size / 2);
  
  drawWDMCompass(canvas, size);
  
  canvas.restore();
}

/**
 * Logo reveal
 */
export function logoReveal(ctx: RenderContext, options: {
  direction?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  style?: 'wipe' | 'fade' | 'slide';
}): void {
  const { ctx: canvas, size, progress } = ctx;
  const direction = options.direction || 'center';
  const style = options.style || 'wipe';
  
  if (style === 'fade') {
    canvas.globalAlpha = progress;
    drawWDMCompass(canvas, size);
    canvas.globalAlpha = 1;
  } else if (style === 'wipe') {
    canvas.save();
    
    // Create clipping region
    canvas.beginPath();
    switch (direction) {
      case 'top':
        canvas.rect(0, 0, size, size * progress);
        break;
      case 'bottom':
        canvas.rect(0, size * (1 - progress), size, size * progress);
        break;
      case 'left':
        canvas.rect(0, 0, size * progress, size);
        break;
      case 'right':
        canvas.rect(size * (1 - progress), 0, size * progress, size);
        break;
      case 'center':
        canvas.arc(size / 2, size / 2, size * progress / 2, 0, 2 * Math.PI);
        break;
    }
    canvas.clip();
    
    drawWDMCompass(canvas, size);
    
    canvas.restore();
  } else if (style === 'slide') {
    canvas.save();
    
    switch (direction) {
      case 'top':
        canvas.translate(0, -size * (1 - progress));
        break;
      case 'bottom':/**
 * WDM Favicon Animations - Complete Collection
 * 
 * 30+ production-ready favicon animations organized by category.
 * Each animation is a pure function that receives a RenderContext.
 * 
 * @module Animations
 */

import type { RenderContext, Color } from '../core/types';
import { parseColor, interpolateColor } from '../utils/color';
import { Easing } from '../utils/easing';

// ============================================
// LOADER ANIMATIONS (10)
// ============================================

/**
 * Circular progress loader
 */
export function circularLoader(ctx: RenderContext, options: {
  radius?: number;
  lineWidth?: number;
  color?: Color;
  backgroundColor?: Color;
  showPercentage?: boolean;
}): void {
  const { ctx: canvas, size, progress } = ctx;
  const radius = options.radius || size * 0.375;
  const lineWidth = options.lineWidth || size * 0.125;
  const color = parseColor(options.color || '#0B63FF');
  const bgColor = parseColor(options.backgroundColor || 'rgba(11, 99, 255, 0.2)');
  
  const centerX = size / 2;
  const centerY = size / 2;
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + (progress * 2 * Math.PI);
  
  // Background circle
  canvas.beginPath();
  canvas.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  canvas.strokeStyle = bgColor;
  canvas.lineWidth = lineWidth;
  canvas.stroke();
  
  // Progress arc
  canvas.beginPath();
  canvas.arc(centerX, centerY, radius, startAngle, endAngle);
  canvas.strokeStyle = color;
  canvas.lineWidth = lineWidth;
  canvas.lineCap = 'round';
  canvas.stroke();
  
  // Percentage text
  if (options.showPercentage) {
    const percentage = Math.round(progress * 100);
    canvas.fillStyle = color;
    canvas.font = `bold ${size * 0.3}px Arial`;
    canvas.textAlign = 'center';
    canvas.textBaseline = 'middle';
    canvas.fillText(`${percentage}`, centerX, centerY);
  }
}

/**
 * Square border progress loader
 */
export function squareLoader(ctx: RenderContext, options: {
  size?: number;
  lineWidth?: number;
  color?: Color;
  gradient?: boolean;
}): void {
  const { ctx: canvas, size: canvasSize, progress } = ctx;
  const squareSize = options.size || canvasSize * 0.75;
  const lineWidth = options.lineWidth || canvasSize * 0.0938;
  const color = parseColor(options.color || '#0B63FF');
  
  const padding = (canvasSize - squareSize) / 2;
  const perimeter = squareSize * 4;
  const currentLength = progress * perimeter;
  
  canvas.strokeStyle = color;
  canvas.lineWidth = lineWidth;
  canvas.lineCap = 'round';
  canvas.beginPath();
  
  // Calculate which sides to draw
  let remaining = currentLength;
  const corners = [
    { x: padding, y: padding },
    { x: padding + squareSize, y: padding },
    { x: padding + squareSize, y: padding + squareSize },
    { x: padding, y: padding + squareSize }
  ];
  
  for (let i = 0; i < 4 && remaining > 0; i++) {
    const start = corners[i];
    const end = corners[(i + 1) % 4];
    const sideLength = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    const drawLength = Math.min(remaining, sideLength);
    const ratio = drawLength / sideLength;
    
    const drawEnd = {
      x: start.x + (end.x - start.x) * ratio,
      y: start.y + (end.y - start.y) * ratio
    };
    
    if (i === 0) canvas.moveTo(start.x, start.y);
    canvas.lineTo(drawEnd.x, drawEnd.y);
    
    remaining -= drawLength;
  }
  
  canvas.stroke();
}

/**
 * Bar progress loader
 */
export function barLoader(ctx: RenderContext, options: {
  width?: number;
  height?: number;
  color?: Color;
  backgroundColor?: Color;
  direction?: 'horizontal' | 'vertical';
}): void {
  const { ctx: canvas, size, progress } = ctx;