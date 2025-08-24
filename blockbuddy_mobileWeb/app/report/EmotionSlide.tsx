"use client";

import { motion } from "framer-motion";
import { Heart, TrendingUp } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
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

export default function EmotionSlide() {
  const { data, loading, error } = useReport();
  if (loading) return <div className="p-6">불러오는 중…</div>;
  if (error || !data) return <div className="p-6">데이터 오류: {error}</div>;

  const { distribution, diversity, summary, insights, recommendations, chart } =
    data.emotion;

  const entries = Object.entries(distribution);
  const total = entries.reduce((acc, [, v]) => acc + v, 0) || 1;
  const pieData = entries.map(([name, value]) => ({
    name,
    value,
    percentage: Math.round((value / total) * 100),
  }));
  const COLORS = chart?.colors ?? [
    "#A8D5FF",
    "#FFE4A3",
    "#FFB3C6",
    "#C7F0C7",
    "#F0F0F0",
  ];
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-25 to-indigo-50 p-3 sm:p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        {/* Section Header */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-4 sm:mb-8 mt-20 sm:mt-20"
        >
          <div className="flex justify-center mb-2 sm:mb-4">
            <div className="p-2 sm:p-3 bg-blue-50 rounded-full">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-1 sm:mb-2">
            정서 발달
          </h1>
          <p className="text-sm sm:text-lg text-gray-500 px-2">
            감정 표현의 다양성과 패턴을 분석합니다
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Chart Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white/70 rounded-2xl shadow-sm border border-blue-100 p-4 sm:p-8"
          >
            <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-4 sm:mb-6">
              감정 분포
            </h2>
            <div className="h-64 sm:h-70">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={isMobile ? 60 : 80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
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

          {/* Metrics Card */}
          <motion.div
            variants={itemVariants}
            className="space-y-4 sm:space-y-6"
          >
            <div className="bg-white/70 rounded-2xl shadow-sm border border-blue-100 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                <h3 className="text-base sm:text-lg font-bold text-gray-700">
                  감정 다양성 지수
                </h3>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-blue-400 mb-1 sm:mb-2">
                  {Math.round(diversity * 100)}%
                </div>
                <p className="text-sm sm:text-base text-gray-500">
                  양호한 수준의 감정 다양성
                </p>
              </div>
            </div>

            <div className="bg-white/70 rounded-2xl shadow-sm border border-blue-100 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-700 mb-3 sm:mb-4">
                발달 특성
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4 sm:mb-6">
                {summary}
              </p>

              {/* Key Insights - JSON 반복 */}
              <div className="space-y-2 sm:space-y-3">
                {insights.map(({ text, color = "blue" }, i) => {
                  const box =
                    color === "indigo"
                      ? "bg-indigo-25"
                      : color === "green"
                      ? "bg-green-25"
                      : color === "amber"
                      ? "bg-amber-25"
                      : color === "rose"
                      ? "bg-rose-25"
                      : "bg-blue-25";
                  const dot =
                    color === "indigo"
                      ? "bg-indigo-300"
                      : color === "green"
                      ? "bg-green-300"
                      : color === "amber"
                      ? "bg-amber-300"
                      : color === "rose"
                      ? "bg-rose-300"
                      : "bg-blue-300";

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
          </motion.div>
        </div>

        {/* Recommendations */}
        <motion.div
          variants={itemVariants}
          className="bg-white/70 rounded-2xl shadow-sm border border-blue-100 p-4 sm:p-8 mt-4 sm:mt-8"
        >
          <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-4 sm:mb-6">
            권장 활동
          </h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {recommendations.map((activity, index) => (
              <span
                key={index}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-50 text-blue-600 rounded-full text-xs sm:text-sm font-medium"
              >
                {activity}
              </span>
            ))}
          </div>
          <p className="text-gray-500 mt-3 sm:mt-4 text-xs sm:text-sm">
            이러한 활동들을 통해 감정 인식과 표현 능력을 더욱 발전시킬 수
            있습니다.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
