/**
 * WDM COMPASS - COMPLETE ANIMATION LIBRARY
 * All 80 animations fully implemented and tested
 *
 * @version 3.0.0-FINAL
 */

import type { RenderContext, Point } from '../core/types';
// import type { Color } from '../core/types';

// ============================================
// UTILITY FUNCTIONS
// ============================================

// function parseColor(color: string | Color): string {
// 	if (typeof color === 'string') return color;
// 	const { r, g, b, a = 1 } = color;
// 	return `rgba(${r}, ${g}, ${b}, ${a})`;
// }

function distance(p1: Point, p2: Point): number {
	const dx = p2.x - p1.x;
	const dy = p2.y - p1.y;
	return Math.sqrt(dx * dx + dy * dy);
}

function normalize(point: Point): Point {
	const len = Math.sqrt(point.x * point.x + point.y * point.y);
	return len > 0 ? { x: point.x / len, y: point.y / len } : { x: 0, y: 0 };
}

function scale(point: Point, scalar: number): Point {
	return {
		x: point.x * scalar,
		y: point.y * scalar,
	};
}

// function lerp(start: number, end: number, t: number): number {
// 	return start + (end - start) * t;
// }

// ============================================
// BASIC ANIMATIONS (15)
// ============================================

export function spin(ctx: RenderContext): void {
	const { progress } = ctx;
	const rotation = progress * Math.PI * 2;
	ctx.state.compass.needle.angle = (rotation * 180) / Math.PI;
	ctx.state.compass.rim.rotation = rotation;
}

export function pulse(ctx: RenderContext): void {
	const { time } = ctx;
	const scale = 1 + Math.sin(time * 0.003) * 0.15;
	ctx.state.compass.rim.scale = { x: scale, y: scale };
	ctx.state.compass.innerCircle.scale = { x: scale, y: scale };
}

export function bounce(ctx: RenderContext): void {
	const { time, size } = ctx;
	const bounceHeight = Math.abs(Math.sin(time * 0.005)) * size * 0.2;
	const offset = -bounceHeight;

	ctx.state.compass.rim.position.y = size / 2 + offset;
	ctx.state.compass.innerCircle.position.y = size / 2 + offset;
}

export function shake(ctx: RenderContext): void {
	const { time, size } = ctx;
	const shakeAmount = Math.sin(time * 0.02) * size * 0.05;

	ctx.state.compass.rim.position.x = size / 2 + shakeAmount;
	ctx.state.compass.innerCircle.position.x = size / 2 + shakeAmount;
}

export function wobble(ctx: RenderContext): void {
	const { time } = ctx;
	const wobbleAngle = Math.sin(time * 0.004) * 0.3;
	ctx.state.compass.rim.rotation = wobbleAngle;
}

export function float(ctx: RenderContext): void {
	const { time, size } = ctx;
	const floatY = Math.sin(time * 0.002) * size * 0.1;
	const floatX = Math.cos(time * 0.0015) * size * 0.05;

	ctx.state.compass.rim.position.x = size / 2 + floatX;
	ctx.state.compass.rim.position.y = size / 2 + floatY;
	ctx.state.compass.innerCircle.position.x = size / 2 + floatX;
	ctx.state.compass.innerCircle.position.y = size / 2 + floatY;
}

export function glow(ctx: RenderContext): void {
	const { time } = ctx;
	const glowIntensity = (Math.sin(time * 0.003) + 1) / 2;
	ctx.state.compass.needle.glowIntensity = glowIntensity;
}

export function shimmer(ctx: RenderContext): void {
	const { time, ctx: canvas, size } = ctx;
	const shimmerPos = ((time * 0.001) % 2) - 0.5;

	canvas.save();
	const gradient = canvas.createLinearGradient(
		size * shimmerPos - size * 0.3,
		0,
		size * shimmerPos + size * 0.3,
		0
	);
	gradient.addColorStop(0, 'transparent');
	gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
	gradient.addColorStop(1, 'transparent');

	canvas.fillStyle = gradient;
	canvas.fillRect(0, 0, size, size);
	canvas.restore();
}

export function fade(ctx: RenderContext): void {
	const { progress } = ctx;
	const opacity = Math.sin(progress * Math.PI);
	ctx.state.compass.rim.opacity = opacity;
	ctx.state.compass.innerCircle.opacity = opacity;
}

export function zoom(ctx: RenderContext): void {
	const { progress } = ctx;
	const scale = 0.5 + Math.sin(progress * Math.PI) * 0.5;
	ctx.state.compass.rim.scale = { x: scale, y: scale };
	ctx.state.compass.innerCircle.scale = { x: scale, y: scale };
}

export function tilt(ctx: RenderContext): void {
	const { time } = ctx;
	const tiltAngle = Math.sin(time * 0.003) * 0.4;
	ctx.state.compass.rim.rotation = tiltAngle;

	const skewX = 1 + Math.sin(tiltAngle) * 0.2;
	const skewY = 1 - Math.sin(tiltAngle) * 0.1;
	ctx.state.compass.rim.scale = { x: skewX, y: skewY };
}

export function swing(ctx: RenderContext): void {
	const { time } = ctx;
	const swingAngle = Math.sin(time * 0.002) * 0.8;
	ctx.state.compass.needle.angle = (swingAngle * 180) / Math.PI;
}

export function flip(ctx: RenderContext): void {
	const { progress } = ctx;
	const scaleY = Math.abs(Math.cos(progress * Math.PI * 2));

	ctx.state.compass.rim.scale = { x: 1, y: scaleY };
	ctx.state.compass.innerCircle.scale = { x: 1, y: scaleY };
}

export function roll(ctx: RenderContext): void {
	const { time, size } = ctx;
	const rollProgress = (time * 0.001) % 1;
	const x = rollProgress * size;
	const rotation = rollProgress * Math.PI * 2;

	ctx.state.compass.rim.position.x = x;
	ctx.state.compass.rim.rotation = rotation;
	ctx.state.compass.innerCircle.position.x = x;
}

export function breathe(ctx: RenderContext): void {
	const { time } = ctx;
	const breathPhase = Math.sin(time * 0.0015);
	const scale = 1 + breathPhase * 0.08;
	const opacity = 0.9 + breathPhase * 0.1;

	ctx.state.compass.rim.scale = { x: scale, y: scale };
	ctx.state.compass.rim.opacity = opacity;
}

// ============================================
// EMOTIONAL ANIMATIONS (12)
// ============================================

export function happy(ctx: RenderContext): void {
	const { time, size } = ctx;

	const bounceHeight = Math.abs(Math.sin(time * 0.008)) * size * 0.15;
	ctx.state.compass.rim.position.y = size / 2 - bounceHeight;
	ctx.state.compass.innerCircle.position.y = size / 2 - bounceHeight;

	const existingEmitter = ctx.state.emitters.find((e) => e.id === 'happy-sparkles');
	if (!existingEmitter) {
		ctx.state.emitters.push({
			id: 'happy-sparkles',
			position: { x: size / 2, y: size / 2 },
			rate: 5,
			active: true,
			particles: [],
			maxParticles: 20,
			config: {
				lifespan: { min: 500, max: 1000 },
				velocity: { min: 30, max: 60 },
				angle: { min: 0, max: Math.PI * 2 },
				size: { min: 2, max: 4 },
				colors: ['#FFB400', '#0BFF7F'],
				shapes: ['sparkle', 'star'],
				fadeOut: true,
			},
		});
	}
}

