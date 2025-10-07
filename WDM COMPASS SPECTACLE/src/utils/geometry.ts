// ============================================
// geometry.ts - Geometry Utilities
// ============================================

export interface Point {
	x: number;
	y: number;
}

export function distance(p1: Point, p2: Point): number {
	const dx = p2.x - p1.x;
	const dy = p2.y - p1.y;
	return Math.sqrt(dx * dx + dy * dy);
}

export function angle(p1: Point, p2: Point): number {
	return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

export function lerp(start: number, end: number, t: number): number {
	return start + (end - start) * t;
}

export function lerpPoint(p1: Point, p2: Point, t: number): Point {
	return {
		x: lerp(p1.x, p2.x, t),
		y: lerp(p1.y, p2.y, t),
	};
}

export function rotate(point: Point, center: Point, angle: number): Point {
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	const dx = point.x - center.x;
	const dy = point.y - center.y;

	return {
		x: center.x + dx * cos - dy * sin,
		y: center.y + dx * sin + dy * cos,
	};
}

export function normalize(point: Point): Point {
	const len = Math.sqrt(point.x * point.x + point.y * point.y);
	return len > 0 ? { x: point.x / len, y: point.y / len } : { x: 0, y: 0 };
}

export function scale(point: Point, scalar: number): Point {
	return {
		x: point.x * scalar,
		y: point.y * scalar,
	};
}

export function add(p1: Point, p2: Point): Point {
	return {
		x: p1.x + p2.x,
		y: p1.y + p2.y,
	};
}

export function subtract(p1: Point, p2: Point): Point {
	return {
		x: p1.x - p2.x,
		y: p1.y - p2.y,
	};
}

export function dot(p1: Point, p2: Point): number {
	return p1.x * p2.x + p1.y * p2.y;
}

export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

export function randomInRange(min: number, max: number): number {
	return min + Math.random() * (max - min);
}

export function randomPoint(width: number, height: number): Point {
	return {
		x: Math.random() * width,
		y: Math.random() * height,
	};
}

export function pointInCircle(point: Point, center: Point, radius: number): boolean {
	return distance(point, center) <= radius;
}

export function pointInRect(
	point: Point,
	rect: { x: number; y: number; width: number; height: number }
): boolean {
	return (
		point.x >= rect.x &&
		point.x <= rect.x + rect.width &&
		point.y >= rect.y &&
		point.y <= rect.y + rect.height
	);
}
