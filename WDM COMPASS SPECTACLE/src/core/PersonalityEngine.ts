/**
 * PERSONALITY ENGINE - HUMANOID CHARACTER SYSTEM
 *
 * Transforms the compass into a living character with:
 * - Arms, legs, wings, hair
 * - Facial expressions (eyes, mouth, eyebrows)
 * - Emotional states and reactions
 * - Animated body parts with IK
 *
 * @version 3.0.0
 */

import type {
	PersonalityState,
	BodyPart,
	Expression,
	RenderContext,
	Point,
	Eye,
	Eyebrow,
	Mouth,
} from './types';
import { parseColor } from '../utils/color';
import { lerpPoint, normalize, scale } from '../utils/geometry';

export class PersonalityEngine {
	private size: number;

	constructor(size: number) {
		this.size = size;
	}

	/**
	 * Create default humanoid state
	 */
	createHumanoidState(): PersonalityState {
		const center = this.size / 2;

		return {
			mode: 'humanoid',
			mood: 'neutral',
			energy: 0.5,
			attention: null,
			bodyParts: [
				// Left arm
				{
					type: 'arm',
					side: 'left',
					segments: [
						{
							start: { x: center - this.size * 0.25, y: center },
							end: { x: center - this.size * 0.35, y: center + this.size * 0.15 },
							joint: { x: center - this.size * 0.3, y: center + this.size * 0.075 },
							width: this.size * 0.05,
							color: '#0B63FF',
						},
						{
							start: { x: center - this.size * 0.35, y: center + this.size * 0.15 },
							end: { x: center - this.size * 0.4, y: center + this.size * 0.25 },
							width: this.size * 0.04,
							color: '#0B63FF',
						},
					],
					visible: true,
					currentPose: 'idle',
				},
				// Right arm
				{
					type: 'arm',
					side: 'right',
					segments: [
						{
							start: { x: center + this.size * 0.25, y: center },
							end: { x: center + this.size * 0.35, y: center + this.size * 0.15 },
							joint: { x: center + this.size * 0.3, y: center + this.size * 0.075 },
							width: this.size * 0.05,
							color: '#0B63FF',
						},
						{
							start: { x: center + this.size * 0.35, y: center + this.size * 0.15 },
							end: { x: center + this.size * 0.4, y: center + this.size * 0.25 },
							width: this.size * 0.04,
							color: '#0B63FF',
						},
					],
					visible: true,
					currentPose: 'idle',
				},
				// Left leg
				{
					type: 'leg',
					side: 'left',
					segments: [
						{
							start: { x: center - this.size * 0.1, y: center + this.size * 0.25 },
							end: { x: center - this.size * 0.12, y: center + this.size * 0.4 },
							width: this.size * 0.055,
							color: '#0B63FF',
						},
						{
							start: { x: center - this.size * 0.12, y: center + this.size * 0.4 },
							end: { x: center - this.size * 0.1, y: center + this.size * 0.52 },
							width: this.size * 0.05,
							color: '#0B63FF',
						},
					],
					visible: true,
					currentPose: 'idle',
				},
				// Right leg
				{
					type: 'leg',
					side: 'right',
					segments: [
						{
							start: { x: center + this.size * 0.1, y: center + this.size * 0.25 },
							end: { x: center + this.size * 0.12, y: center + this.size * 0.4 },
							width: this.size * 0.055,
							color: '#0B63FF',
						},
						{
							start: { x: center + this.size * 0.12, y: center + this.size * 0.4 },
							end: { x: center + this.size * 0.1, y: center + this.size * 0.52 },
							width: this.size * 0.05,
							color: '#0B63FF',
						},
					],
					visible: true,
					currentPose: 'idle',
				},
			],
			expression: {
				eyes: {
					left: {
						position: { x: center - this.size * 0.08, y: center - this.size * 0.05 },
						size: this.size * 0.05,
						openAmount: 1,
						pupilPosition: { x: 0, y: 0 },
					},
					right: {
						position: { x: center + this.size * 0.08, y: center - this.size * 0.05 },
						size: this.size * 0.05,
						openAmount: 1,
						pupilPosition: { x: 0, y: 0 },
					},
					blinkProgress: 0,
				},
				mouth: {
					type: 'neutral',
					position: { x: center, y: center + this.size * 0.08 },
					width: this.size * 0.12,
					openAmount: 0,
					curve: 0,
				},
				eyebrows: {
					left: { angle: 0, curve: 0 },
					right: { angle: 0, curve: 0 },
				},
				blush: {
					visible: false,
					intensity: 0,
					color: '#FF6B9D',
				},
			},
		};
	}

