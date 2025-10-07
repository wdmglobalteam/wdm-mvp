/**
 * MORPH ENGINE - SHAPE TRANSFORMATION SYSTEM
 *
 * Handles smooth morphing between different shapes:
 * - Circle to square, triangle, star, heart
 * - Liquid flow effects
 * - Melt, shatter, dissolve effects
 * - Particle-based transformations
 *
 * @version 3.0.0
 */

import type { CompassShape, Point } from './types';
import { lerp, lerpPoint } from '../utils/geometry';

export class MorphEngine {
	/**
	 * Generate points for a shape
	 */
	generateShapePoints(shape: CompassShape, pointCount: number = 64): Point[] {
		const points: Point[] = [];
		const center = shape.position;
		const size = shape.size / 2;

		switch (shape.type) {
			case 'circle':
				for (let i = 0; i < pointCount; i++) {
					const angle = (i / pointCount) * Math.PI * 2;
					points.push({
						x: center.x + Math.cos(angle) * size,
						y: center.y + Math.sin(angle) * size,
					});
				}
				break;

			case 'square':
				const perSide = Math.floor(pointCount / 4);
				// Top
				for (let i = 0; i < perSide; i++) {
					points.push({
						x: center.x - size + (i / perSide) * size * 2,
						y: center.y - size,
					});
				}
				// Right
				for (let i = 0; i < perSide; i++) {
					points.push({
						x: center.x + size,
						y: center.y - size + (i / perSide) * size * 2,
					});
				}
				// Bottom
				for (let i = 0; i < perSide; i++) {
					points.push({
						x: center.x + size - (i / perSide) * size * 2,
						y: center.y + size,
					});
				}
				// Left
				for (let i = 0; i < perSide; i++) {
					points.push({
						x: center.x - size,
						y: center.y + size - (i / perSide) * size * 2,
					});
				}
				break;

			case 'triangle':
				const triPerSide = Math.floor(pointCount / 3);
				// Top to bottom-right
				for (let i = 0; i < triPerSide; i++) {
					const t = i / triPerSide;
					points.push({
						x: center.x + lerp(0, size, t),
						y: center.y + lerp(-size, size, t),
					});
				}
				// Bottom-right to bottom-left
				for (let i = 0; i < triPerSide; i++) {
					const t = i / triPerSide;
					points.push({
						x: center.x + lerp(size, -size, t),
						y: center.y + size,
					});
				}
				// Bottom-left to top
				for (let i = 0; i < triPerSide; i++) {
					const t = i / triPerSide;
					points.push({
						x: center.x + lerp(-size, 0, t),
						y: center.y + lerp(size, -size, t),
					});
				}
				break;

			case 'star':
				const spikes = shape.sides || 5;
				const innerRadius = size * 0.4;
				const outerRadius = size;

				for (let i = 0; i < pointCount; i++) {
					const angle = (i / pointCount) * Math.PI * 2;
					const spikeProgress = ((i / pointCount) * spikes) % 1;
					const radius = spikeProgress < 0.5 ? outerRadius : innerRadius;

					points.push({
						x: center.x + Math.cos(angle) * radius,
						y: center.y + Math.sin(angle) * radius,
					});
				}
				break;

			case 'heart':
				for (let i = 0; i < pointCount; i++) {
					const t = (i / pointCount) * Math.PI * 2;
					const x = 16 * Math.pow(Math.sin(t), 3);
					const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

					points.push({
						x: center.x + x * (size / 16),
						y: center.y + y * (size / 16),
					});
				}
				break;

			case 'polygon':
				const sides = shape.sides || 6;
				for (let i = 0; i < pointCount; i++) {
					const angle = (i / pointCount) * Math.PI * 2;
					const sideAngle = (Math.floor((angle / (Math.PI * 2)) * sides) / sides) * (Math.PI * 2);
					const nextSideAngle =
						((Math.floor((angle / (Math.PI * 2)) * sides) + 1) / sides) * (Math.PI * 2);
					const t = ((angle / (Math.PI * 2)) * sides) % 1;

					const p1 = {
						x: center.x + Math.cos(sideAngle) * size,
						y: center.y + Math.sin(sideAngle) * size,
					};
					const p2 = {
						x: center.x + Math.cos(nextSideAngle) * size,
						y: center.y + Math.sin(nextSideAngle) * size,
					};

					points.push(lerpPoint(p1, p2, t));
				}
				break;
		}

		return points;
	}

	/**
	 * Morph between two shapes
	 */
	morphShapes(
		fromShape: CompassShape,
		toShape: CompassShape,
		progress: number,
		pointCount: number = 64
	): Point[] {
		const fromPoints = this.generateShapePoints(fromShape, pointCount);
		const toPoints = this.generateShapePoints(toShape, pointCount);

		return fromPoints.map((fromPoint, i) => {
			const toPoint = toPoints[i % toPoints.length];
			return lerpPoint(fromPoint, toPoint, progress);
		});
	}

	/**
	 * Create liquid flow effect
	 */
	liquidFlow(shape: CompassShape, time: number, amplitude: number = 0.1): Point[] {
		const points = this.generateShapePoints(shape, 128);
		const waveSpeed = 0.002;
		const waveFreq = 8;

		return points.map((point, i) => {
			const angle = (i / points.length) * Math.PI * 2;
			const wave = Math.sin(angle * waveFreq + time * waveSpeed) * amplitude * shape.size;
			const offset = Math.sin(time * waveSpeed * 0.5) * amplitude * shape.size * 0.5;

			return {
				x: point.x + Math.cos(angle) * (wave + offset),
				y: point.y + Math.sin(angle) * (wave + offset),
			};
		});
	}