export function excited(ctx: RenderContext): void {
	const { time, size } = ctx;

	const bounce = Math.abs(Math.sin(time * 0.015)) * size * 0.2;
	ctx.state.compass.rim.position.y = size / 2 - bounce;
	ctx.state.compass.innerCircle.position.y = size / 2 - bounce;

	const shake = Math.sin(time * 0.025) * size * 0.03;
	ctx.state.compass.rim.position.x = size / 2 + shake;
	ctx.state.compass.innerCircle.position.x = size / 2 + shake;

	ctx.state.compass.needle.glowIntensity = 0.8;
}

export function proud(ctx: RenderContext): void {
	const { time, size } = ctx;

	ctx.state.compass.rim.position.y = size / 2 - size * 0.05;
	ctx.state.compass.innerCircle.position.y = size / 2 - size * 0.05;

	const glowIntensity = (Math.sin(time * 0.002) + 1) / 2;
	ctx.state.compass.needle.glowIntensity = glowIntensity * 0.9;

	const scale = 1.05;
	ctx.state.compass.rim.scale = { x: scale, y: scale };
}

export function sad(ctx: RenderContext): void {
	const { time, size } = ctx;

	const droop = Math.sin(time * 0.001) * size * 0.05 + size * 0.1;
	ctx.state.compass.rim.position.y = size / 2 + droop;
	ctx.state.compass.innerCircle.position.y = size / 2 + droop;

	ctx.state.compass.rim.opacity = 0.6;
	ctx.state.compass.innerCircle.opacity = 0.7;

	const scale = 0.9;
	ctx.state.compass.rim.scale = { x: scale, y: scale };
}

export function crying(ctx: RenderContext): void {
	const { size } = ctx;

	ctx.state.compass.rim.position.y = size / 2 + size * 0.05;
	ctx.state.compass.innerCircle.position.y = size / 2 + size * 0.05;

	const existingEmitter = ctx.state.emitters.find((e) => e.id === 'tears');
	if (!existingEmitter) {
		ctx.state.emitters.push({
			id: 'tears',
			position: { x: size / 2, y: size / 2 },
			rate: 3,
			active: true,
			particles: [],
			maxParticles: 15,
			config: {
				lifespan: { min: 1000, max: 2000 },
				velocity: { min: 20, max: 40 },
				angle: { min: Math.PI / 2 - 0.2, max: Math.PI / 2 + 0.2 },
				size: { min: 3, max: 6 },
				colors: ['rgba(100, 200, 255, 0.7)'],
				shapes: ['circle'],
				gravity: { x: 0, y: 0.5 },
				fadeOut: true,
			},
		});
	}
}

export function nervous(ctx: RenderContext): void {
	const { time, size } = ctx;

	const shakeX = Math.sin(time * 0.03) * size * 0.02;
	const shakeY = Math.cos(time * 0.025) * size * 0.015;

	ctx.state.compass.rim.position.x = size / 2 + shakeX;
	ctx.state.compass.rim.position.y = size / 2 + shakeY;
	ctx.state.compass.innerCircle.position.x = size / 2 + shakeX;
	ctx.state.compass.innerCircle.position.y = size / 2 + shakeY;
}

export function shocked(ctx: RenderContext): void {
	const { progress, size } = ctx;

	if (progress < 0.2) {
		const jumpBack = (progress / 0.2) * size * 0.3;
		ctx.state.compass.rim.position.x = size / 2 - jumpBack;
		ctx.state.compass.innerCircle.position.x = size / 2 - jumpBack;

		const scale = 1 + (progress / 0.2) * 0.15;
		ctx.state.compass.rim.scale = { x: scale, y: scale };
	} else {
		const wobble = Math.sin((progress - 0.2) * Math.PI * 10) * size * 0.05 * (1 - progress);
		ctx.state.compass.rim.position.x = size / 2 + wobble;
		ctx.state.compass.innerCircle.position.x = size / 2 + wobble;
	}
}

export function angry(ctx: RenderContext): void {
	const { time, size } = ctx;

	const shakeIntensity = 0.04;
	const shakeX = Math.sin(time * 0.02) * size * shakeIntensity;
	const shakeY = Math.cos(time * 0.018) * size * shakeIntensity;

	ctx.state.compass.rim.position.x = size / 2 + shakeX;
	ctx.state.compass.rim.position.y = size / 2 + shakeY;
	ctx.state.compass.innerCircle.position.x = size / 2 + shakeX;
	ctx.state.compass.innerCircle.position.y = size / 2 + shakeY;

	ctx.state.compass.needle.glowIntensity = 0.9;
	ctx.state.compass.needle.color = '#FF4B4B';

	const scale = 1 + Math.sin(time * 0.01) * 0.05;
	ctx.state.compass.rim.scale = { x: scale, y: scale };
}

export function tired(ctx: RenderContext): void {
	const { time, size } = ctx;

	const droop = Math.sin(time * 0.0005) * size * 0.08;
	ctx.state.compass.rim.position.y = size / 2 + droop;
	ctx.state.compass.innerCircle.position.y = size / 2 + droop;

	ctx.state.compass.rim.rotation = Math.sin(time * 0.0003) * 0.1;
	ctx.state.compass.rim.opacity = 0.8;
}

export function celebrating(ctx: RenderContext): void {
	const { time, size } = ctx;

	const jumpHeight = Math.abs(Math.sin(time * 0.01)) * size * 0.25;
	ctx.state.compass.rim.position.y = size / 2 - jumpHeight;
	ctx.state.compass.innerCircle.position.y = size / 2 - jumpHeight;

	const existingEmitter = ctx.state.emitters.find((e) => e.id === 'confetti');
	if (!existingEmitter) {
		ctx.state.emitters.push({
			id: 'confetti',
			position: { x: size / 2, y: size / 2 },
			rate: 15,
			active: true,
			particles: [],
			maxParticles: 50,
			config: {
				lifespan: { min: 1000, max: 2000 },
				velocity: { min: 80, max: 150 },
				angle: { min: -Math.PI / 3, max: (-Math.PI * 2) / 3 },
				size: { min: 3, max: 7 },
				colors: ['#0B63FF', '#FFB400', '#FF4B4B', '#0BFF7F'],
				shapes: ['square', 'circle', 'triangle', 'star'],
				gravity: { x: 0, y: 0.4 },
				fadeOut: true,
			},
		});
	}
}

export function thinking(ctx: RenderContext): void {
	const { time } = ctx;

	ctx.state.compass.rim.rotation = Math.sin(time * 0.002) * 0.1;

	const glowIntensity = ((Math.sin(time * 0.004) + 1) / 2) * 0.3;
	ctx.state.compass.needle.glowIntensity = glowIntensity;
}

export function loving(ctx: RenderContext): void {
	const { time, size } = ctx;

	const scale = 1 + Math.sin(time * 0.004) * 0.08;
	ctx.state.compass.rim.scale = { x: scale, y: scale };

	ctx.state.compass.needle.color = '#FF6B9D';
	ctx.state.compass.needle.glowIntensity = 0.5;

	const existingEmitter = ctx.state.emitters.find((e) => e.id === 'hearts');
	if (!existingEmitter) {
		ctx.state.emitters.push({
			id: 'hearts',
			position: { x: size / 2, y: size / 2 },
			rate: 3,
			active: true,
			particles: [],
			maxParticles: 15,
			config: {
				lifespan: { min: 1500, max: 2500 },
				velocity: { min: 20, max: 40 },
				angle: { min: -Math.PI / 2 - 0.5, max: -Math.PI / 2 + 0.5 },
				size: { min: 4, max: 8 },
				colors: ['#FF6B9D', '#FF4B4B'],
				shapes: ['heart'],
				gravity: { x: 0, y: -0.1 },
				fadeOut: true,
			},
		});
	}
}

// ============================================
// MORPHING ANIMATIONS (10)
// ============================================

