'use client';

interface Slide {
  title: string;
  description: string;
  icon: string;
  bgColor: string;
}

interface OnboardingSlideProp {
  slide: Slide;
  isActive: boolean;
}

export default function OnboardingSlide({ slide, isActive }: OnboardingSlideProp) {
  return (
    <div className={`flex-1 flex flex-col items-center justify-center px-8 transition-all duration-500 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
      <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${slide.bgColor} flex items-center justify-center mb-12 shadow-lg`}>
        <span className="text-6xl">{slide.icon}</span>
      </div>
      
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 leading-relaxed whitespace-pre-line">
          {slide.title}
        </h2>
        <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line">
          {slide.description}
        </p>
      </div>
    </div>
  );
}