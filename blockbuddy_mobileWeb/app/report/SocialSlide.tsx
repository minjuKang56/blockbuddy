"use client";

import { motion } from "framer-motion";
import { Users, MessageCircle, Heart, BarChart3 } from "lucide-react";
import { useReport } from "./lib/useReport"; // 경로는 프로젝트 구조에 맞게
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

export default function SocialSlide() {
  const { data, loading, error } = useReport();
  if (loading) return <div className="p-6">불러오는 중…</div>;
  if (error || !data || !data.social)
    return <div className="p-6">데이터 오류: {error}</div>;

  const {
    topicHistogram,
    pronouns,
    empathyCount,
    density,
    summary,
    insights = [],
    recommendations = [],
  } = data.social;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  // (색상 매핑 – 인사이트 박스용)
  type ColorKey = "blue" | "indigo" | "green" | "amber" | "rose";
  const STYLE: Record<ColorKey, { box: string; dot: string }> = {
    blue: { box: "bg-blue-25", dot: "bg-blue-300" },
    indigo: { box: "bg-indigo-25", dot: "bg-indigo-300" },
    green: { box: "bg-green-25", dot: "bg-green-300" },
    amber: { box: "bg-amber-25", dot: "bg-amber-300" },
    rose: { box: "bg-rose-25", dot: "bg-rose-300" },
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-green-50 to-emerald-100 p-3 sm:p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        {/* Section Header - 모바일 최적화 */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-4 sm:mb-8 mt-20 sm:mt-20"
        >
          <div className="flex justify-center mb-2 sm:mb-4">
            <div className="p-2 sm:p-3 bg-green-50 rounded-full">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-1 sm:mb-2">
            사회성 발달
          </h1>
          <p className="text-sm sm:text-lg text-gray-500 px-2">
            인물 언급과 공감 표현 패턴을 분석합니다
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Chart Card - 주제 분포 그래프로 변경 */}
          <motion.div
            variants={itemVariants}
            className="bg-white/70 rounded-2xl shadow-sm border border-green-100 p-4 sm:p-8"
          >
            <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-4 sm:mb-6">
              주제 분포
            </h2>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topicHistogram}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0F2F1" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: isMobile ? 12 : 14 }}
                  />
                  <YAxis tick={{ fontSize: isMobile ? 12 : 14 }} />
                  <Tooltip
                    formatter={(value) => [`${value}회`, "언급 횟수"]}
                    labelFormatter={(label) => `주제: ${label}`}
                  />
                  <Bar dataKey="count" fill="#A8E6CF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Metrics Cards - 모바일 최적화 */}
          <motion.div
            variants={itemVariants}
            className="space-y-3 sm:space-y-6"
          >
            <div className="bg-white/70 rounded-2xl shadow-sm border border-green-100 p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                <h3 className="text-base sm:text-lg font-bold text-gray-700">
                  인칭 대명사
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="text-center p-2 sm:p-3 bg-blue-25 rounded-lg">
                  <div className="text-lg sm:text-xl font-bold text-blue-400">
                    {pronouns.first}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">1인칭</p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-green-25 rounded-lg">
                  <div className="text-lg sm:text-xl font-bold text-green-400">
                    {pronouns.second}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">2인칭</p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-purple-25 rounded-lg">
                  <div className="text-lg sm:text-xl font-bold text-purple-400">
                    {pronouns.third}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">3인칭</p>
                </div>
              </div>
            </div>

            {/* 공감 표현과 사회성 밀도를 좌우 배치 */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-white/70 rounded-2xl shadow-sm border border-green-100 p-4 sm:p-6">
                <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
                  <h3 className="text-sm sm:text-base font-bold text-gray-700">
                    공감 표현
                  </h3>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-pink-400 mb-1">
                    {empathyCount}회
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">확장 필요</p>
                </div>
              </div>

              <div className="bg-white/70 rounded-2xl shadow-sm border border-green-100 p-4 sm:p-6">
                <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                  <h3 className="text-sm sm:text-base font-bold text-gray-700">
                    사회성 밀도
                  </h3>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-purple-400 mb-1">
                    {Math.round(density * 100)}%
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">보통 수준</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Analysis Card - 모바일 최적화 */}
        <motion.div
          variants={itemVariants}
          className="bg-white/70 rounded-2xl shadow-sm border border-green-100 p-4 sm:p-8 mt-4 sm:mt-8"
        >
          <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-4 sm:mb-6">
            사회성 발달 분석
          </h3>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4 sm:mb-6">
            {summary}
          </p>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2 sm:space-y-3">
              <div className="space-y-1.5 sm:space-y-2">
                {insights.map(({ text, color = "green" }, i) => {
                  const { box, dot } = STYLE[color as ColorKey];
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-2 sm:p-3 rounded-lg ${box}`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`}
                      />
                      <span className="text-xs sm:text-sm text-gray-600">
                        {text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recommendations - 모바일 최적화 */}
        <motion.div
          variants={itemVariants}
          className="bg-white/70 rounded-2xl shadow-sm border border-green-100 p-4 sm:p-8 mt-4 sm:mt-8"
        >
          <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-4 sm:mb-6">
            권장 활동
          </h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {recommendations.map((activity, index) => (
              <span
                key={index}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-50 text-green-600 rounded-full text-xs sm:text-sm font-medium"
              >
                {activity}
              </span>
            ))}
          </div>
          <p className="text-gray-500 mt-3 sm:mt-4 text-xs sm:text-sm">
            타인의 감정을 이해하고 공감하는 능력을 기를 수 있는 활동들입니다.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
