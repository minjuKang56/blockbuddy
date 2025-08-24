import { Suspense } from 'react';
import ViewerPageClient from './ViewerPageClient';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' }
  ];
}

export default function ViewerPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center max-w-sm mx-auto">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <ViewerPageClient params={params} />
    </Suspense>
  );
}