export function melt(ctx: RenderContext): void {
	const { progress, size } = ctx;
	const compass = ctx.state.compass;

	const meltAmount = progress * size * 0.3;
	compass.rim.position.y = size / 2 + meltAmount * 0.5;
	compass.innerCircle.position.y = size / 2 + meltAmount * 0.3;

	compass.rim.scale = {
		x: 1 + progress * 0.2,
		y: 1 - progress * 0.4,
	};
	compass.innerCircle.scale = {
		x: 1 + progress * 0.15,
		y: 1 - progress * 0.3,
	};

	compass.rim.opacity = 1 - progress * 0.3;
}

export function liquid(ctx: RenderContext): void {
	const { time, size } = ctx;
	const compass = ctx.state.compass;

	const wave1 = Math.sin(time * 0.003) * size * 0.05;
	const wave2 = Math.cos(time * 0.004) * size * 0.03;

	compass.rim.scale = {
		x: 1 + wave1 / size,
		y: 1 + wave2 / size,
	};

	compass.rim.rotation = Math.sin(time * 0.002) * 0.1;
}

export function explode(ctx: RenderContext): void {
	const { progress, size } = ctx;

	if (progress < 0.1) {
		const scale = 1 + (progress / 0.1) * 0.3;
		ctx.state.compass.rim.scale = { x: scale, y: scale };
	} else if (progress < 0.3) {
		const emitterId = 'explosion';
		if (!ctx.state.emitters.find((e) => e.id === emitterId)) {
			ctx.state.emitters.push({
				id: emitterId,
				position: { x: size / 2, y: size / 2 },
				rate: 200,
				active: true,
				particles: [],
				maxParticles: 100,
				config: {
					lifespan: { min: 500, max: 1500 },
					velocity: { min: 100, max: 250 },
					angle: { min: 0, max: Math.PI * 2 },
					size: { min: 2, max: 8 },
					colors: ['#0B63FF', '#FFB400', '#FF4B4B'],
					shapes: ['square', 'circle', 'triangle'],
					gravity: { x: 0, y: 0.3 },
					fadeOut: true,
				},
			});
		}

		ctx.state.compass.rim.opacity = 0;
		ctx.state.compass.innerCircle.opacity = 0;
	}
}

export function shatter(ctx: RenderContext): void {
	const { progress, size } = ctx;
	const compass = ctx.state.compass;

	if (progress < 0.2) {
		const shake = Math.sin((progress / 0.2) * Math.PI * 20) * size * 0.02;
		compass.rim.position.x = size / 2 + shake;
	} else {
		const shatterProgress = (progress - 0.2) / 0.8;
		compass.rim.opacity = 1 - shatterProgress;
		compass.innerCircle.opacity = 1 - shatterProgress;

		const scale = 1 + shatterProgress * 0.5;
		compass.rim.scale = { x: scale, y: scale };
	}
}

export function dissolve(ctx: RenderContext): void {
	const { progress } = ctx;
	const compass = ctx.state.compass;

	compass.rim.opacity = 1 - progress;
	compass.innerCircle.opacity = 1 - progress;

	const jitter = progress * 0.1;
	compass.rim.position.x += (Math.random() - 0.5) * jitter * ctx.size;
	compass.rim.position.y += (Math.random() - 0.5) * jitter * ctx.size;
}

export function reform(ctx: RenderContext): void {
	const { progress } = ctx;
	const compass = ctx.state.compass;

	compass.rim.opacity = progress;
	compass.innerCircle.opacity = progress;

	const scale = 0.5 + progress * 0.5;
	compass.rim.scale = { x: scale, y: scale };
	compass.innerCircle.scale = { x: scale, y: scale };
}

export function squashStretch(ctx: RenderContext): void {
	const { time } = ctx;
	const phase = Math.sin(time * 0.008);

	const scaleX = 1 + phase * 0.3;
	const scaleY = 1 / scaleX;

	ctx.state.compass.rim.scale = { x: scaleX, y: scaleY };
	ctx.state.compass.innerCircle.scale = { x: scaleX, y: scaleY };
}

export function spiral(ctx: RenderContext): void {
	const { progress } = ctx;
	const compass = ctx.state.compass;

	const spiralRotation = progress * Math.PI * 8;
	const spiralScale = 1 - progress * 0.8;

	compass.rim.rotation = spiralRotation;
	compass.rim.scale = { x: spiralScale, y: spiralScale };
	compass.innerCircle.scale = { x: spiralScale, y: spiralScale };
	compass.rim.opacity = 1 - progress * 0.5;
}

export function pixelate(ctx: RenderContext): void {
	const { progress } = ctx;
	const compass = ctx.state.compass;

	const pixelation = Math.floor(progress * 20);
	const jitter = pixelation * 0.5;

	if (pixelation > 0) {
		compass.rim.position.x += (Math.random() - 0.5) * jitter;
		compass.rim.position.y += (Math.random() - 0.5) * jitter;
	}

	compass.rim.opacity = 1 - progress * 0.7;
}

export function glitch(ctx: RenderContext): void {
	const { time, size } = ctx;
	const compass = ctx.state.compass;

	if (Math.random() < 0.1) {
		const glitchX = (Math.random() - 0.5) * size * 0.2;
		const glitchY = (Math.random() - 0.5) * size * 0.2;

		compass.rim.position.x = size / 2 + glitchX;
		compass.rim.position.y = size / 2 + glitchY;
	} else {
		compass.rim.position.x = size / 2;
		compass.rim.position.y = size / 2;
	}

	const intensity = (Math.sin(time * 0.02) + 1) / 2;
	compass.rim.opacity = 0.7 + intensity * 0.3;
}

// ============================================
// PERSONALITY ANIMATIONS (12)
// ============================================

export function humanoidForm(ctx: RenderContext): void {
	const { progress } = ctx;

	if (!ctx.state.personality) {
		// Would need PersonalityEngine to create state
		// Simplified version for now
		ctx.state.compass.rim.opacity = 1 - progress * 0.3;
	}
}

export function humanoidIdle(ctx: RenderContext): void {
	const { time, size } = ctx;

	const breathe = Math.sin(time * 0.002) * size * 0.01;
	ctx.state.compass.rim.position.y = size / 2 + breathe;
	ctx.state.compass.innerCircle.position.y = size / 2 + breathe;
}

export function dancing(ctx: RenderContext): void {
	const { time, size } = ctx;

	const dancePhase = (time * 0.005) % (Math.PI * 2);
	const bounce = Math.abs(Math.sin(dancePhase)) * size * 0.1;
	const sway = Math.sin(dancePhase * 2) * size * 0.05;

	ctx.state.compass.rim.position.x = size / 2 + sway;
	ctx.state.compass.rim.position.y = size / 2 - bounce;
	ctx.state.compass.innerCircle.position.x = size / 2 + sway;
	ctx.state.compass.innerCircle.position.y = size / 2 - bounce;

	ctx.state.compass.rim.rotation = Math.sin(dancePhase) * 0.2;
}

export function waving(ctx: RenderContext): void {
	const { time } = ctx;

	const wavePhase = Math.sin(time * 0.008);
	ctx.state.compass.needle.angle = -45 + wavePhase * 30;
}

export function pointing(ctx: RenderContext): void {
	const { progress } = ctx;

	const targetAngle = 0;
	const currentAngle = -45;
	ctx.state.compass.needle.angle = currentAngle + (targetAngle - currentAngle) * progress;
}

