'use client';

import Link from 'next/link';

interface BottomNavigationProps {
  currentPage: 'home' | 'camera' | 'my';
}

export default function BottomNavigation({ currentPage }: BottomNavigationProps) {
  const navItems = [
    {
      id: 'home',
      label: '홈',
      icon: 'ri-home-line',
      activeIcon: 'ri-home-fill',
      href: '/home'
    },
    {
      id: 'camera',
      label: '카메라',
      icon: 'ri-camera-line',
      activeIcon: 'ri-camera-fill',
      href: '/camera'
    },
    {
      id: 'my',
      label: '마이',
      icon: 'ri-user-line',
      activeIcon: 'ri-user-fill',
      href: '/my'
    }
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all ${'flex flex-col items-center py-2 px-4 rounded-xl transition-all ' + (isActive ? 'text-orange-500 bg-orange-50' : 'text-gray-500')}`}
            >
              <div className="w-6 h-6 flex items-center justify-center mb-1">
                <i className={`${isActive ? item.activeIcon : item.icon} text-xl`}></i>
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}