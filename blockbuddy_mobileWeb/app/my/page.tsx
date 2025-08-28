'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BottomNavigation from '../components/BottomNavigation';

// ✅ 자녀 정보 타입 지정
type ChildInfo = {
  name: string;
  age: string;
  avatar: string;
};

export default function MyPage() {
  const [childInfo, setChildInfo] = useState<ChildInfo | null>(null);
  const [parentInfo, setParentInfo] = useState({
    name: '강민주 님',
    email: 'parent@example.com'
  });

  useEffect(() => {
    const savedChildInfo = localStorage.getItem('childInfo');
    if (savedChildInfo) {
      setChildInfo(JSON.parse(savedChildInfo));
    }
  }, []);

  const menuItems = [
    { icon: 'ri-bar-chart-line', title: '성장 리포트', desc: '아이의 발달 상황을 확인하세요', href: '/report' },
    { icon: 'ri-settings-line', title: '설정', desc: '앱 설정을 변경하세요', href: '/settings' },
    { icon: 'ri-question-line', title: '도움말', desc: '사용법을 확인하세요', href: '/help' },
    { icon: 'ri-phone-line', title: '문의하기', desc: '궁금한 점을 문의하세요', href: '/contact' }
  ];

  return (
    <div
      className="min-h-screen max-w-sm mx-auto flex flex-col"
      style={{ backgroundColor: '#fffcef' }}
    >
      <div className="flex-1 pb-20">
        {/* 헤더 */}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">마이페이지</h1>
        </div>

        {/* 부모 정보 */}
        <div className="mx-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                  <i className="ri-user-line text-white text-lg"></i>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {parentInfo.name}
                  </h2>
                  <p className="text-sm text-gray-500">{parentInfo.email}</p>
                </div>
              </div>
              <button className="text-gray-400">
                <i className="ri-edit-line text-lg"></i>
              </button>
            </div>
          </div>
        </div>

        {/* 자녀 정보 카드 */}
        {childInfo && (
          <div className="mx-4 mb-6">
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-gray-800">우리 아이</h3>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-[#fffcef] rounded-2xl overflow-hidden flex items-center justify-center">
                  {childInfo.avatar ? (
                    <img
                      src={childInfo.avatar}
                      alt="아이 아바타"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-2xl">🙂</span>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800">
                    {childInfo.name}
                  </h2>
                  <p className="text-gray-600">{childInfo.age}세</p>
                  <p className="text-sm text-gray-500 mt-1">
                    BlockBuddy와 함께 성장 중!
                  </p>
                </div>
                <button className="text-gray-400">
                  <i className="ri-edit-line text-xl"></i>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 통계 카드 */}
        <div className="mx-4 mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-orange-500">12</div>
              <div className="text-xs text-gray-600">총 작품</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-blue-500">8</div>
              <div className="text-xs text-gray-600">대화 횟수</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-green-500">5</div>
              <div className="text-xs text-gray-600">레벨</div>
            </div>
          </div>
        </div>

        {/* 메뉴 리스트 */}
        <div className="mx-4">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`w-full flex items-center p-4 text-left hover:bg-gray-50 transition-colors block ${
                  index !== menuItems.length - 1
                    ? 'border-b border-gray-100'
                    : ''
                }`}
              >
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                  <i className={`${item.icon} text-gray-600 text-lg`}></i>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <i className="ri-arrow-right-s-line text-gray-400 text-xl"></i>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <BottomNavigation currentPage="my" />
    </div>
  );
}
