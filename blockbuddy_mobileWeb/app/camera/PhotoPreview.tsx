
'use client';

import { useState } from 'react';

interface PhotoPreviewProps {
  photos: string[];
  currentStep: number;
  onRetake: (step: number) => void;
  onNext: () => void;
  onSave: (title: string, description: string) => void;
  isProcessing: boolean;
}

export default function PhotoPreview({ photos, currentStep, onRetake, onNext, onSave, isProcessing }: PhotoPreviewProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [processingStep, setProcessingStep] = useState('uploading'); // uploading, removing_bg, creating_3d, complete

  const stepLabels = ['정면', '왼쪽', '오른쪽', '뒤쪽'];
  const isLastStep = currentStep === 3;
  const isAllPhotosComplete = photos.filter(Boolean).length === 4;

  const handleSave = async () => {
    if (title.trim()) {
      setProcessingStep('uploading');
      
      // 처리 단계별 시뮬레이션
      setTimeout(() => setProcessingStep('removing_bg'), 2000);
      setTimeout(() => setProcessingStep('creating_3d'), 5000);
      setTimeout(() => setProcessingStep('complete'), 8000);
      
      onSave(title.trim(), description.trim());
    }
  };

  const getProcessingMessage = () => {
    switch (processingStep) {
      case 'uploading':
        return {
          title: '사진 업로드 중...',
          subtitle: '4장의 사진을 서버에 업로드하고 있습니다',
          progress: 25
        };
      case 'removing_bg':
        return {
          title: '배경 제거 중...',
          subtitle: 'AI가 블록 작품만 깔끔하게 분리하고 있습니다',
          progress: 50
        };
      case 'creating_3d':
        return {
          title: '3D 모델 생성 중...',
          subtitle: '여러 각도의 사진을 분석하여 3D 모델을 만들고 있습니다',
          progress: 85
        };
      case 'complete':
        return {
          title: '3D 모델 완성!',
          subtitle: '멋진 3D 모델이 완성되었습니다',
          progress: 100
        };
      default:
        return {
          title: '처리 중...',
          subtitle: '잠시만 기다려주세요',
          progress: 0
        };
    }
  };

  if (isProcessing) {
    const processInfo = getProcessingMessage();
    
    return (
      <div className="w-full h-full bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-6">
        <div className="text-center max-w-sm w-full">
          {/* 처리 단계별 아이콘 */}
          <div className="mb-6">
            {processingStep === 'uploading' && (
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-upload-cloud-2-line text-white text-3xl"></i>
              </div>
            )}
            {processingStep === 'removing_bg' && (
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-scissors-line text-white text-3xl"></i>
              </div>
            )}
            {processingStep === 'creating_3d' && (
              <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-3d-view-line text-white text-3xl animate-spin"></i>
              </div>
            )}
            {processingStep === 'complete' && (
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-checkbox-circle-line text-white text-3xl"></i>
              </div>
            )}
          </div>

          {/* 제목과 설명 */}
          <h3 className="text-2xl font-bold text-gray-800 mb-3">{processInfo.title}</h3>
          <p className="text-gray-600 mb-8 leading-relaxed">{processInfo.subtitle}</p>

          {/* 진행 바 */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${processInfo.progress}%` }}
            ></div>
          </div>
          
          {/* 퍼센트 표시 */}
          <p className="text-lg font-semibold text-orange-600 mb-6">{processInfo.progress}%</p>

          {/* 처리 단계 표시 */}
          <div className="flex justify-center space-x-3">
            <div className={`flex flex-col items-center space-y-1 ${'flex flex-col items-center space-y-1 ' + (processingStep === 'uploading' || processingStep === 'removing_bg' || processingStep === 'creating_3d' || processingStep === 'complete' ? 'opacity-100' : 'opacity-30')}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${'w-8 h-8 rounded-full flex items-center justify-center text-xs ' + (processingStep === 'uploading' || processingStep === 'removing_bg' || processingStep === 'creating_3d' || processingStep === 'complete' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500')}`}>
                <i className="ri-upload-line"></i>
              </div>
              <span className="text-xs text-gray-600">업로드</span>
            </div>
            
            <div className="flex items-center">
              <div className={`w-6 h-0.5 ${'w-6 h-0.5 ' + (processingStep === 'removing_bg' || processingStep === 'creating_3d' || processingStep === 'complete' ? 'bg-blue-500' : 'bg-gray-300')}`}></div>
            </div>
            
            <div className={`flex flex-col items-center space-y-1 ${'flex flex-col items-center space-y-1 ' + (processingStep === 'removing_bg' || processingStep === 'creating_3d' || processingStep === 'complete' ? 'opacity-100' : 'opacity-30')}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${'w-8 h-8 rounded-full flex items-center justify-center text-xs ' + (processingStep === 'removing_bg' || processingStep === 'creating_3d' || processingStep === 'complete' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500')}`}>
                <i className="ri-scissors-line"></i>
              </div>
              <span className="text-xs text-gray-600">배경제거</span>
            </div>
            
            <div className="flex items-center">
              <div className={`w-6 h-0.5 ${'w-6 h-0.5 ' + (processingStep === 'creating_3d' || processingStep === 'complete' ? 'bg-green-500' : 'bg-gray-300')}`}></div>
            </div>
            
            <div className={`flex flex-col items-center space-y-1 ${'flex flex-col items-center space-y-1 ' + (processingStep === 'creating_3d' || processingStep === 'complete' ? 'opacity-100' : 'opacity-30')}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${'w-8 h-8 rounded-full flex items-center justify-center text-xs ' + (processingStep === 'creating_3d' || processingStep === 'complete' ? 'bg-purple-500 text-white' : 'bg-gray-300 text-gray-500')}`}>
                <i className="ri-3d-view-line"></i>
              </div>
              <span className="text-xs text-gray-600">3D생성</span>
            </div>
          </div>

          {/* 예상 소요 시간 */}
          <div className="mt-8 p-4 bg-white/70 backdrop-blur-sm rounded-xl">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <i className="ri-time-line"></i>
              <span>예상 소요시간: 1-2분</span>
            </div>
          </div>

          {/* 재미있는 팁 */}
          <div className="mt-4 p-4 bg-orange-100/70 backdrop-blur-sm rounded-xl">
            <div className="flex items-start space-x-2 text-sm text-orange-700">
              <i className="ri-lightbulb-line mt-0.5"></i>
              <div className="text-left">
                <p className="font-medium mb-1">알고 계셨나요?</p>
                <p>AI가 1만 개 이상의 블록 작품을 학습해서 더욱 정확한 3D 모델을 만들어드려요!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* 사진 미리보기 */}
      <div className="flex-1 relative">
        {!showForm ? (
          <>
            <img 
              src={photos[currentStep]} 
              alt={`${stepLabels[currentStep]} 사진`}
              className="w-[390px] h-[780px] object-contain mx-auto rounded-xl shadow-lg"
            />
            
            {/* 상단 헤더 */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
              <button 
                onClick={() => onRetake(currentStep)}
                className="w-10 h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center"
              >
                <i className="ri-arrow-left-line text-white text-xl"></i>
              </button>
              
              <div className="bg-black bg-opacity-50 px-4 py-2 rounded-full">
                <span className="text-white text-sm font-medium">
                  {stepLabels[currentStep]} ({currentStep + 1}/4)
                </span>
              </div>
              
              <div className="w-10 h-10"></div>
            </div>

            {/* 하단 액션 버튼들 */}
            <div className="absolute bottom-8 left-4 right-4 flex space-x-4">
              <button 
                onClick={() => onRetake(currentStep)}
                className="flex-1 bg-gray-600 bg-opacity-80 text-white py-3 rounded-xl font-medium whitespace-nowrap"
              >
                다시 찍기
              </button>
              
              {!isLastStep ? (
                <button 
                  onClick={onNext}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-medium whitespace-nowrap"
                >
                  다음 ({currentStep + 2}/4)
                </button>
              ) : (
                <button 
                  onClick={() => setShowForm(true)}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-medium whitespace-nowrap"
                >
                  완료
                </button>
              )}
            </div>
          </>
        ) : (
          /* 4장 썸네일 그리드 */
          <div className="p-4 space-y-4 bg-gray-50">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-2">사진 업로드</h3>
              <p className="text-sm text-gray-500">{photos.filter(Boolean).length}/4</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {stepLabels.map((label, index) => (
                <div key={index} className="relative">
                  {photos[index] ? (
                    <div className="aspect-square bg-white rounded-xl overflow-hidden border-2 border-gray-200">
                      <img 
                        src={photos[index]} 
                        alt={`${label} 사진`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                        {label}
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square bg-white rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <i className="ri-camera-line text-2xl mb-1"></i>
                        <p className="text-xs">{label} 사진</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 저장 폼 */}
      {showForm && (
        <div className="bg-white p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">작품 정보 입력</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">작품 제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="작품의 이름을 지어주세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">작품 설명</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="어떤 작품을 만들었는지 설명해주세요"
                rows={3}
                maxLength={200}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{description.length}/200</p>
            </div>
          </div>

          <div className="flex space-x-4 mt-6">
            <button 
              onClick={() => setShowForm(false)}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-medium whitespace-nowrap"
            >
              취소
            </button>
            <button 
              onClick={handleSave}
              disabled={!title.trim()}
              className={`flex-1 py-3 rounded-xl font-medium whitespace-nowrap ${'flex-1 py-3 rounded-xl font-medium whitespace-nowrap ' + (title.trim() ? 'bg-orange-500 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed')}`}
            >
              3D 모델 생성하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}