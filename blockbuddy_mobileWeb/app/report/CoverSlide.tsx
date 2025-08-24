"use client";

import { motion } from "framer-motion";
import { AlertTriangle, BookOpen, Calendar, User } from "lucide-react";
import { useReport } from "./lib/useReport";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function CoverSlide() {
  const { data, loading, error } = useReport();

  if (loading) return <section className="p-8">불러오는 중…</section>;
  if (error || !data) return <section className="p-8">데이터 오류: {error}</section>;

  const childData = data.cover.child;
  const summary = data.cover.summary;

  return (
    <div className="min-h-full bg-gradient-to-br from-[#FFFBEA] to-[#FEF3C7] p-3 sm:p-6 flex items-center justify-center">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-2xl mx-auto"
      >
        {/* Title Section */}
        <motion.div variants={itemVariants} className="text-center mb-6 sm:mb-12">
          <div className="flex justify-center mb-3 sm:mb-6 mt-20 sm:mt-20">
            <div className="p-3 sm:p-4 bg-amber-100 rounded-full">
              <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 text-amber-600" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2 sm:mb-4">
            아동 대화 발달 보고서
          </h1>
          <p className="text-base sm:text-lg text-gray-600 px-2">
            대화를 통해 살펴본 발달 현황과 성장 방향
          </p>
        </motion.div>

        {/* Child Info Card */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 mb-4 sm:mb-8">
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
              <div>
                <p className="text-xs sm:text-sm text-gray-500">아동 이름</p>
                <p className="font-semibold text-base sm:text-lg">{childData.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-amber-500 rounded-full" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">성별 및 연령</p>
                <p className="font-semibold text-base sm:text-lg">
                  {childData.gender}, {childData.ageText}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
              <div>
                <p className="text-xs sm:text-sm text-gray-500">분석 일시</p>
                <p className="font-semibold text-base sm:text-lg">{childData.sessionDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-amber-500 font-bold text-sm sm:text-base">
                #
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">총 대화 턴</p>
                <p className="font-semibold text-base sm:text-lg">{childData.turns}턴</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Summary Card (숫자 배지 제거) */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 mb-4 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">분석 요약</h2>
          <div className="space-y-3 sm:space-y-4">
            {summary.map((text, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="p-3 sm:p-4 bg-amber-50 rounded-xl"
              >
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div variants={itemVariants} className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-800 mb-2 text-sm sm:text-base">중요한 안내</p>
              <p className="text-amber-700 leading-relaxed text-xs sm:text-sm">
                본 보고서는 참고용 자료이며, 의료·심리학적 진단이 아닙니다.
                자녀의 발달에 대한 전문적인 상담이 필요하시면 전문가에게 문의하시기 바랍니다.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
