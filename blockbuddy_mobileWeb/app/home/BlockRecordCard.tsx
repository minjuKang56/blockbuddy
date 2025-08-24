
'use client';

import { useRouter } from 'next/navigation';

interface BlockRecord {
  id: number;
  title: string;
  date: string;
  thumbnail: string;
  description: string;
}

interface BlockRecordCardProps {
  record: BlockRecord;
}

export default function BlockRecordCard({ record }: BlockRecordCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/viewer/${record.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // "2025-01-15" 같은 형태
  };

  return (
    <div 
      onClick={handleCardClick}
      className="w-full h-120 bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
    >
      <div className="relative">
        <img 
          src={record.thumbnail}
          alt={record.title}
          className="w-full h-48 object-contain bg-white"
        />
        <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-lg text-xs">
          {formatDate(record.date)}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 text-lg">{record.title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{record.description}</p>
        
        <div className="mt-4">
          <button className="w-full bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap">
            3D 보기
          </button>
        </div>
      </div>
    </div>
  );
}
