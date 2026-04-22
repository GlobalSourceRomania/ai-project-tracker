'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/projects');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#080D1A] flex items-center justify-center">
      <div className="text-white text-center">
        <h1 className="text-2xl font-bold mb-4">AI Project Tracker</h1>
        <p className="text-white/60">Redirecting to projects...</p>
      </div>
    </div>
  );
}
