// app/intro/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function IntroPage() {
  const router = useRouter();
  const [logoVisible, setLogoVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLogoVisible(true), 300);   // 로고 등장
    const t2 = setTimeout(() => setTextVisible(true), 800);   // 텍스트 등장
    const t3 = setTimeout(() => router.replace('/onboarding'), 3000); // 온보딩 이동(뒤로가기 방지)

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 max-w-sm mx-auto"
         style={{ backgroundColor: '#fffcef' }}>
      <div className="text-center">

        {/* 로고 + 텍스트 PNG 묶음 */}
        <div className={`transition-all duration-1000 ${logoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
          <div className="flex flex-col items-center gap-1 mb-4">
            {/* 🦁 사자 로고 */}
            <Image
              src="/assets/lion-logo.png"             // public/assets/lion-logo.png
              alt="BlockBuddy 사자 로고"
              width={110}
              height={110}
              priority
            />
            {/* 🔤 텍스트 로고 (살짝 오른쪽으로) */}
            <Image
              src="/assets/blockbuddy-text.png"       // public/assets/blockbuddy-text.png
              alt="BlockBuddy 텍스트 로고"
              width={180}
              height={120}
              className="translate-x-4"               // 오른쪽으로 살짝 이동
            />
          </div>
        </div>

        {/* 서브카피 */}
        <div className={`transition-all duration-1000 delay-300 ${
          textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-black-400 text-lg mt-2 translate-x-2">우리 아이의 블록 놀이 친구</p>
          <p className="text-black-500 text-sm mt-2 translate-x-2">상상력과 창의력을 키워요</p>
        </div>

        {/* 인디케이터 */}
        <div className="mt-12">
          <div className="flex space-x-1 justify-center">
            <div className="w-2 h-2 bg-orange-300 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>

      </div>
    </div>
  );
}
