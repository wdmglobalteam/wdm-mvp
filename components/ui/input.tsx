'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface InputProps extends React.ComponentProps<'input'> {
	isValid?: boolean; // true/false/null
	showValidation?: boolean;
	message?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, isValid, showValidation, message, ...props }, ref) => {
		return (
			<div className="w-full space-y-1">
				<motion.input
					ref={ref}
					type={type}
					data-slot="input"
					aria-invalid={showValidation && isValid === false}
					className={cn(
						'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-10 w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-all outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
						'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
						'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
						className
					)}
					animate={
						showValidation
							? isValid
								? { borderColor: '#00ff9f', boxShadow: '0 0 12px #00ff9f55' }
								: { borderColor: '#ff3b3b', boxShadow: '0 0 12px #ff3b3b55' }
							: {}
					}
					transition={{ duration: 0.3 }}
					{...(props as import('framer-motion').HTMLMotionProps<'input'>)}
				/>

				{/* Animated validation message */}
				<AnimatePresence>
					{showValidation && message && (
						<motion.p
							className={cn('text-xs font-medium', isValid ? 'text-emerald-400' : 'text-red-400')}
							initial={{ opacity: 0, y: -4 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -4 }}
							transition={{ duration: 0.25 }}
						>
							{message}
						</motion.p>
					)}
				</AnimatePresence>
			</div>
		);
	}
);

Input.displayName = 'Input';

export { Input };
