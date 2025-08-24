'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ThreeViewer from './ThreeViewer';
import { RecordData } from './types';

interface ViewerPageClientProps {
  params: { id: string };
}

export default function ViewerPageClient({ params }: ViewerPageClientProps) {
  const [record, setRecord] = useState<RecordData | null>(null);
  const [isTalkMode, setIsTalkMode] = useState(false);
  const [actionType, setActionType] = useState<'idle' | 'walk' | 'run'>('idle');

  useEffect(() => {
    const animalRecords: Record<number, RecordData> = {
      1: {
        id: 1,
        title: '사자 친구',
        description: '용감한 사자 친구를 레고로 만들었어요!',
        date: '2024-01-15',
        thumbnail:
          'https://readdy.ai/api/search-image?query=colorful%20LEGO%20animal%20lion%20toy%20figure%20made%20from%20building%20blocks%20on%20white%20clean%20background%2C%20bright%20studio%20lighting%2C%20child-friendly%20adorable%20cute%20animal%2C%20playful%20atmosphere%2C%20detailed%20construction%20toy&width=300&height=200&seq=lion1&orientation=landscape',
      },
      2: {
        id: 2,
        title: '트위티',
        description: '귀여운 발을 가진 트위티!',
        date: '2024-01-14',
        thumbnail:
          'https://readdy.ai/api/search-image?query=colorful%20LEGO%20animal%20elephant%20toy%20figure%20made%20from%20building%20blocks%20on%20white%20clean%20background%2C%20bright%20studio%20lighting%2C%20child-friendly%20adorable%20cute%20animal%2C%20playful%20atmosphere%2C%20detailed%20construction%20toy&width=300&height=200&seq=elephant1&orientation=landscape',
      },
      3: {
        id: 3,
        title: '야옹야옹',
        description: '예쁜 눈을 가진 고양이에요!!',
        date: '2024-01-13',
        thumbnail:
          'https://readdy.ai/api/search-image?query=colorful%20LEGO%20animal%20giraffe%20toy%20figure%20made%20from%20building%20blocks%20on%20white%20clean%20background%2C%20bright%20studio%20lighting%2C%20child-friendly%20adorable%20cute%20animal%2C%20playful%20atmosphere%2C%20detailed%20construction%20toy&width=300&height=200&seq=giraffe1&orientation=landscape',
      },
    };

    const idNum = Number(params.id);
    const recordData = animalRecords[idNum] ?? animalRecords[1];
    setRecord(recordData);
  }, [params.id]);

  if (!record) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center max-w-sm mx-auto">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  const handleActionClick = (action: 'walk' | 'run') => {
    setActionType(prev => (prev === action ? 'idle' : action));
  };

  return (
    <div className="min-h-screen bg-[#fffcef] max-w-sm mx-auto flex flex-col">
      {/* 헤더 */}
      <div className="p-4 flex items-center">
        <Link
          href="/home"
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
        >
          <i className="ri-arrow-left-line text-gray-700 text-xl"></i>
        </Link>

        <div className="flex-1 mx-4">
          <h1 className="text-lg font-bold text-gray-800 text-center">{record.title}</h1>
        </div>
      </div>

      {/* 3D 뷰어 + 상단-좌측 오버레이 액션버튼 */}
      <div className="flex-1 relative">
        <ThreeViewer record={record} isTalkMode={isTalkMode} actionType={actionType} />

        {!isTalkMode && (
          <div className="absolute top-3 left-3 z-10 flex items-center space-x-2">
            <button
              onClick={() => handleActionClick('walk')}
              className={`px-3 h-9 rounded-full shadow-md text-sm font-medium transition ${
                actionType === 'walk'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/90 text-gray-800 border border-gray-300 backdrop-blur'
              }`}
              aria-label="걷기"
            >
              🚶 걷기
            </button>

            <button
              onClick={() => handleActionClick('run')}
              className={`px-3 h-9 rounded-full shadow-md text-sm font-medium transition ${
                actionType === 'run'
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 text-gray-800 border border-gray-300 backdrop-blur'
              }`}
              aria-label={record.id === 2 ? '리듬타기' : '뛰기'}
            >
              {record.id === 2 ? '🕺 리듬타기' : '🏃 뛰기'}
            </button>
          </div>
        )}
      </div>

      {/* 하단 모드 선택 */}
      <div className="p-4 space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={() => {
              setIsTalkMode(false);
              setActionType('idle');
            }}
            className={`flex-1 py-3 rounded-xl font-medium text-center whitespace-nowrap transition-all ${
              !isTalkMode ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            액션모드
          </button>
          <button
            onClick={() => setIsTalkMode(true)}
            className={`flex-1 py-3 rounded-xl font-medium text-center whitespace-nowrap transition-all ${
              isTalkMode ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            대화모드
          </button>
        </div>
      </div>
    </div>
  );
}
