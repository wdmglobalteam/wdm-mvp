/**
 * COLOR UTILITIES
 * @version 3.0.0
 */

import type { Color } from '../core/types';

/**
 * Parse color to CSS string
 */
export function parseColor(color: string | Color): string {
	if (typeof color === 'string') return color;
	const { r, g, b, a = 1 } = color;
	return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Convert hex to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
			}
		: null;
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
	return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Interpolate between two colors
 */
export function interpolateColor(from: string, to: string, progress: number): string {
	const fromRgb = hexToRgb(from);
	const toRgb = hexToRgb(to);

	if (!fromRgb || !toRgb) return from;

	const r = Math.round(fromRgb.r + (toRgb.r - fromRgb.r) * progress);
	const g = Math.round(fromRgb.g + (toRgb.g - fromRgb.g) * progress);
	const b = Math.round(fromRgb.b + (toRgb.b - fromRgb.b) * progress);

	return rgbToHex(r, g, b);
}

/**
 * Lighten a color
 */
export function lighten(color: string, amount: number): string {
	const rgb = hexToRgb(color);
	if (!rgb) return color;

	const r = Math.min(255, Math.round(rgb.r + 255 * amount));
	const g = Math.min(255, Math.round(rgb.g + 255 * amount));
	const b = Math.min(255, Math.round(rgb.b + 255 * amount));

	return rgbToHex(r, g, b);
}

/**
 * Darken a color
 */
export function darken(color: string, amount: number): string {
	return lighten(color, -amount);
}
