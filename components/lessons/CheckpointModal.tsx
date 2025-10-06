// --- filename: components/lessons/CheckpointModal.tsx ---
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { CheckpointQuestion } from '@/types/checkpoint';

interface CheckpointModalProps {
	checkpointId: string;
	questions: CheckpointQuestion[];
	onComplete: (passed: boolean) => void;
	onAbort: () => void;
}

interface CheckpointResultRow {
	questionId: string;
	correct: boolean;
	correctAnswer: string;
	userAnswer: string | null;
	questionStem: string;
	options: Array<{ id: string; text: string }>;
}

interface CheckpointResult {
	passed: boolean;
	mastery_percent: number;
	results: CheckpointResultRow[];
}

/**
 * Full-screen checkpoint modal with timed MCQ questions
 */
export default function CheckpointModal({
	checkpointId,
	questions,
	onComplete,
	onAbort,
}: CheckpointModalProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [answers, setAnswers] = useState<
		{
			questionId: string;
			selectedOption: string;
			timestamp: string;
		}[]
	>([]);
	const [selectedOption, setSelectedOption] = useState<string | null>(null);
	const [timeLeft, setTimeLeft] = useState(questions[0]?.timerSeconds ?? 20);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showResults, setShowResults] = useState(false);
	const [results, setResults] = useState<CheckpointResult | null>(null);

	const currentQuestion = questions[currentIndex];

	const handleAnswer = useCallback(
		async (optionId: string | null) => {
			if (!currentQuestion) return;

			// Record answer
			const newAnswers = [
				...answers,
				{
					questionId: currentQuestion.id,
					selectedOption: optionId ?? '',
					timestamp: new Date().toISOString(),
				},
			];
			setAnswers(newAnswers);

			// Move to next question or complete
			if (currentIndex < questions.length - 1) {
				setCurrentIndex((prev) => prev + 1);
			} else {
				// All questions answered - submit
				setIsSubmitting(true);

				try {
					const response = await fetch('/api/checkpoint/complete', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							checkpointId,
							answers: newAnswers,
						}),
					});

					const data = await response.json();

					if (response.ok) {
						setResults(data as CheckpointResult);
						setShowResults(true);
					} else {
						throw new Error(data.error || 'Unknown server error');
					}
				} catch (error) {
					console.error('Checkpoint submission error:', error);
					alert('Failed to submit checkpoint. Please try again.');
					onAbort();
				} finally {
					setIsSubmitting(false);
				}
			}
		},
		[currentQuestion, answers, currentIndex, questions, checkpointId, onAbort]
	);

	// Timer countdown — include handleAnswer in deps to satisfy exhaustive-deps
	useEffect(() => {
		if (showResults || isSubmitting) return;

		const timer = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					// Time's up - auto-submit null answer
					handleAnswer(null);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [currentIndex, showResults, isSubmitting, handleAnswer]);

	// Reset timer when question changes
	useEffect(() => {
		if (currentQuestion) {
			setTimeLeft(currentQuestion.timerSeconds);
			setSelectedOption(null);
		}
	}, [currentIndex, currentQuestion]);

	const handleOptionSelect = (optionId: string) => {
		if (selectedOption) return; // Already selected
		setSelectedOption(optionId);

		// Lock in answer after brief delay
		setTimeout(() => {
			handleAnswer(optionId);
		}, 500);
	};

	const handleContinue = () => {
		onComplete(results?.passed ?? false);
	};

	if (!currentQuestion && !showResults) {
		return null;
	}

	// Results screen
	if (showResults && results) {
		return (
			<div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6">
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					className="max-w-3xl w-full bg-gray-900 border-2 border-gray-800 rounded-lg p-8"
				>
					<div className="text-center mb-8">
						<h2 className="text-3xl font-bold mb-2">
							{results.passed ? '✓ Checkpoint Passed!' : '✗ Checkpoint Not Passed'}
						</h2>
						<p className="text-xl text-gray-400">
							Score: {results.mastery_percent}% ({results.results.filter((r) => r.correct).length}/
							{questions.length} correct)
						</p>
					</div>

					{/* Per-question results */}
					<div className="space-y-4 mb-8 max-h-96 overflow-y-auto">
						{results.results.map((result, idx) => (
							<div
								key={result.questionId}
								className={`p-4 rounded-lg border-2 ${
									result.correct ? 'bg-green-950/30 border-green-700' : 'bg-red-950/30 border-red-700'
								}`}
							>
								<div className="flex items-start gap-3 mb-2">
									<span className="text-2xl">{result.correct ? '✓' : '✗'}</span>
									<div className="flex-1">
										<p className="font-semibold mb-2">
											Q{idx + 1}: {result.questionStem}
										</p>

										{result.options.map((option) => {
											const isCorrect = option.id === result.correctAnswer;
											const isUserChoice = option.id === result.userAnswer;

											return (
												<div
													key={option.id}
													className={`p-2 rounded mb-1 ${
														isCorrect
															? 'bg-green-900/50 border border-green-700'
															: isUserChoice
																? 'bg-red-900/50 border border-red-700'
																: 'bg-gray-800'
													}`}
												>
													<span className="mr-2">
														{isCorrect && '✓'}
														{isUserChoice && !isCorrect && '✗'}
													</span>
													{option.text}
												</div>
											);
										})}
									</div>
								</div>
							</div>
						))}
					</div>

					<button
						onClick={handleContinue}
						className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg transition-colors"
					>
						Continue Learning
					</button>
				</motion.div>
			</div>
		);
	}

	// Question screen
	return (
		<div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6">
			<motion.div
				key={currentIndex}
				initial={{ opacity: 0, x: 100 }}
				animate={{ opacity: 1, x: 0 }}
				exit={{ opacity: 0, x: -100 }}
				className="max-w-2xl w-full bg-gray-900 border-2 border-gray-800 rounded-lg p-8"
			>
				{/* Progress header */}
				<div className="flex items-center justify-between mb-6">
					<div className="text-sm text-gray-400">
						Question {currentIndex + 1} of {questions.length}
					</div>
					<div
						className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-green-500'}`}
					>
						{timeLeft}s
					</div>
				</div>

				{/* Progress bar */}
				<div className="w-full bg-gray-800 rounded-full h-2 mb-8">
					<div
						className="bg-green-600 h-2 rounded-full transition-all duration-1000"
						style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
					/>
				</div>

				{/* Question stem */}
				<h3 className="text-2xl font-semibold mb-6">{currentQuestion.stem}</h3>

				{/* Options */}
				<div className="space-y-3">
					{currentQuestion.options.map((option) => (
						<button
							key={option.id}
							onClick={() => handleOptionSelect(option.id)}
							disabled={selectedOption !== null}
							className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
								selectedOption === option.id
									? 'border-green-500 bg-green-950/50'
									: 'border-gray-700 hover:border-gray-600 bg-gray-800'
							} ${selectedOption !== null ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
						>
							<span className="font-medium">{option.text}</span>
						</button>
					))}
				</div>

				{/* Loading state */}
				{isSubmitting && <div className="mt-6 text-center text-gray-400">Submitting answers...</div>}
			</motion.div>
		</div>
	);
}
