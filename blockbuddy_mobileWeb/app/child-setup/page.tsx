'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// child-setup 디렉토리에 있는 아이콘들 import
import lionIcon from './icon_lion.png';
import catIcon from './icon_cat.png';
import dogIcon from './icon_dog.png';
import foxIcon from './icon_fox.png';
import rabbitIcon from './icon_rabbit.png';
import bearIcon from './icon_bear.png';

export default function ChildSetupPage() {
  const router = useRouter();
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [childGender, setChildGender] = useState('');   // ✅ 성별 state 추가
  const [selectedAvatar, setSelectedAvatar] = useState(0);

  // 로컬 PNG 이미지 배열
  const avatarImages = [
    lionIcon.src,
    catIcon.src,
    dogIcon.src,
    foxIcon.src,
    rabbitIcon.src,
    bearIcon.src,
  ];

  const handleComplete = () => {
    if (childName.trim() && childAge && childGender) {
      localStorage.setItem(
        'childInfo',
        JSON.stringify({
          name: childName.trim(),
          age: childAge,
          gender: childGender,                  // ✅ 성별 저장
          avatar: avatarImages[selectedAvatar], // 이미지 경로
        })
      );
      router.push('/home');
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col max-w-sm mx-auto"
      style={{ backgroundColor: '#fffcef' }}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">아이 정보 입력</h1>
        <p className="text-gray-600">BlockBuddy와 함께 놀 준비를 해보세요</p>
      </div>

      <div className="flex-1 px-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          {/* 아바타 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              아바타 선택
            </label>
            <div className="grid grid-cols-3 gap-3">
              {avatarImages.map((imageUrl, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAvatar(index)}
                  className={`w-16 h-16 rounded-2xl overflow-hidden transition-all flex items-center justify-center ${
                    selectedAvatar === index
                      ? 'ring-4 ring-orange-500 shadow-lg scale-105'
                      : 'ring-2 ring-gray-200 hover:ring-gray-300'
                  }`}
                >
                  <img
                    src={imageUrl}
                    alt={`아바타 ${index + 1}`}
                    className="w-full h-full object-contain p-2"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 이름 입력 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              아이 이름
            </label>
            <input
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="이름을 입력해주세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />
          </div>

          {/* 나이 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              나이
            </label>
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }, (_, i) => i + 4).map((age) => (
                <button
                  key={age}
                  onClick={() => setChildAge(age.toString())}
                  className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                    childAge === age.toString()
                      ? 'bg-orange-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {age}세
                </button>
              ))}
            </div>
          </div>

          {/* 성별 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              성별
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['남자', '여자'].map((gender) => (
                <button
                  key={gender}
                  onClick={() => setChildGender(gender)}
                  className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                    childGender === gender
                      ? 'bg-orange-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 시작 버튼 */}
      <div className="p-6">
        <button
          onClick={handleComplete}
          disabled={!childName.trim() || !childAge || !childGender}
          className={`w-full py-4 rounded-2xl font-semibold text-lg shadow-lg transition-all whitespace-nowrap ${
            childName.trim() && childAge && childGender
              ? 'bg-orange-500 text-white active:scale-95'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          시작하기
        </button>
      </div>
    </div>
  );
}
