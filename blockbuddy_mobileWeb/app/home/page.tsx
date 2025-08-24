'use client';

import { useState, useEffect } from 'react';
import ChildInfoCard from './ChildInfoCard';
import BlockRecordCard from './BlockRecordCard';
import BottomNavigation from '../components/BottomNavigation';

// 블록 기록 데이터 타입 정의
type BlockRecord = {
  id: number;
  title: string;
  date: string;
  thumbnail: string;
  description: string;
};

export default function HomePage() {
  const [childInfo, setChildInfo] = useState<any>(null);
  const [blockRecords, setBlockRecords] = useState<BlockRecord[]>([]);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  
  useEffect(() => {
    // 아이 정보 불러오기
    const savedChildInfo = localStorage.getItem('childInfo');
    if (savedChildInfo) {
      setChildInfo(JSON.parse(savedChildInfo));
    }

    // 더미 블록 기록 데이터
    setBlockRecords([
      {
        id: 1,
        title: '사자 친구',
        date: '2025-08-20',
        thumbnail: '/images/lion_thumnail.png',
        description: '용감한 사자 친구를 레고로 만들었어요!'
      },
      {
        id: 2,
        title: '트위티',
        date: '2025-07-20',
        thumbnail: '/images/twitty_thumnail.png',
        description: '귀여운 발을 가진 트위티!'
      },
      {
        id: 3,
        title: '야옹야옹',
        date: '2025-01-20',
        thumbnail: '/images/cat_thumnail.png',
        description: '예쁜 눈을 가진 고양이에요!'
      }
    ]);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % blockRecords.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + blockRecords.length) % blockRecords.length);
  };

  if (!childInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center max-w-sm mx-auto" style={{ backgroundColor: '#fffcef' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-sm mx-auto flex flex-col" style={{ backgroundColor: '#fffcef' }}>
      <div className="flex-1 pb-20">
        {/* 상단 로고 */}
        <div className="p-4">
          <h1 className="text-3xl font-bold text-orange-600 font-['Pacifico'] text-left">BlockBuddy</h1>
        </div>

        {/* 아이 정보 카드 */}
        <div className="px-4 mb-6">
          <ChildInfoCard childInfo={childInfo} recordCount={blockRecords.length} />
        </div>

        {/* 블록 기록 섹션 */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">블록 기록</h2>
            <span className="text-sm text-gray-500">{blockRecords.length}개의 작품</span>
          </div>

          {blockRecords.length > 0 ? (
            <div className="relative">
              {/* 슬라이더 컨테이너 */}
              <div className="overflow-hidden rounded-2xl">
                <div 
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {blockRecords.map((record) => (
                    <div key={record.id} className="w-full flex-shrink-0 px-2">
                      <BlockRecordCard record={record} />
                    </div>
                  ))}
                </div>
              </div>

              {/* 화살표 버튼들 */}
              {blockRecords.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all w-8 h-8 flex items-center justify-center"
                  >
                    <i className="ri-arrow-left-s-line text-gray-700 text-lg"></i>
                  </button>
                  
                  <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all w-8 h-8 flex items-center justify-center"
                  >
                    <i className="ri-arrow-right-s-line text-gray-700 text-lg"></i>
                  </button>
                </>
              )}

              {/* 인디케이터 점들 */}
              {blockRecords.length > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  {blockRecords.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentSlide ? 'bg-orange-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <div className="text-6xl mb-4">📸</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">첫 번째 작품을 만들어보세요!</h3>
              <p className="text-gray-600 text-sm mb-6">카메라로 블록 작품을 촬영해보세요</p>
              <button className="bg-orange-500 text-white px-6 py-2 rounded-xl font-medium whitespace-nowrap">
                사진 찍기
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <BottomNavigation currentPage="home" />
    </div>
  );
}