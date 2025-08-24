'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 자동으로 인트로 페이지로 리디렉션
    router.push('/intro');
  }, [router]);

  return (
    // <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fffcef' }}>
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </div>
  );
}