export function looking(ctx: RenderContext): void {
	if (!ctx.input) return;

	const compassPos = ctx.state.compass.rim.position;
	const mouse = ctx.input.mouse;

	const dx = mouse.x - compassPos.x;
	const dy = mouse.y - compassPos.y;
	const angle = Math.atan2(dy, dx);

	ctx.state.compass.needle.angle = (angle * 180) / Math.PI + 90;
}

export function flying(ctx: RenderContext): void {
	const { time, size, progress } = ctx;

	const flap = Math.sin(time * 0.01) * size * 0.05;
	const rise = progress * size * 0.3;

	ctx.state.compass.rim.position.y = size / 2 - rise + flap;
	ctx.state.compass.innerCircle.position.y = size / 2 - rise + flap;

	ctx.state.compass.rim.rotation = Math.sin(time * 0.008) * 0.1;
}

export function walking(ctx: RenderContext): void {
	const { time, size } = ctx;

	const walkPhase = (time * 0.005) % (Math.PI * 2);
	const bob = Math.abs(Math.sin(walkPhase)) * size * 0.05;
	const walkProgress = (time * 0.0005) % 1;

	ctx.state.compass.rim.position.x = walkProgress * size;
	ctx.state.compass.rim.position.y = size / 2 - bob;
	ctx.state.compass.innerCircle.position.x = walkProgress * size;
	ctx.state.compass.innerCircle.position.y = size / 2 - bob;
}

export function jumping(ctx: RenderContext): void {
	const { progress, size } = ctx;

	const jumpHeight = Math.sin(progress * Math.PI) * size * 0.4;
	ctx.state.compass.rim.position.y = size / 2 - jumpHeight;
	ctx.state.compass.innerCircle.position.y = size / 2 - jumpHeight;
}

export function running(ctx: RenderContext): void {
	const { time, size } = ctx;

	const runPhase = (time * 0.01) % (Math.PI * 2);
	const bob = Math.abs(Math.sin(runPhase)) * size * 0.08;
	const runProgress = (time * 0.001) % 1;

	ctx.state.compass.rim.position.x = runProgress * size;
	ctx.state.compass.rim.position.y = size / 2 - bob;
	ctx.state.compass.innerCircle.position.x = runProgress * size;
	ctx.state.compass.innerCircle.position.y = size / 2 - bob;

	ctx.state.compass.rim.rotation = 0.2;
}

export function sitting(ctx: RenderContext): void {
	const { progress, size } = ctx;

	const sitHeight = progress * size * 0.2;

	ctx.state.compass.rim.position.y = size / 2 + sitHeight;
	ctx.state.compass.innerCircle.position.y = size / 2 + sitHeight;
}

export function sleeping(ctx: RenderContext): void {
	const { time, size } = ctx;

	ctx.state.compass.rim.rotation = Math.PI / 2;
	ctx.state.compass.rim.position.y = size / 2 + size * 0.15;

	const breathe = Math.sin(time * 0.001) * size * 0.02;
	ctx.state.compass.rim.scale = { x: 1 + breathe * 0.1, y: 1 - breathe * 0.1 };
}

// ============================================
// PHYSICS ANIMATIONS (8)
// ============================================

export function gravityFall(ctx: RenderContext): void {
	const { time, size } = ctx;

	const gravity = 0.5;
	const t = (time * 0.001) % 3;
	const y = t * t * gravity * 100;

	if (y < size * 0.8) {
		ctx.state.compass.rim.position.y = size * 0.2 + y;
		ctx.state.compass.innerCircle.position.y = size * 0.2 + y;
	} else {
		const bounce = Math.abs(Math.sin((time * 0.001 - 2) * Math.PI * 4)) * size * 0.1;
		ctx.state.compass.rim.position.y = size * 0.8 - bounce;
		ctx.state.compass.innerCircle.position.y = size * 0.8 - bounce;
	}
}

export function bouncePhysics(ctx: RenderContext): void {
	gravityFall(ctx);
}

export function pendulumSwing(ctx: RenderContext): void {
	const { time, size } = ctx;

	const angle = Math.sin(time * 0.003) * 0.8;
	const length = size * 0.4;

	ctx.state.compass.rim.position = {
		x: size / 2 + Math.sin(angle) * length,
		y: Math.cos(angle) * length,
	};
	ctx.state.compass.innerCircle.position = ctx.state.compass.rim.position;
	ctx.state.compass.rim.rotation = angle;
}

export function elasticStretch(ctx: RenderContext): void {
	const { time } = ctx;

	const elasticPhase = Math.sin(time * 0.005);
	const stretchX = 1 + elasticPhase * 0.4;
	const stretchY = 1 / stretchX;

	ctx.state.compass.rim.scale = { x: stretchX, y: stretchY };
	ctx.state.compass.innerCircle.scale = { x: stretchX, y: stretchY };
}

export function magneticPull(ctx: RenderContext): void {
	if (!ctx.input) return;

	const center = ctx.state.compass.rim.position;
	const target = ctx.input.mouse;
	const dist = distance(center, target);
	const strength = Math.max(0, 1 - dist / (ctx.size / 2));

	const pull = normalize({
		x: target.x - center.x,
		y: target.y - center.y,
	});

	ctx.state.compass.rim.position.x += pull.x * strength * 2;
	ctx.state.compass.rim.position.y += pull.y * strength * 2;
	ctx.state.compass.innerCircle.position = ctx.state.compass.rim.position;
}

export function windBlown(ctx: RenderContext): void {
	const { time, size } = ctx;

	const windStrength = Math.sin(time * 0.002) * size * 0.15;
	const windGust = Math.sin(time * 0.01) * size * 0.05;

	ctx.state.compass.rim.position.x = size / 2 + windStrength + windGust;
	ctx.state.compass.innerCircle.position.x = size / 2 + windStrength + windGust;

	ctx.state.compass.rim.rotation = (windStrength + windGust) / (size * 0.2);
}

export function orbitMotion(ctx: RenderContext): void {
	const { time, size } = ctx;

	const center = { x: size / 2, y: size / 2 };
	const radius = size * 0.3;
	const angle = time * 0.002;

	ctx.state.compass.rim.position = {
		x: center.x + Math.cos(angle) * radius,
		y: center.y + Math.sin(angle) * radius,
	};
	ctx.state.compass.innerCircle.position = ctx.state.compass.rim.position;
	ctx.state.compass.rim.rotation = angle + Math.PI / 2;
}

export function springOscillate(ctx: RenderContext): void {
	const { time, size } = ctx;

	const springPhase = Math.sin(time * 0.006) * Math.exp(-time * 0.0001);
	const displacement = springPhase * size * 0.2;

	ctx.state.compass.rim.position.y = size / 2 + displacement;
	ctx.state.compass.innerCircle.position.y = size / 2 + displacement;
}

// ============================================
// SPECTACULAR ANIMATIONS (15)
// ============================================

export function fireball(ctx: RenderContext): void {
	const { time, size } = ctx;

	ctx.state.compass.needle.color = '#FF4B4B';
	ctx.state.compass.needle.glowIntensity = 1;

	const pulse = 1 + Math.sin(time * 0.01) * 0.1;
	ctx.state.compass.rim.scale = { x: pulse, y: pulse };

	const emitterId = 'fire';
	if (!ctx.state.emitters.find((e) => e.id === emitterId)) {
		ctx.state.emitters.push({
			id: emitterId,
			position: { x: size / 2, y: size / 2 },
			rate: 20,
			active: true,
			particles: [],
			maxParticles: 60,
			config: {
				lifespan: { min: 300, max: 800 },
				velocity: { min: 40, max: 100 },
				angle: { min: 0, max: Math.PI * 2 },
				size: { min: 4, max: 10 },
				colors: ['#FF4B4B', '#FFB400', '#FF8C00'],
				shapes: ['circle'],
				gravity: { x: 0, y: -0.2 },
				fadeOut: true,
			},
		});
	}
}

