"use client";
import { useEffect, useState } from "react";

export type Report = {
  cover: {
    child: {
      name: string;
      gender: string;
      ageText: string;
      sessionDate: string;
      turns: number;
    };
    summary: string[];
  };
  emotion: {
    distribution: Record<string, number>;
    diversity: number;
    summary: string;
    insights: {
      text: string;
      color?: "blue" | "indigo" | "green" | "amber" | "rose"; // ✅ 여기!
    }[];
    recommendations: string[]; // ✅ 추가
    chart?: { colors?: string[] }; // ✅ 추가(선택)
  };
  social?: {
    topicHistogram: { label: string; count: number }[];
    pronouns: { first: number; second: number; third: number };
    empathyCount: number;
    density: number;
    summary: string;
    insights: {
      text: string;
      color?: "blue" | "indigo" | "green" | "amber" | "rose";
    }[];
    recommendations: string[];
  };
  language?: {
    avgTokens: number;
    lexDiv: number;
    repeatRate: number;
    pos: { N: number; V: number; ADJ: number };
    summary: string;
    insights: {
      text: string;
      color?: "blue" | "indigo" | "green" | "amber" | "rose" | "pink";
    }[];
    recommendations: string[];
    chart?: { colors?: string[] };
  };
  summary?: {
    overview: {
      title: string; // 영역명 (예: "정서 발달")
      short: string; // 짧은 설명 (예: "긍정 정서 풍부")
      status: string; // 평가 상태 (예: "우수", "양호")
      color?: "blue" | "indigo" | "green" | "amber" | "rose" | "pink";
    }[];
    overall: string[]; // 종합 소견 문단 배열
    recommendations: string[]; // 권장 활동 리스트
  };
};

export function useReport(url = "/report.json") {
  const [data, setData] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetch(url, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("report.json 로드 실패");
        return r.json();
      })
      .then((j) => setData(j as Report))
      .catch((e) => setError(e.message));
  }, [url]);
  return { data, error, loading: !data && !error };
}
