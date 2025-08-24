"use client";

import { motion } from "framer-motion";
import { useReport } from "./lib/useReport";
import { CheckCircle, BookOpen, Users, Heart } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function SummarySlide() {
  const { data, loading, error } = useReport();
  if (loading) return <div className="p-6">불러오는 중…</div>;
  if (error || !data?.summary)
    return <div className="p-6">요약 데이터가 없어요</div>;

  const { overview, overall, recommendations } = data.summary;

  // 색상 토큰 → 실제 클래스 매핑 (Tailwind JIT 안전)
  type ColorKey = "blue" | "green" | "pink" | "indigo" | "amber" | "rose";
  const STYLE: Record<
    ColorKey,
    { box: string; h3: string; p: string; status: string }
  > = {
    blue: {
      box: "bg-blue-50",
      h3: "text-blue-800",
      p: "text-blue-700",
      status: "text-blue-600",
    },
    green: {
      box: "bg-green-50",
      h3: "text-green-800",
      p: "text-green-700",
      status: "text-green-600",
    },
    pink: {
      box: "bg-pink-50",
      h3: "text-pink-800",
      p: "text-pink-700",
      status: "text-pink-600",
    },
    indigo: {
      box: "bg-indigo-50",
      h3: "text-indigo-800",
      p: "text-indigo-700",
      status: "text-indigo-600",
    },
    amber: {
      box: "bg-amber-50",
      h3: "text-amber-800",
      p: "text-amber-700",
      status: "text-amber-600",
    },
    rose: {
      box: "bg-rose-50",
      h3: "text-rose-800",
      p: "text-rose-700",
      status: "text-rose-600",
    },
  };

  // 아이콘은 고정: 순서대로 정서/사회/언어
  const ICONS = [Heart, Users, BookOpen];

  return (
    <div className="min-h-full bg-gradient-to-br from-[#F2F4F7] to-[#E5E9F0] p-3 sm:p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        {/* Section Header - 모바일 최적화 */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-4 sm:mb-8"
        >
          <div className="flex justify-center mb-2 sm:mb-4 mt-20 sm:mt-20">
            <div className="p-2 sm:p-3 bg-indigo-100 rounded-full">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            종합 소견 및 권고
          </h1>
          <p className="text-sm sm:text-lg text-gray-600 px-2">
            전체적인 발달 현황과 향후 방향을 제시합니다
          </p>
        </motion.div>

        {/* Development Overview - 발달 영역별 요약 */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 mb-4 sm:mb-8"
        >
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">
            발달 영역별 요약
          </h2>

          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            {overview.slice(0, 3).map((o, idx) => {
              const c = (o.color ??
                (idx === 0
                  ? "blue"
                  : idx === 1
                  ? "green"
                  : "pink")) as ColorKey;
              const { box, h3, p, status } = STYLE[c];
              const Icon = ICONS[idx] ?? Heart; // 아이콘 고정(정서/사회/언어)
              return (
                <div
                  key={idx}
                  className={`text-center p-3 sm:p-4 rounded-xl ${box}`}
                >
                  <Icon
                    className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 ${status.replace(
                      "text-",
                      "text-"
                    )}`}
                  />
                  <h3
                    className={`font-semibold mb-1 sm:mb-2 text-sm sm:text-base ${h3}`}
                  >
                    {o.title}
                  </h3>
                  <p className={`text-xs sm:text-sm ${p}`}>{o.short}</p>
                  <div className={`mt-1 sm:mt-2 text-xs ${status}`}>
                    {o.status}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Comprehensive Summary - 종합 소견 */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 mb-4 sm:mb-8"
        >
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              종합 소견
            </h2>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
            <h3 className="font-semibold text-indigo-800 mb-3 text-sm sm:text-base">
              전체적인 발달 현황
            </h3>
            <div className="space-y-3 text-indigo-700">
              {overall.map((para, i) => (
                <p key={i} className="text-sm sm:text-base leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-4 sm:p-6">
            <h3 className="font-semibold text-green-800 mb-3 text-sm sm:text-base">
              권장 사항
            </h3>
            <ul className="space-y-2 text-green-700">
              {recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Final Disclaimer - 모바일 최적화 (고정 문구) */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-4 sm:p-6"
        >
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-800 mb-2 text-sm sm:text-base">
                보고서 완료
              </p>
              <p className="text-green-700 leading-relaxed mb-3 text-xs sm:text-sm">
                본 보고서는 대화 분석을 통한 참고 자료입니다. 아이의 개별적인
                특성과 발달 속도를 고려하여 활용해 주시기 바랍니다.
              </p>
              <div className="bg-white/50 rounded-lg p-3">
                <p className="text-xs sm:text-sm text-green-700">
                  <strong>추가 상담이 필요하다면:</strong> 아동 발달 전문가,
                  언어치료사, 또는 소아 심리상담사와 상담하시기를 권장합니다.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