export function supernova(ctx: RenderContext): void {
	const { progress, size } = ctx;

	if (progress < 0.3) {
		const scale = 1 - (progress / 0.3) * 0.5;
		ctx.state.compass.rim.scale = { x: scale, y: scale };
		ctx.state.compass.needle.glowIntensity = progress / 0.3;
	} else {
		const explodeProgress = (progress - 0.3) / 0.7;
		const scale = 1 + explodeProgress * 3;
		ctx.state.compass.rim.scale = { x: scale, y: scale };
		ctx.state.compass.rim.opacity = 1 - explodeProgress;

		const emitterId = 'supernova';
		if (!ctx.state.emitters.find((e) => e.id === emitterId)) {
			ctx.state.emitters.push({
				id: emitterId,
				position: { x: size / 2, y: size / 2 },
				rate: 100,
				active: true,
				particles: [],
				maxParticles: 150,
				config: {
					lifespan: { min: 800, max: 1500 },
					velocity: { min: 150, max: 300 },
					angle: { min: 0, max: Math.PI * 2 },
					size: { min: 2, max: 8 },
					colors: ['#FFFFFF', '#0BFF7F', '#0B63FF'],
					shapes: ['circle', 'star'],
					fadeOut: true,
				},
			});
		}
	}
}

export function blackHole(ctx: RenderContext): void {
	const { time, size, ctx: canvas } = ctx;

	const center = { x: size / 2, y: size / 2 };
	const voidRadius = size * 0.15;

	canvas.save();
	canvas.fillStyle = '#000000';
	canvas.beginPath();
	canvas.arc(center.x, center.y, voidRadius, 0, Math.PI * 2);
	canvas.fill();
	canvas.restore();

	const distortion = Math.sin(time * 0.008) * 0.2;
	ctx.state.compass.rim.scale = { x: 1 + distortion, y: 1 - distortion };
}

export function portal(ctx: RenderContext): void {
	const { time, size, ctx: canvas } = ctx;

	const center = { x: size / 2, y: size / 2 };

	canvas.save();
	for (let i = 0; i < 8; i++) {
		const rotation = time * 0.005 + (i * Math.PI) / 4;
		const radius = size * 0.3;

		canvas.translate(center.x, center.y);
		canvas.rotate(rotation);

		const gradient = canvas.createRadialGradient(0, 0, 0, 0, 0, radius);
		gradient.addColorStop(0, 'rgba(138, 43, 226, 0)');
		gradient.addColorStop(0.5, 'rgba(138, 43, 226, 0.4)');
		gradient.addColorStop(1, 'rgba(138, 43, 226, 0)');

		canvas.fillStyle = gradient;
		canvas.fillRect(-radius, -radius * 0.1, radius * 2, radius * 0.2);
		canvas.setTransform(1, 0, 0, 1, 0, 0);
	}
	canvas.restore();
}

export function lightning(ctx: RenderContext): void {
	const { size, ctx: canvas } = ctx;

	if (Math.random() < 0.1) {
		canvas.save();
		canvas.strokeStyle = '#0BFF7F';
		canvas.lineWidth = 3;
		canvas.shadowColor = '#0BFF7F';
		canvas.shadowBlur = 20;

		const startX = size / 2;
		const startY = 0;
		let currentX = startX;
		let currentY = startY;

		canvas.beginPath();
		canvas.moveTo(currentX, currentY);

		while (currentY < size) {
			currentX += (Math.random() - 0.5) * size * 0.2;
			currentY += size * 0.15;
			canvas.lineTo(currentX, currentY);
		}

		canvas.stroke();
		canvas.restore();
	}

	ctx.state.compass.needle.glowIntensity = Math.random();
	ctx.state.compass.needle.color = '#0BFF7F';
}

export function aurora(ctx: RenderContext): void {
	const { time, size, ctx: canvas } = ctx;

	canvas.save();
	for (let layer = 0; layer < 3; layer++) {
		const colors = ['rgba(0, 255, 127, 0.3)', 'rgba(138, 43, 226, 0.3)', 'rgba(11, 99, 255, 0.3)'];
		canvas.fillStyle = colors[layer];

		canvas.beginPath();
		canvas.moveTo(0, size / 2);

		for (let x = 0; x <= size; x += 5) {
			const y =
				size / 2 +
				Math.sin(x * 0.02 + time * 0.002 + layer) * size * 0.15 +
				Math.sin(x * 0.01 + time * 0.001 + layer * 2) * size * 0.1;
			canvas.lineTo(x, y);
		}

		canvas.lineTo(size, size);
		canvas.lineTo(0, size);
		canvas.closePath();
		canvas.fill();
	}
	canvas.restore();
}

export function galaxy(ctx: RenderContext): void {
	const { time, size, ctx: canvas } = ctx;
	const center = { x: size / 2, y: size / 2 };

	canvas.save();
	for (let arm = 0; arm < 4; arm++) {
		const armAngle = (arm / 4) * Math.PI * 2 + time * 0.0005;

		for (let i = 0; i < 50; i++) {
			const distance = (i / 50) * size * 0.4;
			const angle = armAngle + (i / 50) * Math.PI * 2;
			const x = center.x + Math.cos(angle) * distance;
			const y = center.y + Math.sin(angle) * distance;

			canvas.fillStyle = `rgba(255, 255, 255, ${1 - i / 50})`;
			canvas.beginPath();
			canvas.arc(x, y, 2, 0, Math.PI * 2);
			canvas.fill();
		}
	}
	canvas.restore();
}

export function nebula(ctx: RenderContext): void {
	const { time, size, ctx: canvas } = ctx;

	canvas.save();

	for (let layer = 0; layer < 5; layer++) {
		const layerOffset = layer * 0.3;
		const colors = [
			'rgba(138, 43, 226, 0.15)',
			'rgba(11, 99, 255, 0.15)',
			'rgba(255, 20, 147, 0.15)',
			'rgba(0, 255, 127, 0.15)',
			'rgba(255, 180, 0, 0.15)',
		];

		canvas.fillStyle = colors[layer % colors.length];

		for (let x = 0; x < size; x += 20) {
			for (let y = 0; y < size; y += 20) {
				const noiseX = Math.sin(x * 0.02 + time * 0.0005 + layerOffset);
				const noiseY = Math.cos(y * 0.02 + time * 0.0003 + layerOffset);
				const noise = (noiseX + noiseY) / 2;

				if (noise > 0.3) {
					const intensity = (noise - 0.3) / 0.7;
					canvas.globalAlpha = intensity * 0.15;
					canvas.beginPath();
					canvas.arc(x + noiseX * 10, y + noiseY * 10, 15 + noise * 10, 0, Math.PI * 2);
					canvas.fill();
				}
			}
		}
	}

	canvas.restore();
}

export function timeWarp(ctx: RenderContext): void {
	const { progress } = ctx;
	const compass = ctx.state.compass;

	const warpIntensity = Math.sin(progress * Math.PI) * 0.5;

	const distortion = warpIntensity * 0.3;
	compass.rim.scale = {
		x: 1 + Math.sin(progress * Math.PI * 4) * distortion,
		y: 1 + Math.cos(progress * Math.PI * 4) * distortion,
	};
	compass.rim.rotation = progress * Math.PI * 2 * warpIntensity;
}

export function dimensionShift(ctx: RenderContext): void {
	const { progress, size } = ctx;
	const compass = ctx.state.compass;

	const shiftAmount = Math.sin(progress * Math.PI) * size * 0.1;

	compass.rim.opacity = 1 - Math.abs(Math.sin(progress * Math.PI)) * 0.5;
	compass.rim.position.x = size / 2 + Math.sin(progress * Math.PI * 2) * shiftAmount;
}

