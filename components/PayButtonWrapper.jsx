// --- filename: components/PayButtonWrapper.jsx ---

'use client';

import dynamic from 'next/dynamic';

const PayButtonClient = dynamic(() => import('@/components/PayButtonClient'), {
	ssr: false,
});

export default PayButtonClient;
