
'use client';

import Link from 'next/link';

interface ChildInfo {
  name: string;
  age: string;
  avatar: string;
  gender : string ;
}

interface ChildInfoCardProps {
  childInfo: ChildInfo;
  recordCount: number;
}

export default function ChildInfoCard({ childInfo, recordCount }: ChildInfoCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-16 h-16 bg-orange-500 rounded-2xl overflow-hidden flex items-center justify-center">
          {childInfo.avatar ? (
            <img 
              src={childInfo.avatar}
              alt="아이 아바타"
              className="w-full h-full object-contain p-2"/>
          ) : (
            <span className="text-2xl">?</span>
          )}
        </div>
        
        <div className="flex-1">
          <h1 className="text-l font-bold text-gray-800">{childInfo.name}</h1>
          <p className="text-sm text-gray-500">{childInfo.gender}, {childInfo.age}세</p>
          <div className="flex items-center mt-2">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <span className="text-sm text-gray-500">총 {recordCount}개 작품</span>
          </div>
        </div>
      </div>

      {/* 감정 분석 버튼 */}
      <Link href="/report">
        <button className="w-full bg-orange-500 text-white py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center space-x-2 hover:bg-orange-600 transition-all active:scale-95 whitespace-nowrap">
          <i className="ri-emotion-happy-line text-lg"></i>
          <span>우리 아이 감정 분석 보러가기</span>
        </button>
      </Link>
    </div>
  );
}