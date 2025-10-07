/**
 * PHYSICS ENGINE - REALISTIC PHYSICS SIMULATION
 *
 * Handles:
 * - Gravity and forces
 * - Collision detection and response
 * - Spring constraints
 * - Pendulum motion
 * - Elastic deformation
 *
 * @version 3.0.0
 */

import type { PhysicsWorld, PhysicsBody, PhysicsConstraint, Point } from './types';
import { normalize, scale, subtract } from '../utils/geometry';

export interface PhysicsEngineOptions {
	size: number;
	gravity?: Point;
	damping?: number;
	iterations?: number;
}

export class PhysicsEngine {
	private world: PhysicsWorld;
	private size: number;
	private damping: number;
	private iterations: number;

	constructor(options: PhysicsEngineOptions) {
		this.size = options.size;
		this.damping = options.damping || 0.99;
		this.iterations = options.iterations || 8;

		this.world = {
			gravity: options.gravity || { x: 0, y: 0 },
			wind: { x: 0, y: 0 },
			bodies: new Map(),
			constraints: [],
			timeScale: 1,
		};
	}

	/**
	 * Create a new physics body
	 */
	createBody(id: string, config: Partial<PhysicsBody>): PhysicsBody {
		const body: PhysicsBody = {
			id,
			position: config.position || { x: this.size / 2, y: this.size / 2 },
			velocity: config.velocity || { x: 0, y: 0 },
			acceleration: config.acceleration || { x: 0, y: 0 },
			rotation: config.rotation || 0,
			angularVelocity: config.angularVelocity || 0,
			mass: config.mass || 1,
			friction: config.friction || 0.1,
			bounce: config.bounce || 0.8,
			fixed: config.fixed || false,
		};

		this.world.bodies.set(id, body);
		return body;
	}

	/**
	 * Add a constraint between bodies
	 */
	addConstraint(constraint: PhysicsConstraint): void {
		this.world.constraints.push(constraint);
	}

	/**
	 * Apply force to a body
	 */
	applyForce(bodyId: string, force: Point): void {
		const body = this.world.bodies.get(bodyId);
		if (!body || body.fixed) return;

		body.acceleration.x += force.x / body.mass;
		body.acceleration.y += force.y / body.mass;
	}

	/**
	 * Apply impulse to a body
	 */
	applyImpulse(bodyId: string, impulse: Point): void {
		const body = this.world.bodies.get(bodyId);
		if (!body || body.fixed) return;

		body.velocity.x += impulse.x / body.mass;
		body.velocity.y += impulse.y / body.mass;
	}

	/**
	 * Set gravity
	 */
	setGravity(gravity: Point): void {
		this.world.gravity = gravity;
	}

	/**
	 * Set wind
	 */
	setWind(wind: Point): void {
		this.world.wind = wind;
	}

	/**
	 * Update physics simulation
	 */
	update(deltaTime: number): void {
		const dt = deltaTime * this.world.timeScale;

		// Update velocities and positions
		this.world.bodies.forEach((body) => {
			if (body.fixed) return;

			// Apply gravity
			body.acceleration.x += this.world.gravity.x;
			body.acceleration.y += this.world.gravity.y;

			// Apply wind
			body.acceleration.x += this.world.wind.x;
			body.acceleration.y += this.world.wind.y;

			// Update velocity
			body.velocity.x += body.acceleration.x * dt;
			body.velocity.y += body.acceleration.y * dt;

			// Apply friction
			body.velocity.x *= Math.pow(1 - body.friction, dt);
			body.velocity.y *= Math.pow(1 - body.friction, dt);

			// Apply damping
			body.velocity.x *= Math.pow(this.damping, dt);
			body.velocity.y *= Math.pow(this.damping, dt);

			// Update position
			body.position.x += body.velocity.x * dt;
			body.position.y += body.velocity.y * dt;

			// Update rotation
			body.rotation += body.angularVelocity * dt;

			// Reset acceleration
			body.acceleration.x = 0;
			body.acceleration.y = 0;

			// Boundary collision
			this.handleBoundaryCollision(body);
		});

		// Solve constraints
		for (let i = 0; i < this.iterations; i++) {
			this.world.constraints.forEach((constraint) => {
				this.solveConstraint(constraint);
			});
		}
	}

	/**
	 * Handle collision with boundaries
	 */
	private handleBoundaryCollision(body: PhysicsBody): void {
		const radius = 10; // Assume body has radius of 10

		// Left boundary
		if (body.position.x - radius < 0) {
			body.position.x = radius;
			body.velocity.x *= -body.bounce;
		}

		// Right boundary
		if (body.position.x + radius > this.size) {
			body.position.x = this.size - radius;
			body.velocity.x *= -body.bounce;
		}

		// Top boundary
		if (body.position.y - radius < 0) {
			body.position.y = radius;
			body.velocity.y *= -body.bounce;
		}

		// Bottom boundary
		if (body.position.y + radius > this.size) {
			body.position.y = this.size - radius;
			body.velocity.y *= -body.bounce;
		}
	}