	/**
	 * Update personality state based on mood and interactions
	 */
	update(state: PersonalityState, deltaTime: number, ctx: RenderContext): void {
		// Update blink animation
		if (state.expression.eyes.blinkProgress !== undefined) {
			state.expression.eyes.blinkProgress += deltaTime * 0.01;
			if (state.expression.eyes.blinkProgress > 1) {
				state.expression.eyes.blinkProgress = 0;
			}

			// Natural blinking
			if (Math.random() < 0.002) {
				state.expression.eyes.left.openAmount = Math.max(
					0,
					1 - state.expression.eyes.blinkProgress * 4
				);
				state.expression.eyes.right.openAmount = Math.max(
					0,
					1 - state.expression.eyes.blinkProgress * 4
				);
			} else if (state.expression.eyes.left.openAmount < 1) {
				state.expression.eyes.left.openAmount = Math.min(
					1,
					state.expression.eyes.left.openAmount + deltaTime * 0.01
				);
				state.expression.eyes.right.openAmount = Math.min(
					1,
					state.expression.eyes.right.openAmount + deltaTime * 0.01
				);
			}
		}

		// Update eye tracking
		if (ctx.input && state.attention) {
			const lookTarget = state.attention;

			const leftEyeDir = normalize({
				x: lookTarget.x - state.expression.eyes.left.position.x,
				y: lookTarget.y - state.expression.eyes.left.position.y,
			});
			const rightEyeDir = normalize({
				x: lookTarget.x - state.expression.eyes.right.position.x,
				y: lookTarget.y - state.expression.eyes.right.position.y,
			});

			state.expression.eyes.left.pupilPosition = scale(
				leftEyeDir,
				state.expression.eyes.left.size * 0.3
			);
			state.expression.eyes.right.pupilPosition = scale(
				rightEyeDir,
				state.expression.eyes.right.size * 0.3
			);
		}

		// Update mood-based expressions
		this.updateMoodExpression(state);

		// Update body part animations
		this.updateBodyParts(state, deltaTime);
	}

