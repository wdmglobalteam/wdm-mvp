'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface Node {
	id: number;
	x: number; // percentage
	y: number; // percentage
}

export function AuthBackground() {
	const [nodes, setNodes] = useState<Node[]>([]);
	const [mouse, setMouse] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
	const containerRef = useRef<HTMLDivElement>(null);

	// Motion values for cursor aura (smooth follow)
	const mvX = useMotionValue(0);
	const mvY = useMotionValue(0);
	const springX = useSpring(mvX, { stiffness: 120, damping: 25 });
	const springY = useSpring(mvY, { stiffness: 120, damping: 25 });

	useEffect(() => {
		// Generate constellation nodes
		const newNodes: Node[] = Array.from({ length: 15 }, (_, i) => ({
			id: i,
			x: Math.random() * 100,
			y: Math.random() * 100,
		}));
		setNodes(newNodes);
	}, []);

	const handleMouseMove = useCallback(
		(e: React.MouseEvent) => {
			if (!containerRef.current) return;
			const rect = containerRef.current.getBoundingClientRect();
			const x = ((e.clientX - rect.left) / rect.width) * 100;
			const y = ((e.clientY - rect.top) / rect.height) * 100;
			setMouse({ x, y });
			mvX.set(e.clientX - rect.left);
			mvY.set(e.clientY - rect.top);
		},
		[mvX, mvY]
	);

	return (
		<div
			ref={containerRef}
			onMouseMove={handleMouseMove}
			className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black overflow-hidden"
		>
			{/* Connection lines */}
			<svg className="absolute inset-0 w-full h-full pointer-events-none">
				<defs>
					<linearGradient id="authLineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#00ff9f" stopOpacity="0.15" />
						<stop offset="100%" stopColor="#39e6ff" stopOpacity="0.15" />
					</linearGradient>
				</defs>

				{nodes.map((node, i) =>
					nodes.map((other, j) => {
						if (i >= j) return null;
						const dx = node.x - other.x;
						const dy = node.y - other.y;
						const distance = Math.sqrt(dx * dx + dy * dy);
						if (distance < 20) {
							const mouseDist = Math.sqrt(
								Math.pow(mouse.x - (node.x + other.x) / 2, 2) +
									Math.pow(mouse.y - (node.y + other.y) / 2, 2)
							);
							const glow = mouseDist < 25 ? 0.4 : 0.15;

							return (
								<motion.line
									key={`${node.id}-${other.id}`}
									x1={`${node.x}%`}
									y1={`${node.y}%`}
									x2={`${other.x}%`}
									y2={`${other.y}%`}
									stroke="url(#authLineGradient)"
									strokeWidth="1"
									initial={{ opacity: 0 }}
									animate={{ opacity: [0.05, glow, 0.05] }}
									transition={{
										duration: 5,
										repeat: Infinity,
										delay: Math.random() * 2,
									}}
								/>
							);
						}
						return null;
					})
				)}
			</svg>

			{/* Pulsing dots */}
			{nodes.map((node) => {
				const dx = mouse.x - node.x;
				const dy = mouse.y - node.y;
				const dist = Math.sqrt(dx * dx + dy * dy);
				const attraction = Math.max(0, 1 - dist / 80) * 2;

				return (
					<motion.div
						key={node.id}
						className="absolute rounded-full"
						style={{
							width: 5,
							height: 5,
							top: `${node.y}%`,
							left: `${node.x}%`,
							background: 'radial-gradient(circle, #00ff9f, #39e6ff)',
							boxShadow: '0 0 6px rgba(0,255,159,0.4)',
						}}
						animate={{
							x: dx * 0.02 * attraction,
							y: dy * 0.02 * attraction,
							opacity: [0.3, 0.8, 0.3],
							scale: [1, 1.3, 1],
						}}
						transition={{
							duration: 6 + Math.random() * 3,
							repeat: Infinity,
						}}
					/>
				);
			})}

			{/* Cursor aura */}
			<motion.div
				className="absolute w-40 h-40 pointer-events-none rounded-full"
				style={{
					left: springX,
					top: springY,
					transform: 'translate(-50%, -50%)',
					background:
						'radial-gradient(circle, rgba(0,255,159,0.15) 0%, rgba(57,230,255,0.1) 40%, transparent 70%)',
					filter: 'blur(40px)',
				}}
				animate={{
					scale: [1, 1.2, 1],
					opacity: [0.3, 0.5, 0.3],
				}}
				transition={{
					duration: 4,
					repeat: Infinity,
				}}
			/>
		</div>
	);
}
