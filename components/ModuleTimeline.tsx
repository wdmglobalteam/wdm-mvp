'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Lock, Play } from 'lucide-react';

const modules = [
	{
		id: 1,
		title: 'HTML Basics',
		lessons: 12,
		mastery: 100,
		status: 'completed',
		preview: 'Semantic elements, forms, accessibility',
	},
	{
		id: 2,
		title: 'CSS Styling',
		lessons: 18,
		mastery: 85,
		status: 'active',
		preview: 'Flexbox, Grid, responsive design',
	},
	{
		id: 3,
		title: 'CSS Animations',
		lessons: 8,
		mastery: 45,
		status: 'active',
		preview: 'Keyframes, transitions, transforms',
	},
	{
		id: 4,
		title: 'JavaScript Intro',
		lessons: 15,
		mastery: 0,
		status: 'locked',
		preview: 'Variables, functions, DOM manipulation',
	},
	{
		id: 5,
		title: 'JS Events',
		lessons: 10,
		mastery: 0,
		status: 'locked',
		preview: 'Event handling, user interactions',
	},
	{
		id: 6,
		title: 'Advanced JS',
		lessons: 20,
		mastery: 0,
		status: 'locked',
		preview: 'Async/await, promises, APIs',
	},
];

export function ModuleTimeline() {
	const [hoveredModule, setHoveredModule] = useState<number | null>(null);

	const getStatusIcon = (status: string, mastery: number) => {
		if (status === 'completed') return CheckCircle;
		if (status === 'active') return mastery > 0 ? Play : Circle;
		return Lock;
	};

	const getStatusColor = (status: string) => {
		if (status === 'completed') return '#00ff9f';
		if (status === 'active') return '#39e6ff';
		return '#666';
	};

	return (
		<section className="py-20 relative overflow-hidden">
			<div className="container mx-auto px-4">
				<motion.div
					className="text-center mb-16"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
				>
					<h2 className="text-3xl md:text-5xl text-white mb-4">Learning Journey</h2>
					<p className="text-gray-300 text-lg max-w-2xl mx-auto">
						Follow the structured path from foundations to mastery
					</p>
				</motion.div>

				{/* Timeline Container */}
				<div className="relative timeline-mask-container">
					{/* Horizontal scroll container */}
					<div
						className="overflow-x-auto pb-8 scrollbar-hide timeline-scroll-container"
						style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
					>
						<div className="flex items-center gap-4 min-w-max px-40 pt-24">
							{modules.map((module, index) => {
								const StatusIcon = getStatusIcon(module.status, module.mastery);
								const isLast = index === modules.length - 1;

								return (
									<div key={module.id} className="flex items-center">
										{/* Module Node */}
										<motion.div
											className="relative flex flex-col items-center"
											onMouseEnter={() => setHoveredModule(module.id)}
											onMouseLeave={() => setHoveredModule(null)}
											initial={{ opacity: 0, scale: 0.8 }}
											whileInView={{ opacity: 1, scale: 1 }}
											viewport={{ once: true }}
											transition={{ duration: 0.5, delay: index * 0.1 }}
										>
											{/* Tooltip */}
											{hoveredModule === module.id && (
												<motion.div
													className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-black/95 border border-[#00ff9f]/50 rounded-lg p-3 min-w-48 z-50 shadow-2xl backdrop-blur-sm"
													style={{
														boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 255, 159, 0.3)',
													}}
													initial={{ opacity: 0, y: 10, scale: 0.9 }}
													animate={{ opacity: 1, y: 0, scale: 1 }}
													exit={{ opacity: 0, y: 10, scale: 0.9 }}
												>
													<div className="text-white text-sm">
														<div className="font-medium mb-1">{module.title}</div>
														<div className="text-gray-300 text-xs mb-2">
															{module.lessons} lessons • {module.mastery}% mastery
														</div>
														<div className="text-gray-400 text-xs">
															{module.status === 'locked' ? 'Coming Soon: ' : ''}
															{module.preview}
														</div>

														{module.status === 'locked' && (
															<motion.div
																className="mt-2 text-xs text-[#39e6ff] flex items-center gap-1"
																animate={{ opacity: [0.5, 1, 0.5] }}
																transition={{ duration: 1.5, repeat: Infinity }}
															>
																<div className="w-2 h-2 bg-[#39e6ff] rounded-full animate-pulse" />
																Preview Available
															</motion.div>
														)}
													</div>

													{/* Arrow */}
													<div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#00ff9f]/50" />
												</motion.div>
											)}

											{/* Glow Effect */}
											{(module.status === 'active' || hoveredModule === module.id) && (
												<motion.div
													className="absolute w-16 h-16 rounded-full"
													style={{
														background: `radial-gradient(circle, ${getStatusColor(
															module.status
														)}40 0%, transparent 70%)`,
													}}
													animate={{
														scale: [1, 1.2, 1],
														opacity: [0.5, 0.8, 0.5],
													}}
													transition={{
														duration: 2,
														repeat: Infinity,
														ease: 'easeInOut',
													}}
												/>
											)}

											{/* Main Node */}
											<motion.div
												className={`relative w-12 h-12 rounded-full border-2 flex items-center justify-center cursor-pointer z-10 ${
													module.status === 'locked' ? 'bg-gray-800 border-gray-600' : 'bg-gray-900 border-2'
												}`}
												style={{
													borderColor: getStatusColor(module.status),
													backgroundColor:
														module.status === 'completed' ? getStatusColor(module.status) + '20' : 'transparent',
												}}
												whileHover={module.status !== 'locked' ? { scale: 1.1 } : { scale: 1.05 }}
												whileTap={module.status !== 'locked' ? { scale: 0.95 } : {}}
												animate={
													module.status === 'locked' && hoveredModule === module.id
														? {
																x: [-2, 2, -2, 2, 0],
														  }
														: {}
												}
												transition={{ duration: 0.5 }}
											>
												<StatusIcon className="w-5 h-5" style={{ color: getStatusColor(module.status) }} />

												{/* Mastery Ring */}
												{module.mastery > 0 && (
													<svg className="absolute inset-0 w-full h-full -rotate-90">
														<circle
															cx="50%"
															cy="50%"
															r="22"
															stroke="rgba(255,255,255,0.1)"
															strokeWidth="2"
															fill="transparent"
														/>
														<motion.circle
															cx="50%"
															cy="50%"
															r="22"
															stroke={getStatusColor(module.status)}
															strokeWidth="2"
															fill="transparent"
															strokeDasharray={`${2 * Math.PI * 22}`}
															strokeDashoffset={`${2 * Math.PI * 22 * (1 - module.mastery / 100)}`}
															strokeLinecap="round"
															initial={{ strokeDashoffset: `${2 * Math.PI * 22}` }}
															animate={{ strokeDashoffset: `${2 * Math.PI * 22 * (1 - module.mastery / 100)}` }}
															transition={{ duration: 1, delay: index * 0.2 }}
														/>
													</svg>
												)}
											</motion.div>

											{/* Module Title */}
											<div className="mt-3 text-center">
												<h3 className="text-white text-sm font-medium">{module.title}</h3>
												<p className="text-gray-400 text-xs mt-1">{module.lessons} lessons</p>
											</div>
										</motion.div>

										{/* Connection Line */}
										{!isLast && (
											<motion.div
												className="flex-1 h-0.5 mx-4 relative"
												style={{ minWidth: '80px' }}
												initial={{ scaleX: 0 }}
												whileInView={{ scaleX: 1 }}
												viewport={{ once: true }}
												transition={{ duration: 0.8, delay: index * 0.1 }}
											>
												{/* Base line */}
												<div className="absolute inset-0 bg-gray-600 rounded-full" />

												{/* Animated line for active connections */}
												{modules[index + 1].status !== 'locked' && (
													<motion.div
														className="absolute inset-0 bg-gradient-to-r from-[#00ff9f] to-[#39e6ff] rounded-full"
														initial={{ scaleX: 0 }}
														animate={{ scaleX: 1 }}
														transition={{ duration: 1, delay: index * 0.2 + 0.5 }}
													/>
												)}

												{/* Shimmer effect for locked connections */}
												{modules[index + 1].status === 'locked' && (
													<motion.div
														className="absolute inset-0 bg-gradient-to-r from-transparent via-[#39e6ff]/30 to-transparent rounded-full"
														animate={{
															x: ['-100%', '200%'],
														}}
														transition={{
															duration: 3,
															repeat: Infinity,
															repeatDelay: 2,
															ease: 'easeInOut',
														}}
													/>
												)}
											</motion.div>
										)}
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