	/**
	 * Update expression based on current mood
	 */
	private updateMoodExpression(state: PersonalityState): void {
		switch (state.mood) {
			case 'happy':
				state.expression.mouth.type = 'smile';
				state.expression.mouth.curve = 0.8;
				if (state.expression.eyebrows) {
					state.expression.eyebrows.left.angle = -0.1;
					state.expression.eyebrows.right.angle = 0.1;
				}
				break;
			case 'sad':
				state.expression.mouth.type = 'frown';
				state.expression.mouth.curve = -0.6;
				if (state.expression.eyebrows) {
					state.expression.eyebrows.left.angle = 0.2;
					state.expression.eyebrows.right.angle = -0.2;
				}
				break;
			case 'excited':
				state.expression.mouth.type = 'surprised';
				state.expression.mouth.openAmount = 0.5;
				state.expression.eyes.left.openAmount = 1.2;
				state.expression.eyes.right.openAmount = 1.2;
				break;
			case 'nervous':
				state.expression.mouth.type = 'neutral';
				state.expression.mouth.curve = -0.2;
				// Add sweat drops
				if (!state.expression.sweatDrops) {
					state.expression.sweatDrops = { drops: [] };
				}
				if (Math.random() < 0.05 && state.expression.sweatDrops.drops.length < 3) {
					state.expression.sweatDrops.drops.push({
						position: {
							x: this.size / 2 + (Math.random() - 0.5) * this.size * 0.15,
							y: this.size / 2 - this.size * 0.2,
						},
						size: this.size * 0.02,
						velocity: { x: 0, y: 2 },
					});
				}
				break;
			case 'proud':
				state.expression.mouth.type = 'smile';
				state.expression.mouth.curve = 0.5;
				state.expression.eyes.left.openAmount = 0.7;
				state.expression.eyes.right.openAmount = 0.7;
				break;
			case 'angry':
				state.expression.mouth.type = 'frown';
				state.expression.mouth.curve = -0.8;
				if (state.expression.eyebrows) {
					state.expression.eyebrows.left.angle = 0.4;
					state.expression.eyebrows.right.angle = -0.4;
					state.expression.eyebrows.left.curve = -0.3;
					state.expression.eyebrows.right.curve = -0.3;
				}
				break;
		}

		// Update particle effects
		if (state.expression.sweatDrops) {
			state.expression.sweatDrops.drops = state.expression.sweatDrops.drops.filter((drop) => {
				drop.position.y += drop.velocity.y;
				drop.velocity.y += 0.2; // Gravity
				return drop.position.y < this.size;
			});
		}

		if (state.expression.tearDrops) {
			state.expression.tearDrops.drops = state.expression.tearDrops.drops.filter((drop) => {
				drop.position.y += drop.velocity.y;
				drop.velocity.y += 0.15;
				return drop.position.y < this.size;
			});
		}
	}

	/**
	 * Update body part positions for animations
	 */
	private updateBodyParts(state: PersonalityState, deltaTime: number): void {
		state.bodyParts.forEach((part) => {
			if (!part.animation) return;

			part.animation.progress += deltaTime * 0.001;
			if (part.animation.progress > 1) {
				part.animation.progress = 0;
			}

			// Interpolate between keyframes
			const keyframes = part.animation.keyframes;
			const currentFrame = Math.floor(part.animation.progress * keyframes.length);
			const nextFrame = (currentFrame + 1) % keyframes.length;
			const frameProgress = (part.animation.progress * keyframes.length) % 1;

			if (keyframes[currentFrame] && keyframes[nextFrame]) {
				const current = keyframes[currentFrame].positions;
				const next = keyframes[nextFrame].positions;

				part.segments.forEach((segment, i) => {
					if (current[i] && next[i]) {
						segment.end = lerpPoint(current[i], next[i], frameProgress);
					}
				});
			}
		});
	}

	/**
	 * Render humanoid character
	 */
	render(ctx: RenderContext, state: PersonalityState): void {
		const canvas = ctx.ctx;

		// Render legs first (behind body)
		state.bodyParts
			.filter((p) => p.type === 'leg' && p.visible)
			.forEach((part) => this.renderBodyPart(canvas, part));

		// Render body (compass acts as torso)
		// (compass is rendered by main engine)

		// Render arms
		state.bodyParts
			.filter((p) => p.type === 'arm' && p.visible)
			.forEach((part) => this.renderBodyPart(canvas, part));

		// Render wings (if any)
		state.bodyParts
			.filter((p) => p.type === 'wing' && p.visible)
			.forEach((part) => this.renderWing(canvas, part));

		// Render face
		this.renderFace(canvas, state.expression);

		// Render accessories
		this.renderAccessories(canvas, state);

		// Render particle effects
		this.renderEffects(canvas, state.expression);
	}

