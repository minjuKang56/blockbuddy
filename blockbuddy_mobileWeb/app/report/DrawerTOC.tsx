
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Heart, Brain, Users, MessageSquare, CheckCircle } from 'lucide-react';

interface DrawerTOCProps {
  isOpen: boolean;
  onClose: () => void;
  slides: Array<{ id: string; title: string }>;
  currentSlide: number;
  onSlideSelect: (index: number) => void;
}

const slideIcons = {
  cover: BookOpen,
  emotion: Heart,
  cognition: Brain,
  social: Users,
  language: MessageSquare,
  summary: CheckCircle
};

const slideColors = {
  cover: 'text-amber-600 bg-amber-100',
  emotion: 'text-orange-600 bg-orange-100',
  cognition: 'text-yellow-600 bg-yellow-100',
  social: 'text-amber-600 bg-amber-100',
  language: 'text-orange-600 bg-orange-100',
  summary: 'text-yellow-600 bg-yellow-100'
};

export default function DrawerTOC({ isOpen, onClose, slides, currentSlide, onSlideSelect }: DrawerTOCProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* Drawer - 모바일 최적화 */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-72 sm:w-80 bg-white shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header - 모바일 최적화 */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">목차</h2>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Table of Contents - 모바일 최적화 */}
            <div className="p-4 sm:p-6">
              <div className="space-y-2 sm:space-y-3">
                {slides.map((slide, index) => {
                  const Icon = slideIcons[slide.id as keyof typeof slideIcons];
                  const colorClasses = slideColors[slide.id as keyof typeof slideColors];
                  const isActive = index === currentSlide;

                  return (
                    <motion.button
                      key={slide.id}
                      onClick={() => onSlideSelect(index)}
                      className={`w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl text-left transition-all ${
                        isActive
                          ? 'bg-blue-50 border-2 border-blue-200'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`p-1.5 sm:p-2 rounded-lg ${colorClasses}`}>
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm text-gray-500">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          {isActive && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <h3 className={`font-semibold text-sm sm:text-base ${isActive ? 'text-blue-800' : 'text-gray-800'}`}>
                          {slide.title}
                        </h3>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Progress Indicator - 모바일 최적화 */}
              <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm text-gray-600">진행률</span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-800">
                    {Math.round(((currentSlide + 1) / slides.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
