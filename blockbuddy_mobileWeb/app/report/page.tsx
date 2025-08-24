'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import CoverSlide from './CoverSlide';
import EmotionSlide from './EmotionSlide';
import SocialSlide from './SocialSlide';
import LanguageSlide from './LanguageSlide';
import SummarySlide from './SummarySlide';
import DrawerTOC from './DrawerTOC';

type SlideDef = { id: string; title: string; component: React.ComponentType };

const slides: SlideDef[] = [
  { id: 'cover',    title: '표지',     component: CoverSlide },
  { id: 'emotion',  title: '정서 발달', component: EmotionSlide },
  { id: 'social',   title: '사회성 발달', component: SocialSlide },
  { id: 'language', title: '언어 발달', component: LanguageSlide },
  { id: 'summary',  title: '종합 소견',  component: SummarySlide },
];

export default function ReportPage() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0); // -1: 왼쪽, +1: 오른쪽
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ── 네비게이션 ──────────────────────────────────────────────
  const next = useCallback(() => {
    setDirection(1);
    setCurrent((i) => Math.min(i + 1, slides.length - 1));
  }, []);
  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((i) => Math.max(i - 1, 0));
  }, []);
  const goTo = useCallback((idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
    setDrawerOpen(false);
  }, [current]);

  // 키보드 좌/우 화살표
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next]);

  // ── 스와이프(모바일) ────────────────────────────────────────
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      dx > 0 ? prev() : next();
    }
    touchStartX.current = null;
  };

  // ── 전환 애니메이션 ─────────────────────────────────────────
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      zIndex: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
      zIndex: 0,
    }),
  } as const;

  const CurrentSlide = slides[current].component;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
      {/* 헤더 */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
          <h1 className="text-base sm:text-lg font-bold text-gray-800 truncate">
            아동 대화 발달 보고서
          </h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
              {current + 1} / {slides.length}
            </span>
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="목차 열기"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 본문 (헤더 공간만큼 상단 패딩, 하단바는 없음) */}
      <div
        className="relative h-screen pt-12 sm:pt-16 pb-14 sm:pb-16"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0 overflow-y-auto"
          >
            <CurrentSlide />
          </motion.div>
        </AnimatePresence>

        {/* 좌/우 화살표 (메인 스타일) */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prev}
              disabled={current === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg w-9 h-9 flex items-center justify-center disabled:opacity-40"
              aria-label="이전"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={next}
              disabled={current === slides.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg w-9 h-9 flex items-center justify-center disabled:opacity-40"
              aria-label="다음"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}

        {/* 점 인디케이터 (하단 중앙) */}
        <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`슬라이드 ${i + 1}`}
              className={`rounded-full transition-all ${
                i === current ? 'bg-blue-500 w-6 h-2' : 'bg-gray-300 w-2 h-2'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 목차 드로어 */}
      <DrawerTOC
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slides={slides}
        currentSlide={current}
        onSlideSelect={goTo}
      />
    </div>
  );
}
