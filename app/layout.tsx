import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
	title: 'WDM',
	description: 'PathMastery MVP',
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body className="min-h-screen bg-[#0a1738] text-white">{children}</body>
		</html>
	);
}
