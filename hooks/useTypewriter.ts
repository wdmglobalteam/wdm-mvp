// useTypewriter.ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

type UseTypewriterOptions = {
	/** milliseconds per character (base) */
	baseSpeed?: number;
	/** +/- jitter in ms applied to baseSpeed for more human typing */
	jitter?: number;
	/** ms to wait after finishing typing before calling onComplete */
	pauseOnComplete?: number;
	/** cursor character shown (rendered separately; hook doesn't include cursor in `text`) */
	cursor?: string;
	/** callback when typing completes */
	onComplete?: () => void;
	/** if true, clicking while typing will restart from the beginning (default true) */
	restartOnNew?: boolean;
};

export function useTypewriter(opts?: UseTypewriterOptions) {
	const {
		baseSpeed = 40,
		jitter = 20,
		pauseOnComplete = 700,
		cursor = '|',
		onComplete,
		restartOnNew = true,
	} = opts ?? {};

	// Respect user's reduced-motion preference via framer-motion helper (works reactively).
	// If you prefer not to import framer-motion, you can fallback to window.matchMedia.
	const shouldReduceMotion = useReducedMotion();

	const [text, setText] = useState<string>(''); // displayed partial text
	const [isTyping, setIsTyping] = useState<boolean>(false);

	const targetRef = useRef<string>(''); // full text we're typing towards
	const indexRef = useRef<number>(0); // current index into target
	const mountedRef = useRef<boolean>(true); // component mounted guard
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// cleanup on unmount
	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, []);

	const clearTimer = useCallback(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	const computeDelay = useCallback(() => {
		if (shouldReduceMotion) return 0;
		const jitterVal = Math.floor((Math.random() - 0.5) * 2 * jitter);
		const delay = Math.max(8, Math.round(baseSpeed + jitterVal));
		return delay;
	}, [baseSpeed, jitter, shouldReduceMotion]);

	// finish immediately (skip animation)
	const finishImmediately = useCallback(() => {
		clearTimer();
		const full = targetRef.current;
		if (!mountedRef.current) return;
		setText(full);
		setIsTyping(false);
		if (onComplete) onComplete();
	}, [clearTimer, onComplete]);

	// start typing (public method)
	const start = useCallback(
		(newText: string) => {
			// normalize
			const incoming = newText ?? '';
			// If identical target and already typing, optionally ignore
			if (!restartOnNew && incoming === targetRef.current && isTyping) return;

			clearTimer();
			targetRef.current = incoming;
			indexRef.current = 0;

			// If reduced motion, instantly show full text
			if (shouldReduceMotion) {
				if (!mountedRef.current) return;
				setText(incoming);
				setIsTyping(false);
				if (onComplete) onComplete();
				return;
			}

			// empty string fast-path
			if (incoming.length === 0) {
				if (!mountedRef.current) return;
				setText('');
				setIsTyping(false);
				if (onComplete) onComplete();
				return;
			}

			// start
			if (mountedRef.current) {
				setText('');
				setIsTyping(true);
			}

			// recursive tick function
			const tick = () => {
				// safety
				if (!mountedRef.current) return;
				const target = targetRef.current;
				if (indexRef.current >= target.length) {
					setIsTyping(false);
					// small pause then call onComplete
					timerRef.current = setTimeout(() => {
						timerRef.current = null;
						if (!mountedRef.current) return;
						if (onComplete) onComplete();
					}, pauseOnComplete);
					return;
				}
				// type next char
				indexRef.current += 1;
				const next = target.slice(0, indexRef.current);
				setText(next);
				// schedule next
				const d = computeDelay();
				timerRef.current = setTimeout(() => {
					timerRef.current = null;
					tick();
				}, d);
			};

			tick();
		},
		[
			clearTimer,
			computeDelay,
			onComplete,
			pauseOnComplete,
			restartOnNew,
			shouldReduceMotion,
			isTyping,
		]
	);

	const stop = useCallback(() => {
		clearTimer();
		if (mountedRef.current) setIsTyping(false);
	}, [clearTimer]);

	const skip = useCallback(() => {
		finishImmediately();
	}, [finishImmediately]);

	return {
		text,
		cursor,
		isTyping,
		start,
		stop,
		skip,
		/** low-level helpers for advanced usage (not required) */
		_internal: {
			targetRef,
			indexRef,
		},
	} as const;
}
