
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingSlide from './OnboardingSlide';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "사진으로 블록을\n3D로 만들어요",
      description: "아이의 블록 작품을 촬영하면\n멋진 3D 모델로 변환됩니다",
      icon: "📸",
      bgColor: "from-blue-100 to-blue-50"
    },
    {
      title: "블록 친구와\n대화해보세요",
      description: "3D 블록과 함께 재미있는\n대화를 나눌 수 있어요",
      icon: "💬",
      bgColor: "from-green-100 to-green-50"
    },
    {
      title: "성장 발달 리포트로\n아이를 이해해요",
      description: "놀이 패턴을 분석하여\n맞춤형 성장 리포트를 제공합니다",
      icon: "📊",
      bgColor: "from-purple-100 to-purple-50"
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.push('/child-setup');
    }
  };

  const skipOnboarding = () => {
    router.push('/child-setup');
  };

  return (
    <div className="min-h-screen flex flex-col max-w-sm mx-auto" style={{ backgroundColor: '#fffcef' }}>
      <div className="flex justify-end p-6">
        <button 
          onClick={skipOnboarding}
          className="text-gray-500 text-sm font-medium"
        >
          건너뛰기
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        <OnboardingSlide 
          slide={slides[currentSlide]}
          isActive={true}
        />

        <div className="p-6">
          <div className="flex justify-center space-x-2 mb-8">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${'w-2 h-2 rounded-full transition-all duration-300 ' + (index === currentSlide ? 'bg-orange-500 w-6' : 'bg-orange-200')}`}
              ></div>
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="w-full bg-orange-500 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg active:scale-95 transition-transform whitespace-nowrap"
          >
            {currentSlide === slides.length - 1 ? '시작하기' : '다음'}
          </button>
        </div>
      </div>
    </div>
  );
}