	/**
	 * Render a body part (arm/leg)
	 */
	private renderBodyPart(canvas: CanvasRenderingContext2D, part: BodyPart): void {
		canvas.save();
		canvas.strokeStyle = parseColor(part.segments[0].color);
		canvas.lineCap = 'round';
		canvas.lineJoin = 'round';

		part.segments.forEach((segment, i) => {
			canvas.lineWidth = segment.width;
			canvas.beginPath();
			canvas.moveTo(segment.start.x, segment.start.y);

			if (segment.joint) {
				canvas.quadraticCurveTo(segment.joint.x, segment.joint.y, segment.end.x, segment.end.y);
			} else {
				canvas.lineTo(segment.end.x, segment.end.y);
			}

			canvas.stroke();

			// Draw joints
			if (i < part.segments.length - 1) {
				canvas.fillStyle = parseColor(segment.color);
				canvas.beginPath();
				canvas.arc(segment.end.x, segment.end.y, segment.width * 0.6, 0, Math.PI * 2);
				canvas.fill();
			}

			// Draw hand/foot at end
			if (i === part.segments.length - 1) {
				if (part.type === 'arm') {
					// Draw glove
					canvas.fillStyle = '#FFB400';
					canvas.beginPath();
					canvas.arc(segment.end.x, segment.end.y, segment.width * 0.8, 0, Math.PI * 2);
					canvas.fill();
				} else if (part.type === 'leg') {
					// Draw boot
					canvas.fillStyle = '#FFB400';
					canvas.beginPath();
					canvas.ellipse(
						segment.end.x,
						segment.end.y,
						segment.width * 1.2,
						segment.width * 0.8,
						0,
						0,
						Math.PI * 2
					);
					canvas.fill();
				}
			}
		});

		canvas.restore();
	}

	/**
	 * Render wings
	 */
	private renderWing(canvas: CanvasRenderingContext2D, part: BodyPart): void {
		canvas.save();

		const wingBase =
			part.side === 'left'
				? { x: this.size / 2 - this.size * 0.2, y: this.size / 2 - this.size * 0.1 }
				: { x: this.size / 2 + this.size * 0.2, y: this.size / 2 - this.size * 0.1 };

		const wingTip =
			part.side === 'left'
				? { x: wingBase.x - this.size * 0.25, y: wingBase.y - this.size * 0.2 }
				: { x: wingBase.x + this.size * 0.25, y: wingBase.y - this.size * 0.2 };

		// Create gradient for wing
		const gradient = canvas.createLinearGradient(wingBase.x, wingBase.y, wingTip.x, wingTip.y);
		gradient.addColorStop(0, 'rgba(11, 99, 255, 0.8)');
		gradient.addColorStop(0.5, 'rgba(255, 180, 0, 0.6)');
		gradient.addColorStop(1, 'rgba(11, 255, 127, 0.4)');

		canvas.fillStyle = gradient;
		canvas.beginPath();
		canvas.moveTo(wingBase.x, wingBase.y);

		// Draw feathered wing shape
		const featherCount = 5;
		for (let i = 0; i <= featherCount; i++) {
			const t = i / featherCount;
			const ctrl1 = lerpPoint(wingBase, wingTip, t);
			const ctrl2 = {
				x: ctrl1.x + (part.side === 'left' ? -1 : 1) * this.size * 0.15 * Math.sin(t * Math.PI),
				y: ctrl1.y - this.size * 0.1 * Math.sin(t * Math.PI),
			};
			canvas.quadraticCurveTo(ctrl2.x, ctrl2.y, ctrl1.x, ctrl1.y);
		}

		canvas.lineTo(wingBase.x, wingBase.y);
		canvas.closePath();
		canvas.fill();

		canvas.restore();
	}

