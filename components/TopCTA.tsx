'use client'
import React from 'react';
export default function TopCTA({ label='Start learning', onClick }: { label?: string; onClick?: ()=>void }){ return (<button onClick={onClick} className='px-6 py-3 rounded bg-green-500 text-white'>{label}</button>); }