	/**
	 * Create melt effect
	 */
	meltEffect(shape: CompassShape, progress: number): Point[] {
		const points = this.generateShapePoints(shape, 64);
		const meltAmount = progress * shape.size;

		return points.map((point) => {
			const distanceFromCenter = Math.abs(point.y - shape.position.y);
			const meltFactor = Math.max(0, 1 - distanceFromCenter / (shape.size / 2));
			const melt = meltFactor * meltAmount * progress;

			return {
				x: point.x,
				y: point.y + melt + Math.random() * melt * 0.3,
			};
		});
	}

	/**
	 * Create shatter effect - returns pieces
	 */
	shatterEffect(
		shape: CompassShape,
		pieceCount: number = 12
	): { points: Point[]; velocity: Point }[] {
		const center = shape.position;
		const pieces: { points: Point[]; velocity: Point }[] = [];

		for (let i = 0; i < pieceCount; i++) {
			const angle = (i / pieceCount) * Math.PI * 2;
			const nextAngle = ((i + 1) / pieceCount) * Math.PI * 2;
			const size = shape.size / 2;

			// Create triangular shard
			const points: Point[] = [
				center,
				{
					x: center.x + Math.cos(angle) * size,
					y: center.y + Math.sin(angle) * size,
				},
				{
					x: center.x + Math.cos(nextAngle) * size,
					y: center.y + Math.sin(nextAngle) * size,
				},
			];

			// Velocity radiating outward
			const velocity = {
				x: Math.cos(angle + Math.PI / pieceCount) * (50 + Math.random() * 50),
				y: Math.sin(angle + Math.PI / pieceCount) * (50 + Math.random() * 50),
			};

			pieces.push({ points, velocity });
		}

		return pieces;
	}

	/**
	 * Create dissolve effect - returns particles
	 */
	dissolveEffect(
		shape: CompassShape,
		progress: number,
		particleCount: number = 100
	): { position: Point; life: number }[] {
		const particles: { position: Point; life: number }[] = [];
		const points = this.generateShapePoints(shape, particleCount);

		points.forEach((point, i) => {
			const particleProgress = (i / points.length + progress * 2) % 1;
			if (particleProgress > progress) return;

			const life = 1 - particleProgress;
			const spread = particleProgress * shape.size * 0.5;

			particles.push({
				position: {
					x: point.x + (Math.random() - 0.5) * spread,
					y: point.y + (Math.random() - 0.5) * spread,
				},
				life,
			});
		});

		return particles;
	}

	/**
	 * Create pixelate effect
	 */
	pixelateEffect(
		shape: CompassShape,
		progress: number,
		pixelSize: number = 4
	): { x: number; y: number; size: number }[] {
		const pixels: { x: number; y: number; size: number }[] = [];
		const size = shape.size;
		const gridSize = Math.ceil(size / pixelSize);
		const actualPixelSize = pixelSize * (1 + progress * 2);

		for (let x = 0; x < gridSize; x++) {
			for (let y = 0; y < gridSize; y++) {
				const px = shape.position.x - size / 2 + x * actualPixelSize;
				const py = shape.position.y - size / 2 + y * actualPixelSize;

				// Check if pixel is within shape bounds
				const dx = px - shape.position.x;
				const dy = py - shape.position.y;
				if (dx * dx + dy * dy < (size / 2) * (size / 2)) {
					pixels.push({
						x: px + (Math.random() - 0.5) * actualPixelSize * progress,
						y: py + (Math.random() - 0.5) * actualPixelSize * progress,
						size: actualPixelSize * (1 - progress * 0.5),
					});
				}
			}
		}

		return pixels;
	}

	/**
	 * Create glitch effect
	 */
	glitchEffect(
		shape: CompassShape,
		intensity: number
	): { offset: Point; width: number; height: number }[] {
		const slices: { offset: Point; width: number; height: number }[] = [];
		const sliceCount = Math.floor(5 + intensity * 10);
		const sliceHeight = shape.size / sliceCount;

		for (let i = 0; i < sliceCount; i++) {
			const y = shape.position.y - shape.size / 2 + i * sliceHeight;
			const glitchAmount = (Math.random() - 0.5) * intensity * shape.size * 0.3;

			slices.push({
				offset: {
					x: shape.position.x - shape.size / 2 + glitchAmount,
					y: y,
				},
				width: shape.size,
				height: sliceHeight,
			});
		}

		return slices;
	}

	/**
	 * Create spiral effect
	 */
	spiralEffect(shape: CompassShape, progress: number, rotations: number = 3): Point[] {
		const points = this.generateShapePoints(shape, 128);
		const spiralAmount = progress * Math.PI * 2 * rotations;

		return points.map((point, i) => {
			const angle = (i / points.length) * Math.PI * 2;
			const dist = Math.sqrt(
				Math.pow(point.x - shape.position.x, 2) + Math.pow(point.y - shape.position.y, 2)
			);

			const spiralAngle = angle + spiralAmount * (1 - dist / (shape.size / 2));
			const scale = 1 - progress * (dist / (shape.size / 2));

			return {
				x: shape.position.x + Math.cos(spiralAngle) * dist * scale,
				y: shape.position.y + Math.sin(spiralAngle) * dist * scale,
			};
		});
	}

	/**
	 * Render morphed shape
	 */
	renderMorphedShape(
		ctx: CanvasRenderingContext2D,
		points: Point[],
		color: string,
		opacity: number = 1
	): void {
		if (points.length === 0) return;

		ctx.save();
		ctx.globalAlpha = opacity;
		ctx.fillStyle = color;

		ctx.beginPath();
		ctx.moveTo(points[0].x, points[0].y);

		for (let i = 1; i < points.length; i++) {
			ctx.lineTo(points[i].x, points[i].y);
		}

		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}
}
