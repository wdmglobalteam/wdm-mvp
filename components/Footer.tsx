'use client';

import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin, Mail, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const footerLinks = {
	Learn: ['Getting Started', 'Curriculum', 'Practice Labs', 'Certifications'],
	Community: ['Discord', 'Forums', 'Study Groups', 'Mentorship'],
	Resources: ['Documentation', 'Blog', 'Tutorials', 'API Reference'],
	Company: ['About', 'Careers', 'Privacy', 'Terms'],
};

const socialLinks = [
	{ icon: Github, href: '#', label: 'Follow on GitHub' },
	{ icon: Twitter, href: '#', label: 'Follow on Twitter' },
	{ icon: Linkedin, href: '#', label: 'Connect on LinkedIn' },
	{ icon: Mail, href: '#', label: 'Send us an email' },
];

export function Footer() {
	return (
		<footer className="relative overflow-hidden bg-gradient-to-t from-gray-900/50 to-transparent">
			{/* Breathing gradient border */}
			<motion.div
				className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ff9f] to-transparent"
				animate={{
					opacity: [0.3, 0.8, 0.3],
				}}
				transition={{
					duration: 3,
					repeat: Infinity,
					ease: 'easeInOut',
				}}
			/>

			<div className="container mx-auto px-4 py-16">
				{/* Newsletter Section */}
				<motion.div
					className="text-center mb-16"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
				>
					<h3 className="text-2xl text-white mb-4">Stay Updated</h3>
					<p className="text-gray-300 mb-8 max-w-md mx-auto">
						Get the latest learning resources and platform updates
					</p>

					<div className="flex max-w-md mx-auto gap-2">
						<motion.div className="flex-1">
							<Input
								type="email"
								placeholder="Enter your email"
								className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-[#00ff9f] transition-colors duration-300"
							/>
						</motion.div>
						<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
							<Button className="bg-[#00ff9f] text-black hover:bg-[#00ff9f]/90 border-[#00ff9f] hover:shadow-[0_0_20px_rgba(0,255,159,0.5)] transition-all duration-300">
								<ArrowRight className="w-4 h-4" />
							</Button>
						</motion.div>
					</div>
				</motion.div>

				{/* Links Grid */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
					{Object.entries(footerLinks).map(([category, links], categoryIndex) => (
						<motion.div
							key={category}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
						>
							<h4 className="text-white mb-4">{category}</h4>
							<ul className="space-y-3">
								{links.map((link) => (
									<li key={link}>
										<motion.a
											href="#"
											className="text-gray-400 hover:text-[#00ff9f] transition-colors duration-300 text-sm relative inline-block"
											whileHover={{ x: 5 }}
											transition={{ duration: 0.2 }}
										>
											{link}
											<motion.div
												className="absolute bottom-0 left-0 w-0 h-px bg-[#00ff9f]"
												whileHover={{ width: '100%' }}
												transition={{ duration: 0.3 }}
											/>
										</motion.a>
									</li>
								))}
							</ul>
						</motion.div>
					))}
				</div>

				{/* Social Links & Copyright */}
				<motion.div
					className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-700"
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 0.4 }}
				>
					{/* Logo & Copyright */}
					<div className="flex items-center gap-4 mb-6 md:mb-0">
						<motion.div
							className="text-2xl text-white"
							whileHover={{ scale: 1.05 }}
							transition={{ duration: 0.2 }}
						>
							<span className="bg-gradient-to-r from-[#00ff9f] to-[#39e6ff] bg-clip-text text-transparent">
								WDM
							</span>
						</motion.div>
						<div className="text-gray-400 text-sm">
							© 2024 Wisdom Design Mastery. All rights reserved.
						</div>
					</div>

					{/* Social Icons */}
					<div className="flex items-center gap-4">
						{socialLinks.map((social, index) => {
							const IconComponent = social.icon;

							return (
								<motion.a
									key={index}
									href={social.href}
									aria-label={social.label}
									className="w-10 h-10 bg-gray-800/50 border border-gray-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#00ff9f] hover:border-[#00ff9f] transition-all duration-300"
									whileHover={{
										scale: 1.1,
										boxShadow: '0 0 20px rgba(0, 255, 159, 0.3)',
									}}
									whileTap={{ scale: 0.95 }}
									initial={{ opacity: 0, y: 10 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.3, delay: index * 0.05 }}
								>
									<IconComponent className="w-4 h-4" />
								</motion.a>
							);
						})}
					</div>
				</motion.div>

				{/* Extra breathing space */}
				<div className="h-8" />
			</div>
		</footer>
	);
}