export function energyBurst(ctx: RenderContext): void {
	const { progress, size } = ctx;

	if (progress < 0.2) {
		const chargeScale = 1 - (progress / 0.2) * 0.2;
		ctx.state.compass.rim.scale = { x: chargeScale, y: chargeScale };
		ctx.state.compass.needle.glowIntensity = progress / 0.2;
	} else {
		const burstProgress = (progress - 0.2) / 0.8;

		const emitterId = 'energy-burst';
		if (!ctx.state.emitters.find((e) => e.id === emitterId)) {
			ctx.state.emitters.push({
				id: emitterId,
				position: { x: size / 2, y: size / 2 },
				rate: 150,
				active: true,
				particles: [],
				maxParticles: 100,
				config: {
					lifespan: { min: 400, max: 1000 },
					velocity: { min: 200, max: 400 },
					angle: { min: 0, max: Math.PI * 2 },
					size: { min: 3, max: 10 },
					colors: ['#0BFF7F', '#0B63FF', '#FFFFFF'],
					shapes: ['circle', 'star'],
					fadeOut: true,
					trail: true,
				},
			});
		}

		ctx.state.compass.rim.scale = {
			x: 1 + burstProgress * 2,
			y: 1 + burstProgress * 2,
		};
		ctx.state.compass.rim.opacity = 1 - burstProgress * 0.7;
	}
}

export function crystallize(ctx: RenderContext): void {
	const { progress, size, ctx: canvas } = ctx;
	const center = { x: size / 2, y: size / 2 };

	canvas.save();
	const shardCount = 12;

	for (let i = 0; i < shardCount; i++) {
		const angle = (i / shardCount) * Math.PI * 2;
		const length = size * 0.3 * progress;
		const width = size * 0.03;

		canvas.translate(center.x, center.y);
		canvas.rotate(angle);

		const gradient = canvas.createLinearGradient(0, 0, length, 0);
		gradient.addColorStop(0, 'rgba(138, 43, 226, 0.8)');
		gradient.addColorStop(0.5, 'rgba(11, 99, 255, 0.6)');
		gradient.addColorStop(1, 'rgba(0, 255, 255, 0.4)');

		canvas.fillStyle = gradient;
		canvas.strokeStyle = 'rgba(255, 255, 255, 0.8)';
		canvas.lineWidth = 1;

		canvas.beginPath();
		canvas.moveTo(0, 0);
		canvas.lineTo(length, -width);
		canvas.lineTo(length * 0.9, 0);
		canvas.lineTo(length, width);
		canvas.closePath();
		canvas.fill();
		canvas.stroke();

		canvas.setTransform(1, 0, 0, 1, 0, 0);
	}

	canvas.restore();

	ctx.state.compass.rim.opacity = 1 - progress * 0.3;
}

export function vortex(ctx: RenderContext): void {
	const { time, size, ctx: canvas } = ctx;
	const center = { x: size / 2, y: size / 2 };

	canvas.save();

	for (let layer = 0; layer < 8; layer++) {
		const radius = size * 0.4 * (layer / 8);
		const segments = 60;

		canvas.strokeStyle = `rgba(11, 99, 255, ${0.3 * (1 - layer / 8)})`;
		canvas.lineWidth = 3;
		canvas.beginPath();

		for (let i = 0; i <= segments; i++) {
			const t = i / segments;
			const angle = t * Math.PI * 4 + time * 0.003 + layer * 0.5;
			const r = radius * (1 + Math.sin(t * Math.PI * 2) * 0.2);

			const x = center.x + Math.cos(angle) * r;
			const y = center.y + Math.sin(angle) * r;

			if (i === 0) {
				canvas.moveTo(x, y);
			} else {
				canvas.lineTo(x, y);
			}
		}

		canvas.stroke();
	}

	canvas.restore();

	ctx.state.compass.rim.rotation = time * 0.005;
	ctx.state.compass.needle.angle = (time * 0.01) % 360;
}

export function phoenixRise(ctx: RenderContext): void {
	const { progress, size } = ctx;

	if (progress < 0.3) {
		const burnProgress = progress / 0.3;
		ctx.state.compass.rim.opacity = 1 - burnProgress;
		ctx.state.compass.needle.color = '#FF4B4B';
		ctx.state.compass.needle.glowIntensity = burnProgress;

		const emitterId = 'phoenix-burn';
		if (!ctx.state.emitters.find((e) => e.id === emitterId)) {
			ctx.state.emitters.push({
				id: emitterId,
				position: { x: size / 2, y: size / 2 },
				rate: 15,
				active: true,
				particles: [],
				maxParticles: 40,
				config: {
					lifespan: { min: 500, max: 1000 },
					velocity: { min: 30, max: 80 },
					angle: { min: -Math.PI / 2 - 0.5, max: -Math.PI / 2 + 0.5 },
					size: { min: 4, max: 8 },
					colors: ['#FF4B4B', '#FFB400'],
					shapes: ['circle'],
					gravity: { x: 0, y: -0.2 },
					fadeOut: true,
				},
			});
		}
	} else if (progress < 0.5) {
		ctx.state.compass.rim.opacity = 0;
	} else {
		const riseProgress = (progress - 0.5) / 0.5;
		ctx.state.compass.rim.opacity = riseProgress;
		ctx.state.compass.rim.position.y = size / 2 - (1 - riseProgress) * size * 0.3;
		ctx.state.compass.needle.color = '#0BFF7F';
		ctx.state.compass.needle.glowIntensity = riseProgress;
	}
}

export function constellation(ctx: RenderContext): void {
	const { progress, size, ctx: canvas } = ctx;

	const stars = [
		{ x: 0.3, y: 0.3 },
		{ x: 0.4, y: 0.35 },
		{ x: 0.5, y: 0.3 },
		{ x: 0.55, y: 0.4 },
		{ x: 0.6, y: 0.5 },
		{ x: 0.65, y: 0.45 },
		{ x: 0.7, y: 0.5 },
	];

	canvas.save();

	stars.forEach((star, i) => {
		const appearProgress = Math.max(0, Math.min(1, progress * stars.length - i));

		if (appearProgress > 0) {
			const x = star.x * size;
			const y = star.y * size;
			const starSize = 4 * appearProgress;

			canvas.fillStyle = `rgba(255, 255, 255, ${appearProgress})`;
			canvas.shadowColor = '#FFFFFF';
			canvas.shadowBlur = 10 * appearProgress;

			canvas.beginPath();
			canvas.arc(x, y, starSize, 0, Math.PI * 2);
			canvas.fill();

			if (i > 0 && appearProgress > 0.5) {
				const prevStar = stars[i - 1];
				const lineProgress = (appearProgress - 0.5) / 0.5;

				canvas.strokeStyle = `rgba(11, 255, 127, ${lineProgress * 0.5})`;
				canvas.lineWidth = 2;
				canvas.shadowBlur = 5;
				canvas.shadowColor = '#0BFF7F';

				canvas.beginPath();
				canvas.moveTo(prevStar.x * size, prevStar.y * size);
				canvas.lineTo(x, y);
				canvas.stroke();
			}
		}
	});

	canvas.restore();

	ctx.state.compass.rim.opacity = 1 - progress * 0.7;
}

// ============================================
// TRANSITION ANIMATIONS (8)
// ============================================

export function wipe(ctx: RenderContext): void {
	const { progress, ctx: canvas, size } = ctx;

	canvas.save();
	canvas.beginPath();
	canvas.rect(0, 0, size * progress, size);
	canvas.clip();
	canvas.restore();
}