	/**
	 * Render facial features
	 */
	private renderFace(canvas: CanvasRenderingContext2D, expression: Expression): void {
		canvas.save();

		// Render eyes
		this.renderEye(canvas, expression.eyes.left);
		this.renderEye(canvas, expression.eyes.right);

		// Render eyebrows
		if (expression.eyebrows) {
			this.renderEyebrow(canvas, expression.eyes.left.position, expression.eyebrows.left);
			this.renderEyebrow(canvas, expression.eyes.right.position, expression.eyebrows.right);
		}

		// Render mouth
		this.renderMouth(canvas, expression.mouth);

		// Render blush
		if (expression.blush?.visible) {
			canvas.fillStyle = parseColor(expression.blush.color);
			canvas.globalAlpha = expression.blush.intensity * 0.4;
			canvas.beginPath();
			canvas.ellipse(
				this.size / 2 - this.size * 0.12,
				this.size / 2 + this.size * 0.02,
				this.size * 0.04,
				this.size * 0.03,
				0,
				0,
				Math.PI * 2
			);
			canvas.fill();
			canvas.beginPath();
			canvas.ellipse(
				this.size / 2 + this.size * 0.12,
				this.size / 2 + this.size * 0.02,
				this.size * 0.04,
				this.size * 0.03,
				0,
				0,
				Math.PI * 2
			);
			canvas.fill();
			canvas.globalAlpha = 1;
		}

		canvas.restore();
	}

	/**
	 * Render single eye
	 */
	private renderEye(canvas: CanvasRenderingContext2D, eye: Eye): void {
		canvas.save();
		canvas.translate(eye.position.x, eye.position.y);

		// Eye white
		canvas.fillStyle = '#FFFFFF';
		canvas.beginPath();
		canvas.ellipse(0, 0, eye.size, eye.size * eye.openAmount, 0, 0, Math.PI * 2);
		canvas.fill();

		// Pupil
		canvas.fillStyle = '#0F1724';
		canvas.beginPath();
		canvas.arc(eye.pupilPosition.x, eye.pupilPosition.y, eye.size * 0.5, 0, Math.PI * 2);
		canvas.fill();

		// Highlight
		canvas.fillStyle = 'rgba(255, 255, 255, 0.6)';
		canvas.beginPath();
		canvas.arc(
			eye.pupilPosition.x - eye.size * 0.15,
			eye.pupilPosition.y - eye.size * 0.15,
			eye.size * 0.2,
			0,
			Math.PI * 2
		);
		canvas.fill();

		canvas.restore();
	}

	/**
	 * Render eyebrow
	 */
	private renderEyebrow(canvas: CanvasRenderingContext2D, eyePos: Point, eyebrow: Eyebrow): void {
		canvas.save();
		canvas.strokeStyle = '#0F1724';
		canvas.lineWidth = this.size * 0.015;
		canvas.lineCap = 'round';

		const offset = this.size * 0.08;
		const width = this.size * 0.06;

		canvas.translate(eyePos.x, eyePos.y - offset);
		canvas.rotate(eyebrow.angle);

		canvas.beginPath();
		canvas.moveTo(-width, 0);
		canvas.quadraticCurveTo(0, eyebrow.curve * this.size * 0.02, width, 0);
		canvas.stroke();

		canvas.restore();
	}

	/**
	 * Render mouth
	 */
	private renderMouth(canvas: CanvasRenderingContext2D, mouth: Mouth): void {
		canvas.save();
		canvas.strokeStyle = '#0F1724';
		canvas.lineWidth = this.size * 0.02;
		canvas.lineCap = 'round';

		canvas.translate(mouth.position.x, mouth.position.y);

		canvas.beginPath();
		canvas.moveTo(-mouth.width / 2, 0);

		if (mouth.type === 'smile' || mouth.type === 'frown') {
			canvas.quadraticCurveTo(0, mouth.curve * this.size * 0.05, mouth.width / 2, 0);
		} else if (mouth.type === 'surprised' || mouth.type === 'laughing') {
			canvas.ellipse(0, 0, mouth.width * 0.4, mouth.width * 0.3 * mouth.openAmount, 0, 0, Math.PI * 2);
		} else {
			canvas.lineTo(mouth.width / 2, 0);
		}

		canvas.stroke();

		// Draw tongue for laughing
		if (mouth.type === 'laughing' && mouth.openAmount > 0.3) {
			canvas.fillStyle = '#FF6B9D';
			canvas.beginPath();
			canvas.ellipse(0, mouth.width * 0.1, mouth.width * 0.2, mouth.width * 0.15, 0, 0, Math.PI * 2);
			canvas.fill();
		}

		canvas.restore();
	}