	/**
	 * Solve a constraint
	 */
	private solveConstraint(constraint: PhysicsConstraint): void {
		switch (constraint.type) {
			case 'spring':
				this.solveSpringConstraint(constraint);
				break;
			case 'distance':
				this.solveDistanceConstraint(constraint);
				break;
			case 'pin':
				this.solvePinConstraint(constraint);
				break;
			case 'rope':
				this.solveRopeConstraint(constraint);
				break;
		}
	}

	/**
	 * Solve spring constraint
	 */
	private solveSpringConstraint(constraint: PhysicsConstraint): void {
		const bodyA = this.world.bodies.get(constraint.bodyA);
		const bodyB = constraint.bodyB ? this.world.bodies.get(constraint.bodyB) : null;

		if (!bodyA) return;

		const targetPos = bodyB ? bodyB.position : constraint.point!;
		const delta = subtract(targetPos, bodyA.position);
		const dist = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
		const restLength = constraint.length || 0;
		const displacement = dist - restLength;

		if (dist === 0) return;

		const stiffness = constraint.stiffness || 0.1;
		const damping = constraint.damping || 0.9;

		// Spring force
		const force = scale(normalize(delta), displacement * stiffness);

		// Apply to body A
		if (!bodyA.fixed) {
			bodyA.velocity.x += force.x * damping;
			bodyA.velocity.y += force.y * damping;
		}

		// Apply opposite force to body B
		if (bodyB && !bodyB.fixed) {
			bodyB.velocity.x -= force.x * damping;
			bodyB.velocity.y -= force.y * damping;
		}
	}

	/**
	 * Solve distance constraint
	 */
	private solveDistanceConstraint(constraint: PhysicsConstraint): void {
		const bodyA = this.world.bodies.get(constraint.bodyA);
		const bodyB = constraint.bodyB ? this.world.bodies.get(constraint.bodyB) : null;

		if (!bodyA) return;

		const targetPos = bodyB ? bodyB.position : constraint.point!;
		const delta = subtract(targetPos, bodyA.position);
		const dist = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
		const restLength = constraint.length || 0;

		if (dist === 0 || dist === restLength) return;

		const diff = (dist - restLength) / dist;
		const offset = scale(delta, diff * 0.5);

		// Apply correction
		if (!bodyA.fixed) {
			bodyA.position.x += offset.x;
			bodyA.position.y += offset.y;
		}

		if (bodyB && !bodyB.fixed) {
			bodyB.position.x -= offset.x;
			bodyB.position.y -= offset.y;
		}
	}

	/**
	 * Solve pin constraint
	 */
	private solvePinConstraint(constraint: PhysicsConstraint): void {
		const body = this.world.bodies.get(constraint.bodyA);
		if (!body || body.fixed) return;

		const point = constraint.point!;
		body.position.x = point.x;
		body.position.y = point.y;
		body.velocity.x = 0;
		body.velocity.y = 0;
	}

	/**
	 * Solve rope constraint (max distance)
	 */
	private solveRopeConstraint(constraint: PhysicsConstraint): void {
		const bodyA = this.world.bodies.get(constraint.bodyA);
		const bodyB = constraint.bodyB ? this.world.bodies.get(constraint.bodyB) : null;

		if (!bodyA) return;

		const targetPos = bodyB ? bodyB.position : constraint.point!;
		const delta = subtract(targetPos, bodyA.position);
		const dist = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
		const maxLength = constraint.length || 100;

		if (dist <= maxLength) return;

		const diff = (dist - maxLength) / dist;
		const offset = scale(delta, diff * 0.5);

		// Apply correction
		if (!bodyA.fixed) {
			bodyA.position.x += offset.x;
			bodyA.position.y += offset.y;
		}

		if (bodyB && !bodyB.fixed) {
			bodyB.position.x -= offset.x;
			bodyB.position.y -= offset.y;
		}
	}

	/**
	 * Get physics world
	 */
	getWorld(): PhysicsWorld {
		return this.world;
	}

	/**
	 * Get body by ID
	 */
	getBody(id: string): PhysicsBody | undefined {
		return this.world.bodies.get(id);
	}

	/**
	 * Remove body
	 */
	removeBody(id: string): void {
		this.world.bodies.delete(id);
		this.world.constraints = this.world.constraints.filter((c) => c.bodyA !== id && c.bodyB !== id);
	}

	/**
	 * Clear all bodies and constraints
	 */
	clear(): void {
		this.world.bodies.clear();
		this.world.constraints = [];
	}
}
