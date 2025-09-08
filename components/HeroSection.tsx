'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';
import { Button } from './ui/button';
import { Play, Code } from 'lucide-react';

interface Node {
	id: number;
	x: number;
	y: number;
	size: number;
	brightness: number;
	pulseSpeed: number;
	driftSpeed: number;
	connections: number[];
	baseX: number;
	baseY: number;
}

interface Particle {
	id: number;
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: number;
	opacity: number;
	life: number;
	maxLife: number;
	color: string;
}

interface AmbientParticle {
	id: number;
	x: number;
	y: number;
	size: number;
}

export function HeroSection() {
	const [nodes, setNodes] = useState<Node[]>([]);
	const [particles, setParticles] = useState<Particle[]>([]);
	const [ambientParticles] = useState<AmbientParticle[]>(() =>
		Array.from({ length: 30 }, (_, i) => ({
			id: i,
			x: Math.random() * 100,
			y: Math.random() * 100,
			size: Math.random() * 1.5 + 0.5,
		}))
	);
	const [hoveredNode, setHoveredNode] = useState<number | null>(null);
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
	const containerRef = useRef<HTMLDivElement>(null);
	const animationRef = useRef<number | null>(null);
	const lastTime = useRef<number>(0);

	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);
	const springX = useSpring(mouseX, { stiffness: 150, damping: 30 });
	const springY = useSpring(mouseY, { stiffness: 150, damping: 30 });

	// Initialize nodes with constellation-like positioning
	useEffect(() => {
		const updateDimensions = () => {
			if (containerRef.current) {
				const rect = containerRef.current.getBoundingClientRect();
				setDimensions({ width: rect.width, height: rect.height });
			}
		};

		updateDimensions();
		window.addEventListener('resize', updateDimensions);
		return () => window.removeEventListener('resize', updateDimensions);
	}, []);

	useEffect(() => {
		if (dimensions.width === 0 || dimensions.height === 0) return;

		const nodeCount = Math.min(25, Math.max(15, Math.floor(dimensions.width / 80)));
		const newNodes: Node[] = [];

		// Create galaxy-like distribution
		for (let i = 0; i < nodeCount; i++) {
			const angle = (i / nodeCount) * Math.PI * 2;
			const radius = 100 + Math.random() * 200;
			const centerX = dimensions.width / 2;
			const centerY = dimensions.height / 2;

			// Add spiral variation
			const spiralOffset = Math.sin(angle * 3) * 50;
			const x = centerX + Math.cos(angle) * (radius + spiralOffset) + (Math.random() - 0.5) * 100;
			const y = centerY + Math.sin(angle) * (radius + spiralOffset) + (Math.random() - 0.5) * 100;

			const node: Node = {
				id: i,
				x: Math.max(50, Math.min(dimensions.width - 50, x)),
				y: Math.max(50, Math.min(dimensions.height - 50, y)),
				baseX: x,
				baseY: y,
				size: 3 + Math.random() * 4,
				brightness: 0.3 + Math.random() * 0.7,
				pulseSpeed: 0.5 + Math.random() * 1.5,
				driftSpeed: 0.1 + Math.random() * 0.3,
				connections: [],
			};

			newNodes.push(node);
		}

		// Create connections between nearby nodes
		newNodes.forEach((node, i) => {
			const nearbyNodes = newNodes
				.filter((otherNode, j) => {
					if (i === j) return false;
					const distance = Math.hypot(node.x - otherNode.x, node.y - otherNode.y);
					return distance < 150;
				})
				.sort((a, b) => {
					const distA = Math.hypot(node.x - a.x, node.y - a.y);
					const distB = Math.hypot(node.x - b.x, node.y - b.y);
					return distA - distB;
				})
				.slice(0, 3);

			node.connections = nearbyNodes.map((n) => n.id);
		});

		setNodes(newNodes);
	}, [dimensions]);

	// Mouse tracking with smooth spring animation
	const handleMouseMove = useCallback(
		(e: React.MouseEvent) => {
			if (!containerRef.current) return;

			const rect = containerRef.current.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			setMousePosition({ x, y });
			mouseX.set(x);
			mouseY.set(y);
		},
		[mouseX, mouseY]
	);

	// Particle system for magical effects
	const createParticle = useCallback(
		(x: number, y: number, type: 'drift' | 'interaction' = 'drift') => {
			const colors = ['#00ff9f', '#39e6ff', '#ffffff'];
			return {
				id: Date.now() + Math.random(),
				x,
				y,
				vx: (Math.random() - 0.5) * (type === 'interaction' ? 4 : 0.5),
				vy: (Math.random() - 0.5) * (type === 'interaction' ? 4 : 0.5),
				size: type === 'interaction' ? 2 + Math.random() * 2 : 1 + Math.random(),
				opacity: type === 'interaction' ? 0.8 : 0.3 + Math.random() * 0.4,
				life: 0,
				maxLife: type === 'interaction' ? 60 : 120 + Math.random() * 180,
				color: colors[Math.floor(Math.random() * colors.length)],
			};
		},
		[]
	);

	// Animation loop for living movement
	const animate = useCallback(
		(currentTime: number) => {
			if (lastTime.current === 0) lastTime.current = currentTime;
			// const deltaTime = currentTime - lastTime.current;
			lastTime.current = currentTime;

			setNodes((prevNodes) =>
				prevNodes.map((node) => {
					// Gentle orbital drift
					const time = currentTime * 0.0005;
					const driftX = Math.sin(time * node.driftSpeed + node.id) * 15;
					const driftY = Math.cos(time * node.driftSpeed * 0.7 + node.id) * 10;

					// Mouse attraction effect
					const distanceToMouse = Math.hypot(mousePosition.x - node.x, mousePosition.y - node.y);
					const attractionStrength = Math.max(0, 1 - distanceToMouse / 200);
					const attractionX = attractionStrength * (mousePosition.x - node.x) * 0.02;
					const attractionY = attractionStrength * (mousePosition.y - node.y) * 0.02;

					return {
						...node,
						x: node.baseX + driftX + attractionX,
						y: node.baseY + driftY + attractionY,
						brightness: node.brightness + Math.sin(time * node.pulseSpeed) * 0.2,
					};
				})
			);

			// Update particles
			setParticles((prevParticles) => {
				const newParticles = prevParticles
					.map((particle) => ({
						...particle,
						x: particle.x + particle.vx,
						y: particle.y + particle.vy,
						vx: particle.vx * 0.99,
						vy: particle.vy * 0.99,
						life: particle.life + 1,
						opacity: particle.opacity * (1 - particle.life / particle.maxLife),
					}))
					.filter((particle) => particle.life < particle.maxLife);

				// Add ambient drifting particles
				if (Math.random() < 0.03 && dimensions.width > 0) {
					const edge = Math.floor(Math.random() * 4);
					let x, y;

					switch (edge) {
						case 0:
							x = Math.random() * dimensions.width;
							y = -10;
							break;
						case 1:
							x = dimensions.width + 10;
							y = Math.random() * dimensions.height;
							break;
						case 2:
							x = Math.random() * dimensions.width;
							y = dimensions.height + 10;
							break;
						default:
							x = -10;
							y = Math.random() * dimensions.height;
							break;
					}

					newParticles.push(createParticle(x, y, 'drift'));
				}

				return newParticles;
			});

			animationRef.current = requestAnimationFrame(animate);
		},
		[mousePosition, dimensions, createParticle]
	);

	useEffect(() => {
		animationRef.current = requestAnimationFrame(animate);
		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		};
	}, [animate]);

	// Node interaction effects
	const handleNodeHover = (nodeId: number) => {
		setHoveredNode(nodeId);
		const node = nodes.find((n) => n.id === nodeId);
		if (node) {
			// Create interaction particles
			for (let i = 0; i < 5; i++) {
				setParticles((prev) => [
					...prev,
					createParticle(
						node.x + (Math.random() - 0.5) * 20,
						node.y + (Math.random() - 0.5) * 20,
						'interaction'
					),
				]);
			}
		}
	};

	return (
		<section className="relative min-h-screen flex items-center justify-center overflow-hidden">
			{/* Dynamic Constellation Background */}
			<div
				ref={containerRef}
				className="absolute inset-0 cursor-none"
				onMouseMove={handleMouseMove}
				onMouseLeave={() => setHoveredNode(null)}
			>
				{/* Ambient Reactive Particles */}
				{ambientParticles.map((p, i) => (
					<motion.div
						key={p.id}
						className="absolute bg-white/20 rounded-full"
						style={{
							width: p.size * 2,
							height: p.size * 2,
							left: `${p.x}%`,
							top: `${p.y}%`,
						}}
						animate={{
							x: [
								-mousePosition.x * 0.005 + Math.sin(i) * 5,
								mousePosition.x * 0.005 + Math.sin(i + 1) * 5,
							],
							y: [
								-mousePosition.y * 0.005 + Math.cos(i) * 5,
								mousePosition.y * 0.005 + Math.cos(i + 1) * 5,
							],
							opacity: [0.2, 0.8, 0.2],
							scale: [1, 1.5, 1],
						}}
						transition={{
							duration: 4 + Math.random() * 3,
							repeat: Infinity,
							repeatType: 'mirror',
							delay: Math.random() * 2,
						}}
					/>
				))}

				{/* Connection lines */}
				<svg className="absolute inset-0 w-full h-full pointer-events-none">
					<defs>
						<linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" stopColor="#00ff9f" stopOpacity="0.1" />
							<stop offset="50%" stopColor="#39e6ff" stopOpacity="0.3" />
							<stop offset="100%" stopColor="#00ff9f" stopOpacity="0.1" />
						</linearGradient>
					</defs>

					{nodes.map((node) =>
						node.connections.map((connectionId) => {
							const connectedNode = nodes.find((n) => n.id === connectionId);
							if (!connectedNode) return null;

							const isHighlighted = hoveredNode === node.id || hoveredNode === connectionId;

							return (
								<motion.line
									key={`${node.id}-${connectionId}`}
									x1={node.x}
									y1={node.y}
									x2={connectedNode.x}
									y2={connectedNode.y}
									stroke="url(#connectionGradient)"
									strokeWidth={isHighlighted ? 2 : 1}
									initial={{ pathLength: 0 }}
									animate={{
										pathLength: 1,
										strokeOpacity: isHighlighted ? 0.8 : 0.3,
									}}
									transition={{ duration: 1.5, ease: 'easeInOut' }}
								/>
							);
						})
					)}
				</svg>

				{/* Constellation Nodes */}
				{nodes.map((node) => (
					<motion.div
						key={node.id}
						className="absolute pointer-events-auto cursor-pointer"
						style={{
							left: node.x - node.size,
							top: node.y - node.size,
							width: node.size * 2,
							height: node.size * 2,
						}}
						onHoverStart={() => handleNodeHover(node.id)}
						onHoverEnd={() => setHoveredNode(null)}
						whileHover={{ scale: 1.5 }}
						animate={{
							opacity: node.brightness,
							scale: hoveredNode === node.id ? 1.8 : 1,
						}}
						transition={{ type: 'spring', stiffness: 300, damping: 20 }}
					>
						<div
							className="w-full h-full rounded-full relative"
							style={{
								background: `radial-gradient(circle, ${
									node.id % 2 === 0 ? '#00ff9f' : '#39e6ff'
								} 0%, transparent 70%)`,
								boxShadow:
									hoveredNode === node.id
										? `0 0 20px ${node.id % 2 === 0 ? '#00ff9f' : '#39e6ff'}`
										: `0 0 8px ${node.id % 2 === 0 ? '#00ff9f40' : '#39e6ff40'}`,
							}}
						>
							{hoveredNode === node.id && (
								<motion.div
									className="absolute inset-0 rounded-full border border-white/30"
									initial={{ scale: 1, opacity: 0 }}
									animate={{ scale: 3, opacity: [0, 0.5, 0] }}
									transition={{ duration: 1, repeat: Infinity }}
								/>
							)}
						</div>
					</motion.div>
				))}

				{/* Magical Particles */}
				{particles.map((particle) => (
					<motion.div
						key={particle.id}
						className="absolute pointer-events-none rounded-full"
						style={{
							left: particle.x,
							top: particle.y,
							width: particle.size,
							height: particle.size,
							backgroundColor: particle.color,
							opacity: particle.opacity,
							boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
						}}
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						exit={{ scale: 0, opacity: 0 }}
					/>
				))}

				{/* Interactive Mouse Cursor Effect */}
				<motion.div
					className="absolute w-32 h-32 pointer-events-none rounded-full"
					style={{
						left: springX,
						top: springY,
						background: 'radial-gradient(circle, rgba(0,255,159,0.1) 0%, transparent 70%)',
						transform: 'translate(-50%, -50%)',
						filter: 'blur(20px)',
					}}
					animate={{
						scale: hoveredNode ? 1.5 : 1,
						opacity: hoveredNode ? 0.6 : 0.3,
					}}
				/>
			</div>

			{/* Hero Content */}
			<div className="relative z-10 text-center max-w-4xl mx-auto px-4">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
				>
					<motion.h1
						className="text-4xl md:text-6xl lg:text-7xl text-white mb-6 relative"
						animate={{
							textShadow: [
								'0 0 20px rgba(0,255,159,0.3)',
								'0 0 30px rgba(57,230,255,0.4)',
								'0 0 20px rgba(0,255,159,0.3)',
							],
						}}
						transition={{ duration: 4, repeat: Infinity }}
					>
						Master Web Development
						<motion.span
							className="absolute -top-4 -right-4 text-2xl"
							animate={{
								rotate: [0, 10, -10, 0],
								scale: [1, 1.1, 1],
							}}
							transition={{ duration: 3, repeat: Infinity }}
						>
							✨
						</motion.span>
					</motion.h1>

					<motion.p
						className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.8, delay: 0.5 }}
					>
						Through <span className="text-[#00ff9f]">Wisdom</span>,
						<span className="text-[#39e6ff]"> Design</span>, and
						<span className="text-[#00ff9f]"> Mastery</span>
					</motion.p>
				</motion.div>

				<motion.div
					className="flex flex-col sm:flex-row gap-4 justify-center items-center"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.8 }}
				>
					<Link href="/auth">
						<Button
							size="lg"
							className="bg-gradient-to-r from-[#00ff9f] to-[#39e6ff] text-black hover:shadow-lg hover:shadow-[#00ff9f]/25 transition-all duration-300 group relative overflow-hidden"
						>
							<motion.div
								className="absolute inset-0 bg-white/20"
								initial={{ x: '-100%' }}
								whileHover={{ x: '100%' }}
								transition={{ duration: 0.6 }}
							/>
							<Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
							Start Learning
						</Button>
					</Link>

					<Button
						variant="outline"
						size="lg"
						className="border-[#39e6ff]/50 text-[#39e6ff] hover:bg-[#39e6ff]/10 hover:border-[#39e6ff] transition-all duration-300 group"
					>
						<Code className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
						View Curriculum
					</Button>
				</motion.div>

				{/* Floating metrics */}
				<motion.div
					className="flex justify-center gap-8 mt-12 text-center"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 1.2 }}
				>
					{[
						{ value: '500+', label: 'Students' },
						{ value: '50+', label: 'Projects' },
						{ value: '98%', label: 'Success Rate' },
					].map((metric, index) => (
						<motion.div
							key={metric.label}
							className="relative"
							whileHover={{ scale: 1.05 }}
							animate={{
								y: Math.sin(Date.now() * 0.001 + index) * 2,
							}}
							transition={{ duration: 2, repeat: Infinity }}
						>
							<div className="text-2xl md:text-3xl text-[#00ff9f] mb-1">{metric.value}</div>
							<div className="text-sm text-gray-400">{metric.label}</div>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}