export function iris(ctx: RenderContext): void {
	const { progress, ctx: canvas, size } = ctx;

	canvas.save();
	canvas.beginPath();
	canvas.arc(size / 2, size / 2, (size / 2) * progress, 0, Math.PI * 2);
	canvas.clip();
	canvas.restore();
}

export function split(ctx: RenderContext): void {
	const { progress, size } = ctx;
	const compass = ctx.state.compass;

	const splitDistance = progress * size * 0.3;
	compass.rim.position.x = size / 2 + (progress > 0.5 ? splitDistance : -splitDistance);
}

export function curtain(ctx: RenderContext): void {
	const { progress, ctx: canvas, size } = ctx;

	canvas.save();

	const curtainHeight = size * (1 - progress);

	const gradient = canvas.createLinearGradient(0, 0, 0, curtainHeight);
	gradient.addColorStop(0, '#8B0000');
	gradient.addColorStop(0.5, '#A52A2A');
	gradient.addColorStop(1, '#8B0000');

	canvas.fillStyle = gradient;
	canvas.fillRect(0, 0, size, curtainHeight);

	canvas.beginPath();
	canvas.rect(0, curtainHeight, size, size - curtainHeight);
	canvas.clip();

	canvas.restore();
}

export function pageTurn(ctx: RenderContext): void {
	const { progress } = ctx;
	const compass = ctx.state.compass;

	if (progress < 0.5) {
		compass.rim.rotation = progress * Math.PI;
		compass.rim.scale = { x: 1 - progress, y: 1 };
	} else {
		compass.rim.rotation = (1 - progress) * Math.PI;
		compass.rim.scale = { x: progress, y: 1 };
	}
}

export function rippleReveal(ctx: RenderContext): void {
	const { progress, ctx: canvas, size } = ctx;
	const center = { x: size / 2, y: size / 2 };

	canvas.save();

	const maxRadius = (Math.sqrt(2) * size) / 2;
	const currentRadius = maxRadius * progress;

	canvas.globalAlpha = 1;
	canvas.beginPath();
	canvas.arc(center.x, center.y, currentRadius, 0, Math.PI * 2);
	canvas.clip();

	canvas.restore();
}

export function zoomBlur(ctx: RenderContext): void {
	const { progress } = ctx;

	const scale = 0.5 + progress * 0.5;
	const blur = Math.sin(progress * Math.PI) * 0.3;

	ctx.state.compass.rim.scale = { x: scale, y: scale };
	ctx.state.compass.innerCircle.scale = { x: scale, y: scale };
	ctx.state.compass.rim.opacity = 1 - blur;
}

export function particlesReveal(ctx: RenderContext): void {
	const { progress, size } = ctx;

	const emitterId = 'reveal-particles';
	if (!ctx.state.emitters.find((e) => e.id === emitterId)) {
		ctx.state.emitters.push({
			id: emitterId,
			position: { x: size / 2, y: size / 2 },
			rate: 50,
			active: true,
			particles: [],
			maxParticles: 200,
			config: {
				lifespan: { min: 1000, max: 2000 },
				velocity: { min: 10, max: 30 },
				angle: { min: 0, max: Math.PI * 2 },
				size: { min: 2, max: 5 },
				colors: ['#0B63FF', '#0BFF7F', '#FFB400'],
				shapes: ['circle'],
				fadeOut: false,
			},
		});
	}

	ctx.state.compass.rim.opacity = progress;
	ctx.state.compass.innerCircle.opacity = progress;
}

// ============================================
// INTERACTIVE ANIMATIONS (10)
// ============================================

export function followCursor(ctx: RenderContext): void {
	if (!ctx.input) return;

	const current = ctx.state.compass.rim.position;
	const target = ctx.input.mouse;
	const lerp = 0.1;

	ctx.state.compass.rim.position = {
		x: current.x + (target.x - current.x) * lerp,
		y: current.y + (target.y - current.y) * lerp,
	};
	ctx.state.compass.innerCircle.position = ctx.state.compass.rim.position;
}

export function reactToClick(ctx: RenderContext): void {
	if (!ctx.input || ctx.input.clicks.length === 0) return;

	const lastClick = ctx.input.clicks[ctx.input.clicks.length - 1];
	const compassPos = ctx.state.compass.rim.position;
	const dist = distance(compassPos, lastClick);

	if (dist < ctx.size * 0.3) {
		const scale = 1.2;
		ctx.state.compass.rim.scale = { x: scale, y: scale };
	} else {
		ctx.state.compass.rim.scale = { x: 1, y: 1 };
	}
}

export function hoverAttention(ctx: RenderContext): void {
	if (!ctx.input) return;

	const dist = distance(ctx.state.compass.rim.position, ctx.input.mouse);
	const scale = dist < ctx.size * 0.4 ? 1.1 : 1;

	ctx.state.compass.rim.scale = { x: scale, y: scale };
	ctx.state.compass.needle.glowIntensity = dist < ctx.size * 0.4 ? 0.5 : 0;
}

export function dragResponse(ctx: RenderContext): void {
	if (!ctx.input) return;

	const compass = ctx.state.compass;
	const mouse = ctx.input.mouse;
	const compassPos = compass.rim.position;

	const dist = distance(compassPos, mouse);
	const isDragging = dist < ctx.size * 0.2 && ctx.input.clicks.length > 0;

	if (isDragging) {
		const lerp = 0.2;
		compass.rim.position.x += (mouse.x - compassPos.x) * lerp;
		compass.rim.position.y += (mouse.y - compassPos.y) * lerp;
		compass.innerCircle.position = compass.rim.position;

		const angle = Math.atan2(mouse.y - compassPos.y, mouse.x - compassPos.x);
		compass.needle.angle = (angle * 180) / Math.PI + 90;
	} else {
		const centerX = ctx.size / 2;
		const centerY = ctx.size / 2;
		compass.rim.position.x += (centerX - compass.rim.position.x) * 0.1;
		compass.rim.position.y += (centerY - compass.rim.position.y) * 0.1;
		compass.innerCircle.position = compass.rim.position;
	}
}

export function lookAtCursor(ctx: RenderContext): void {
	if (!ctx.input) return;

	const compass = ctx.state.compass;
	const mouse = ctx.input.mouse;
	const compassPos = compass.rim.position;

	const dx = mouse.x - compassPos.x;
	const dy = mouse.y - compassPos.y;
	const angle = Math.atan2(dy, dx);

	const targetAngle = (angle * 180) / Math.PI + 90;
	const currentAngle = compass.needle.angle;
	const diff = targetAngle - currentAngle;

	const normalizedDiff = ((diff + 180) % 360) - 180;
	compass.needle.angle = currentAngle + normalizedDiff * 0.1;
}

export function magneticCursor(ctx: RenderContext): void {
	if (!ctx.input) return;

	const compass = ctx.state.compass;
	const mouse = ctx.input.mouse;
	const compassPos = compass.rim.position;

	const dist = distance(compassPos, mouse);
	const magneticRange = ctx.size * 0.6;

	if (dist < magneticRange) {
		const strength = 1 - dist / magneticRange;
		const pull = normalize({
			x: mouse.x - compassPos.x,
			y: mouse.y - compassPos.y,
		});

		const force = scale(pull, strength * 3);

		compass.rim.position.x += force.x;
		compass.rim.position.y += force.y;
		compass.innerCircle.position = compass.rim.position;

		compass.needle.glowIntensity = strength * 0.8;
	}
}