	/**
	 * Render accessories (gloves, boots, hair, etc)
	 */
	private renderAccessories(canvas: CanvasRenderingContext2D, state: PersonalityState): void {
		// Render hair
		const hairPart = state.bodyParts.find((p) => p.type === 'hair');
		if (hairPart && hairPart.visible) {
			this.renderHair(canvas);
		}
	}

	/**
	 * Render hair
	 */
	private renderHair(canvas: CanvasRenderingContext2D): void {
		canvas.save();
		const center = { x: this.size / 2, y: this.size / 2 };

		canvas.fillStyle = '#0F1724';

		// Draw spiky hair strands
		for (let i = 0; i < 5; i++) {
			const angle = (i / 5) * Math.PI - Math.PI / 2;
			const length = this.size * 0.15;
			const x = center.x + Math.cos(angle) * this.size * 0.18;
			const y = center.y - this.size * 0.18 + Math.sin(angle) * this.size * 0.05;

			canvas.beginPath();
			canvas.moveTo(x, y);
			canvas.lineTo(
				x + Math.cos(angle - Math.PI / 2) * length,
				y + Math.sin(angle - Math.PI / 2) * length
			);
			canvas.lineWidth = this.size * 0.03;
			canvas.lineCap = 'round';
			canvas.stroke();
		}

		canvas.restore();
	}

	/**
	 * Render emotional effects (tears, sweat, hearts)
	 */
	private renderEffects(canvas: CanvasRenderingContext2D, expression: Expression): void {
		canvas.save();

		// Render sweat drops
		if (expression.sweatDrops) {
			canvas.fillStyle = 'rgba(100, 200, 255, 0.7)';
			expression.sweatDrops.drops.forEach((drop) => {
				canvas.beginPath();
				canvas.ellipse(drop.position.x, drop.position.y, drop.size, drop.size * 1.3, 0, 0, Math.PI * 2);
				canvas.fill();
			});
		}

		// Render tear drops
		if (expression.tearDrops) {
			canvas.fillStyle = 'rgba(100, 200, 255, 0.8)';
			expression.tearDrops.drops.forEach((drop) => {
				canvas.beginPath();
				canvas.arc(drop.position.x, drop.position.y, drop.size, 0, Math.PI * 2);
				canvas.fill();

				// Teardrop shape
				canvas.beginPath();
				canvas.moveTo(drop.position.x, drop.position.y - drop.size);
				canvas.lineTo(drop.position.x, drop.position.y + drop.size * 1.5);
				canvas.lineWidth = drop.size * 0.5;
				canvas.lineCap = 'round';
				canvas.stroke();
			});
		}

		// Render hearts
		if (expression.hearts) {
			expression.hearts.hearts.forEach((heart) => {
				canvas.save();
				canvas.globalAlpha = heart.opacity;
				canvas.fillStyle = '#FF6B9D';
				canvas.translate(heart.position.x, heart.position.y);
				canvas.scale(heart.size, heart.size);

				// Draw heart shape
				canvas.beginPath();
				canvas.moveTo(0, 0.3);
				canvas.bezierCurveTo(0, 0, -1, -0.5, -1, -1);
				canvas.bezierCurveTo(-1, -1.5, 0, -1.3, 0, -0.5);
				canvas.bezierCurveTo(0, -1.3, 1, -1.5, 1, -1);
				canvas.bezierCurveTo(1, -0.5, 0, 0, 0, 0.3);
				canvas.closePath();
				canvas.fill();
				canvas.restore();
			});
		}

		canvas.restore();
	}
}
