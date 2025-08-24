'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';

interface CameraCaptureProps {
  onPhotoCapture: (photoDataUrl: string, step: number) => void;
  currentStep: number;
}

export default function CameraCapture({ onPhotoCapture, currentStep }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [showTips, setShowTips] = useState(() => {
    // localStorage에서 팁 표시 여부 확인 (한 번만 표시)
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('camera_tips_seen');
    }
    return true;
  });
  const [error, setError] = useState<string>('');
  const [cameraFallback, setCameraFallback] = useState(false);
  const [showUploadOption, setShowUploadOption] = useState(false);

  const stepLabels = ['정면', '왼쪽', '오른쪽', '뒤쪽'];
  const stepIcons = ['👀', '👈', '👉', '🔄'];
  const stepInstructions = [
    '작품을 화면 중앙에 놓고 정면을 향하게 해주세요',
    '작품을 왼쪽으로 90도 돌려서 찍어주세요',
    '작품을 오른쪽으로 90도 돌려서 찍어주세요', 
    '작품을 뒤쪽으로 180도 돌려서 찍어주세요'
  ];

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 👇 startCamera 안에서 이 부분만 바꿔주세요
const startCamera = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === 'videoinput');

    if (videoDevices.length === 0) {
      setError('카메라를 찾을 수 없습니다');
      setCameraFallback(true);
      setIsReady(true);
      return;
    }

    // 공통 해상도
    const base: MediaTrackConstraints = {
      width:  { ideal: 390 },
      height: { ideal: 640 },
      // advanced: [{ focusMode: 'continuous' as any }], // 필요시
    };

    let videoConstraints: MediaTrackConstraints = {
      ...base,
      facingMode: { ideal: 'environment' }  // ✅ 항상 객체 형태 유지
    };

    let mediaStream: MediaStream;

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints
      });
    } catch {
      console.log('후면 카메라 실패 → 전면 시도');
      videoConstraints = {
        ...base,
        facingMode: { ideal: 'user' }       // ✅ 문자열 대신 객체
      };

      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints
        });
      } catch {
        console.log('전면도 실패 → 기본 비디오 시도');
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
    }

    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.onloadedmetadata = () => {
        setIsReady(true);
        setError('');
      };
    }
    setStream(mediaStream);
  } catch (err) {
    console.error('카메라 접근 실패:', err);
    setError('카메라에 접근할 수 없습니다. 권한을 확인해주세요.');
    setCameraFallback(true);
    setIsReady(true);
  }
};


  const capturePhoto = () => {
    if (cameraFallback) {
      const dummyImages = [
        'https://readdy.ai/api/search-image?query=colorful%20building%20blocks%20construction%20toy%20front%20view%20on%20white%20clean%20background%2C%20bright%20room%20lighting%2C%20realistic%20photography%2C%20child-friendly%20toy&width=390&height=640&seq=dummy1&orientation=portrait',
        'https://readdy.ai/api/search-image?query=colorful%20building%20blocks%20construction%20toy%20left%20side%20view%20on%20white%20clean%20background%2C%20bright%20room%20lighting%2C%20realistic%20photography%2C%20child-friendly%20toy&width=390&height=640&seq=dummy2&orientation=portrait',
        'https://readdy.ai/api/search-image?query=colorful%20building%20blocks%20construction%20toy%20right%20side%20view%20on%20white%20clean%20background%2C%20bright%20room%20lighting%2C%20realistic%20photography%2C%20child-friendly%20toy&width=390&height=640&seq=dummy3&orientation=portrait',
        'https://readdy.ai/api/search-image?query=colorful%20building%20blocks%20construction%20toy%20back%20view%20on%20white%20clean%20background%2C%20bright%20room%20lighting%2C%20realistic%20photography%2C%20child-friendly%20toy&width=390&height=640&seq=dummy4&orientation=portrait'
      ];
      onPhotoCapture(dummyImages[currentStep], currentStep);
      return;
    }

    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      canvas.width = video.videoWidth || 390;
      canvas.height = video.videoHeight || 640;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        onPhotoCapture(photoDataUrl, currentStep);
      }
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          onPhotoCapture(result, currentStep);
        }
      };
      reader.readAsDataURL(file);
    }
    setShowUploadOption(false);
  };

  const handleTipsClose = () => {
    setShowTips(false);
    // localStorage에 팁을 본 것으로 저장
    if (typeof window !== 'undefined') {
      localStorage.setItem('camera_tips_seen', 'true');
    }
  };

  const handleTipsShow = () => {
    setShowTips(true);
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* 촬영 주의사항 팝업 */}
      {showTips && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-camera-line text-orange-500 text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-800">사진 촬영 시 주의사항</h3>
            </div>

            <div className="space-y-3 text-sm text-gray-700 mb-6">
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <p>작품이 잘 보이도록 정면, 왼쪽, 오른쪽, 뒤쪽 총 4장의 사진을 찍어주세요.</p>
              </div>

              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <p>배경은 깔끔하고 단색(흰색/밝은색)일수록 좋아요.</p>
              </div>

              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <p>뒤에 다른 물체(책, 장난감, 가구 등)가 함께 찍히지 않도록 주의해주세요.</p>
              </div>

              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <p>그림자가 최소화되도록 밝은 곳에서 촬영해주세요.</p>
              </div>

              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">5</span>
                </div>
                <p>작품이 사진 프레임 중앙에 오도록 찍어주세요.</p>
              </div>
            </div>

            <button
              onClick={handleTipsClose}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold whitespace-nowrap"
            >
              확인했어요!
            </button>
          </div>
        </div>
      )}

      {/* 업로드 옵션 선택 팝업 */}
      {showUploadOption && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-image-line text-blue-500 text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-800">{stepLabels[currentStep]} 사진 선택</h3>
              <p className="text-sm text-gray-600 mt-2">카메라로 촬영하거나 갤러리에서 선택하세요</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowUploadOption(false)}
                className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold whitespace-nowrap flex items-center justify-center space-x-2"
              >
                <i className="ri-camera-line text-xl"></i>
                <span>카메라로 촬영하기</span>
              </button>
              
              <button
                onClick={handleFileSelect}
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold whitespace-nowrap flex items-center justify-center space-x-2"
              >
                <i className="ri-image-line text-xl"></i>
                <span>갤러리에서 선택하기</span>
              </button>
            </div>

            <button
              onClick={() => setShowUploadOption(false)}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-medium mt-4 whitespace-nowrap"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 카메라 뷰 */}
      <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
        {!cameraFallback ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center text-white p-8">
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-camera-off-line text-3xl"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2">카메라를 사용할 수 없어요</h3>
              <p className="text-sm text-gray-300 mb-4">갤러리에서 사진을 선택하거나 샘플 이미지로 체험해보세요</p>
              {error && (
                <p className="text-xs text-red-400 mb-4">{error}</p>
              )}
            </div>
          </div>
        )}

        {!isReady && !cameraFallback && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center text-white">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
              <p>카메라 준비 중...</p>
            </div>
          </div>
        )}

        {/* 가이드 오버레이 */}
        {!cameraFallback && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="border-2 border-white border-dashed rounded-2xl w-80 h-60 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-4xl mb-2">{stepIcons[currentStep]}</div>
                <p className="text-lg font-semibold mb-1">{stepLabels[currentStep]}</p>
                <p className="text-sm px-4">{stepInstructions[currentStep]}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 상단 컨트롤 */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
        <Link 
          href="/home"
          className="w-10 h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center"
        >
          <i className="ri-arrow-left-line text-white text-xl"></i>
        </Link>

        <div className="bg-black bg-opacity-50 px-4 py-2 rounded-full flex items-center space-x-2">
          <span className="text-white text-sm font-medium">
            {stepLabels[currentStep]} ({currentStep + 1}/4)
          </span>
        </div>

        <button 
          onClick={handleTipsShow}
          className="w-10 h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center"
        >
          <i className="ri-information-line text-white text-xl"></i>
        </button>
      </div>

      {/* 하단 촬영 버튼 */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center space-x-4">
        {/* 갤러리 버튼 */}
        <button
          onClick={handleFileSelect}
          className="w-12 h-12 bg-white bg-opacity-80 rounded-full flex items-center justify-center"
        >
          <i className="ri-image-line text-gray-700 text-xl"></i>
        </button>

        {/* 촬영 버튼 */}
        <button
          onClick={cameraFallback ? () => setShowUploadOption(true) : capturePhoto}
          disabled={!cameraFallback && !isReady}
          className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all ${(isReady || cameraFallback) ? 'bg-white active:scale-95' : 'bg-gray-500 cursor-not-allowed'}`}
        >
          <div className={`w-16 h-16 rounded-full ${(isReady || cameraFallback) ? 'bg-orange-500' : 'bg-gray-400'}`}></div>
        </button>

        {/* 더보기 옵션 버튼 */}
        <button
          onClick={() => setShowUploadOption(true)}
          className="w-12 h-12 bg-white bg-opacity-80 rounded-full flex items-center justify-center"
        >
          <i className="ri-more-line text-gray-700 text-xl"></i>
        </button>
      </div>
    </div>
  );
}