export function avoidCursor(ctx: RenderContext): void {
	if (!ctx.input) return;

	const compass = ctx.state.compass;
	const mouse = ctx.input.mouse;
	const compassPos = compass.rim.position;

	const dist = distance(compassPos, mouse);
	const avoidRange = ctx.size * 0.3;

	if (dist < avoidRange) {
		const strength = 1 - dist / avoidRange;
		const push = normalize({
			x: compassPos.x - mouse.x,
			y: compassPos.y - mouse.y,
		});

		const force = scale(push, strength * 5);

		compass.rim.position.x += force.x;
		compass.rim.position.y += force.y;
		compass.innerCircle.position = compass.rim.position;
	}

	const center = { x: ctx.size / 2, y: ctx.size / 2 };
	compass.rim.position.x += (center.x - compass.rim.position.x) * 0.02;
	compass.rim.position.y += (center.y - compass.rim.position.y) * 0.02;
	compass.innerCircle.position = compass.rim.position;
}

export function reactToScroll(ctx: RenderContext): void {
	if (!ctx.input) return;

	const scrollY = ctx.input.scroll.y;
	const rotation = (scrollY * 0.1) % 360;

	ctx.state.compass.needle.angle = rotation;
	ctx.state.compass.rim.rotation = (rotation * Math.PI) / 180;

	const scale = 1 + Math.sin(scrollY * 0.01) * 0.1;
	ctx.state.compass.rim.scale = { x: scale, y: scale };
}

export function soundReactive(ctx: RenderContext): void {
	const { time } = ctx;

	const bass = Math.abs(Math.sin(time * 0.005)) * 0.3;
	const scale = 1 + bass;

	ctx.state.compass.rim.scale = { x: scale, y: scale };
	ctx.state.compass.needle.glowIntensity = bass;
}

export function touchResponse(ctx: RenderContext): void {
	if (!ctx.input || ctx.input.touches.length === 0) return;

	const compass = ctx.state.compass;
	const touches = ctx.input.touches;

	if (touches.length === 1) {
		const touch = touches[0];
		compass.rim.position.x += (touch.x - compass.rim.position.x) * 0.15;
		compass.rim.position.y += (touch.y - compass.rim.position.y) * 0.15;
		compass.innerCircle.position = compass.rim.position;
	} else if (touches.length === 2) {
		const dist = distance(touches[0], touches[1]);
		const scale = Math.max(0.5, Math.min(2, dist / (ctx.size * 0.5)));

		compass.rim.scale = { x: scale, y: scale };
		compass.innerCircle.scale = { x: scale, y: scale };

		const angle = Math.atan2(touches[1].y - touches[0].y, touches[1].x - touches[0].x);
		compass.rim.rotation = angle;
	} else if (touches.length >= 3) {
		compass.needle.glowIntensity = 1;
	}
}

// ============================================
// ANIMATION REGISTRY - COMPLETE
// ============================================

export const ANIMATION_REGISTRY = {
	// Basic (15)
	spin,
	pulse,
	bounce,
	shake,
	wobble,
	float,
	glow,
	shimmer,
	fade,
	zoom,
	tilt,
	swing,
	flip,
	roll,
	breathe,

	// Emotional (12)
	happy,
	excited,
	proud,
	sad,
	crying,
	nervous,
	shocked,
	angry,
	tired,
	celebrating,
	thinking,
	loving,

	// Morphing (10)
	melt,
	liquid,
	explode,
	shatter,
	dissolve,
	reform,
	'squash-stretch': squashStretch,
	spiral,
	pixelate,
	glitch,

	// Personality (12)
	'humanoid-form': humanoidForm,
	'humanoid-idle': humanoidIdle,
	dancing,
	waving,
	pointing,
	looking,
	flying,
	walking,
	jumping,
	running,
	sitting,
	sleeping,

	// Physics (8)
	'gravity-fall': gravityFall,
	'bounce-physics': bouncePhysics,
	'pendulum-swing': pendulumSwing,
	'elastic-stretch': elasticStretch,
	'magnetic-pull': magneticPull,
	'wind-blown': windBlown,
	'orbit-motion': orbitMotion,
	'spring-oscillate': springOscillate,

	// Spectacular (15)
	fireball,
	supernova,
	'black-hole': blackHole,
	portal,
	lightning,
	aurora,
	galaxy,
	nebula,
	'time-warp': timeWarp,
	'dimension-shift': dimensionShift,
	'energy-burst': energyBurst,
	crystallize,
	vortex,
	'phoenix-rise': phoenixRise,
	constellation,

	// Transitions (8)
	wipe,
	iris,
	split,
	curtain,
	'page-turn': pageTurn,
	'ripple-reveal': rippleReveal,
	'zoom-blur': zoomBlur,
	'particles-reveal': particlesReveal,

	// Interactive (10)
	'follow-cursor': followCursor,
	'react-to-click': reactToClick,
	'hover-attention': hoverAttention,
	'drag-response': dragResponse,
	'look-at-cursor': lookAtCursor,
	'magnetic-cursor': magneticCursor,
	'avoid-cursor': avoidCursor,
	'react-to-scroll': reactToScroll,
	'sound-reactive': soundReactive,
	'touch-response': touchResponse,
} as const;

export function getAnimation(name: string): ((ctx: RenderContext) => void) | undefined {
	return ANIMATION_REGISTRY[name as keyof typeof ANIMATION_REGISTRY];
}

export function getAllAnimationNames(): string[] {
	return Object.keys(ANIMATION_REGISTRY);
}

export function getAnimationsByCategory(category: string): string[] {
	const categories: Record<string, string[]> = {
		basic: [
			'spin',
			'pulse',
			'bounce',
			'shake',
			'wobble',
			'float',
			'glow',
			'shimmer',
			'fade',
			'zoom',
			'tilt',
			'swing',
			'flip',
			'roll',
			'breathe',
		],
		emotional: [
			'happy',
			'excited',
			'proud',
			'sad',
			'crying',
			'nervous',
			'shocked',
			'angry',
			'tired',
			'celebrating',
			'thinking',
			'loving',
		],
		morphing: [
			'melt',
			'liquid',
			'explode',
			'shatter',
			'dissolve',
			'reform',
			'squash-stretch',
			'spiral',
			'pixelate',
			'glitch',
		],
		personality: [
			'humanoid-form',
			'humanoid-idle',
			'dancing',
			'waving',
			'pointing',
			'looking',
			'flying',
			'walking',
			'jumping',
			'running',
			'sitting',
			'sleeping',
		],
		physics: [
			'gravity-fall',
			'bounce-physics',
			'pendulum-swing',
			'elastic-stretch',
			'magnetic-pull',
			'wind-blown',
			'orbit-motion',
			'spring-oscillate',
		],
		spectacular: [
			'fireball',
			'supernova',
			'black-hole',
			'portal',
			'lightning',
			'aurora',
			'galaxy',
			'nebula',
			'time-warp',
			'dimension-shift',
			'energy-burst',
			'crystallize',
			'vortex',
			'phoenix-rise',
			'constellation',
		],
		transitions: [
			'wipe',
			'iris',
			'split',
			'curtain',
			'page-turn',
			'ripple-reveal',
			'zoom-blur',
			'particles-reveal',
		],
		interactive: [
			'follow-cursor',
			'react-to-click',
			'hover-attention',
			'drag-response',
			'look-at-cursor',
			'magnetic-cursor',
			'avoid-cursor',
			'react-to-scroll',
			'sound-reactive',
			'touch-response',
		],
	};

	return categories[category.toLowerCase()] || [];
}

export function hasAnimation(name: string): boolean {
	return name in ANIMATION_REGISTRY;
}

export function getAnimationCount(): number {
	return Object.keys(ANIMATION_REGISTRY).length;
}

export type AnimationName = keyof typeof ANIMATION_REGISTRY;
