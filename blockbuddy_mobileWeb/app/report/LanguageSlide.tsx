"use client";

import { motion } from "framer-motion";
import { MessageSquare, TrendingUp, RotateCcw, BookOpen } from "lucide-react";
import { useReport } from "./lib/useReport";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
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

export default function LanguageSlide() {
  const { data, loading, error } = useReport();
  if (loading) return <div className="p-6">불러오는 중…</div>;
  if (error || !data || !data.language)
    return <div className="p-6">데이터 오류: {error}</div>;

  const {
    avgTokens,
    lexDiv,
    repeatRate,
    pos,
    summary,
    insights = [],
    recommendations = [],
    chart,
  } = data.language;

  // 품사 그래프 데이터 (총합 기준 퍼센트 계산)
  const POS_LABEL: Record<keyof typeof pos, string> = {
    N: "명사",
    V: "동사",
    ADJ: "형용사",
  };
  const totalPOS = Object.values(pos).reduce((a, b) => a + b, 0) || 1;
  const posData = (Object.entries(pos) as [keyof typeof pos, number][]).map(
    ([tag, value]) => ({
      name: POS_LABEL[tag],
      value,
      percentage: Math.round((value / totalPOS) * 100),
    })
  );

  const COLORS = chart?.colors ?? ["#FFE4A3", "#A8D5FF", "#FFB3C6"];

  // 인사이트 색상 매핑 (pink 포함)
  type ColorKey = "blue" | "indigo" | "green" | "amber" | "rose" | "pink";
  const STYLE: Record<ColorKey, { box: string; dot: string }> = {
    blue: { box: "bg-blue-25", dot: "bg-blue-300" },
    indigo: { box: "bg-indigo-25", dot: "bg-indigo-300" },
    green: { box: "bg-green-25", dot: "bg-green-300" },
    amber: { box: "bg-amber-25", dot: "bg-amber-300" },
    rose: { box: "bg-rose-25", dot: "bg-rose-300" },
    pink: { box: "bg-pink-25", dot: "bg-pink-300" }, // ✅ 네가 쓰는 클래스
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-pink-50 to-rose-100 p-3 sm:p-6">
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
            <div className="p-2 sm:p-3 bg-pink-50 rounded-full">
              <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-pink-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-1 sm:mb-2">
            언어 발달
          </h1>
          <p className="text-sm sm:text-lg text-gray-500 px-2">
            문장 구조와 어휘 사용 패턴을 분석합니다
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Chart Card - 모바일 최적화 */}
          <motion.div
            variants={itemVariants}
            className="bg-white/70 rounded-2xl shadow-sm border border-pink-100 p-4 sm:p-8"
          >
            <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-4 sm:mb-6">
              품사 분포
            </h2>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={posData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={window.innerWidth < 640 ? 60 : 80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {posData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Metrics Cards - 평균 어절수, 어휘 다양성, 반복률 */}
          <motion.div
            variants={itemVariants}
            className="space-y-3 sm:space-y-4"
          >
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-white/70 rounded-2xl shadow-sm border border-pink-100 p-3 sm:p-4">
                <div className="flex items-center justify-center mb-2">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-700 text-center mb-2">
                  평균 어절수
                </h3>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold text-pink-400 mb-1">
                    {avgTokens}개
                  </div>
                  <p className="text-xs text-gray-500">적절한 길이</p>
                </div>
              </div>

              <div className="bg-white/70 rounded-2xl shadow-sm border border-pink-100 p-3 sm:p-4">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-700 text-center mb-2">
                  어휘 다양성
                </h3>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold text-rose-400 mb-1">
                    {Math.round(lexDiv * 100)}%
                  </div>
                  <p className="text-xs text-gray-500">확장 가능</p>
                </div>
              </div>

              <div className="bg-white/70 rounded-2xl shadow-sm border border-pink-100 p-3 sm:p-4">
                <div className="flex items-center justify-center mb-2">
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-fuchsia-400" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-700 text-center mb-2">
                  반복률
                </h3>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold text-fuchsia-400 mb-1">
                    {Math.round(repeatRate * 100)}%
                  </div>
                  <p className="text-xs text-gray-500">적정 수준</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Analysis Card - 모바일 최적화 */}
        <motion.div
          variants={itemVariants}
          className="bg-white/70 rounded-2xl shadow-sm border border-pink-100 p-4 sm:p-8 mt-4 sm:mt-8"
        >
          <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-4 sm:mb-6">
            언어 발달 분석
          </h3>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4 sm:mb-6">
            {summary}
          </p>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2 sm:space-y-3">
              <div className="space-y-1.5 sm:space-y-2">
                {insights.map(({ text, color = "pink" }, i) => {
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
          className="bg-white/70 rounded-2xl shadow-sm border border-pink-100 p-4 sm:p-8 mt-4 sm:mt-8"
        >
          <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-4 sm:mb-6">
            권장 활동
          </h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {recommendations.map((activity, index) => (
              <span
                key={index}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-pink-50 text-pink-600 rounded-full text-xs sm:text-sm font-medium"
              >
                {activity}
              </span>
            ))}
          </div>
          <p className="text-gray-500 mt-3 sm:mt-4 text-xs sm:text-sm">
            다양한 어휘와 표현 방식을 경험하며 언어 능력을 확장할 수 있습니다.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
