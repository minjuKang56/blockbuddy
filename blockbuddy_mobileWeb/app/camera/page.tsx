
'use client';

import { useState, useRef } from 'react';
import BottomNavigation from '../components/BottomNavigation';
import CameraCapture from './CameraCapture';
import PhotoPreview from './PhotoPreview';

export default function CameraPage() {
  const [photos, setPhotos] = useState<string[]>(['', '', '', '']); // 4장의 사진
  const [currentStep, setCurrentStep] = useState(0); // 현재 촬영 단계 (0-3)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePhotoCapture = (photoDataUrl: string, step: number) => {
    setCapturedPhoto(photoDataUrl);
    
    // photos 배열 업데이트
    const newPhotos = [...photos];
    newPhotos[step] = photoDataUrl;
    setPhotos(newPhotos);
  };

  const handleRetake = (step?: number) => {
    setCapturedPhoto(null);
    if (step !== undefined) {
      setCurrentStep(step);
    }
  };

  const handleNext = () => {
    setCapturedPhoto(null);
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSave = async (title: string, description: string) => {
    setIsProcessing(true);
    
    const newRecord = {
      id: Date.now(),
      title,
      description,
      photos: photos.filter(Boolean), // 빈 문자열 제거
      date: new Date().toISOString().split('T')[0],
      thumbnail: photos[0] // 첫 번째 사진을 썸네일로 사용
    };

    const existingRecords = localStorage.getItem('blockRecords');
    const records = existingRecords ? JSON.parse(existingRecords) : [];
    
    records.unshift(newRecord);
    localStorage.setItem('blockRecords', JSON.stringify(records));

    // 3D 처리 시뮬레이션 (3초 대기)
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsProcessing(false);
    setPhotos(['', '', '', '']);
    setCurrentStep(0);
    setCapturedPhoto(null);
    
    window.location.href = '/home';
  };

  return (
    <div className="min-h-screen bg-black max-w-sm mx-auto flex flex-col">
      <div className="flex-1">
        {!capturedPhoto ? (
          <CameraCapture 
            onPhotoCapture={handlePhotoCapture}
            currentStep={currentStep}
          />
        ) : (
          <PhotoPreview 
            photos={photos}
            currentStep={currentStep}
            onRetake={handleRetake}
            onNext={handleNext}
            onSave={handleSave}
            isProcessing={isProcessing}
          />
        )}
      </div>

      {!capturedPhoto && <BottomNavigation currentPage="camera" />}
    </div>
  );
}
