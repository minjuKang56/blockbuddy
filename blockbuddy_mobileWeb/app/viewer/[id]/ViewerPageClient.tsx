'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ThreeViewer from './ThreeViewer';
import { RecordData } from './types';
import { usePushToTalk } from '../../lib/usePushToTalk'; // viewer/[id] 기준 두 단계 ↑

interface ViewerPageClientProps {
  params: { id: string };
}

export default function ViewerPageClient({ params }: ViewerPageClientProps) {
  const [record, setRecord] = useState<RecordData | null>(null);
  const [isTalkMode, setIsTalkMode] = useState(false);
  const [actionType, setActionType] = useState<'idle' | 'walk' | 'run'>('idle');

  // 힌트 1 (↑ 버튼) 상태
  const [hintMounted, setHintMounted] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);

  // 힌트 2 (대화모드 안내) 상태
  const [talkHintMounted, setTalkHintMounted] = useState(false);
  const [talkHintVisible, setTalkHintVisible] = useState(false);
  const talkHintChainRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 말하기 훅
  const { recording, start, stopAndUpload } = usePushToTalk();
  const [bubble, setBubble] = useState<string>('말하기 버튼을 눌러보세요!');
  const downAtRef = useRef<number>(0);

  // 데모용 레코드 세팅
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

  // 힌트 트리거 (1)
  function triggerHint() {
    setHintMounted(true);
    const t1 = setTimeout(() => setHintVisible(true), 50);     // 페이드인
    const t2 = setTimeout(() => setHintVisible(false), 3050);  // 3초 후 페이드아웃
    const t3 = setTimeout(() => setHintMounted(false), 3550);  // 언마운트
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }

  // 힌트 트리거 (2)
  function triggerTalkHint() {
    setTalkHintMounted(true);
    const a = setTimeout(() => setTalkHintVisible(true), 50);
    const b = setTimeout(() => setTalkHintVisible(false), 3050);
    const c = setTimeout(() => setTalkHintMounted(false), 3550);
    return () => { clearTimeout(a); clearTimeout(b); clearTimeout(c); };
  }

  // 액션모드 진입 시: 힌트1(3s) → 5s 후 힌트2(3s)
  useEffect(() => {
    if (!isTalkMode) {
      const clean1 = triggerHint(); // 첫 힌트
      talkHintChainRef.current = setTimeout(() => {
        // 여전히 액션모드일 때만 두 번째 힌트
        if (!isTalkMode) triggerTalkHint();
      }, 9000); // 3.55s + 5s

      return () => {
        clean1 && clean1();
        if (talkHintChainRef.current) clearTimeout(talkHintChainRef.current);
        setHintVisible(false); setHintMounted(false);
        setTalkHintVisible(false); setTalkHintMounted(false);
      };
    } else {
      // 대화모드 전환 시 즉시 숨김
      if (talkHintChainRef.current) clearTimeout(talkHintChainRef.current);
      setHintVisible(false); setHintMounted(false);
      setTalkHintVisible(false); setTalkHintMounted(false);
    }
  }, [isTalkMode]);

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

  // 포인터 다운/업으로 통일 (중복 이벤트 방지)
  function handlePressStart(e: React.PointerEvent<HTMLButtonElement>) {
  e.preventDefault();
  e.currentTarget.setPointerCapture(e.pointerId); // 밖으로 나가도 pointerup 보장
  downAtRef.current = performance.now();
  start();
}

  // 말하기 버튼 "떼기": STT → LLM → TTS
  async function handlePressEnd(e: React.PointerEvent<HTMLButtonElement>) {
    e.preventDefault();

    // 너무 짧은 입력은 무시
    const held = performance.now() - (downAtRef.current || performance.now());
    if (held < 700) {
      await stopAndUpload(); // 리소스 정리만
      setBubble('조금 더 길게 말씀해 주세요 (0.7초 이상)');
      return;
    }

    if (!record) {
      setBubble('아직 준비 중이에요… 잠시만!');
      return;
    }

    setBubble('🎧 인식 중…');

    // STT
    const userText = await stopAndUpload();
    if (!userText) {
      setBubble('음성이 인식되지 않았어요. 다시 시도해볼까요?');
      return;
    }
    setBubble(userText);

    // LLM
    const llmRes = await fetch('/api/llm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: userText }),
    });
    const llm = await llmRes.json().catch(() => ({ text: '' as string }));
    const bot = (llm.text || '응답을 만들지 못했어요.').trim();
    setBubble(bot);

    // TTS (이미지 기반 보이스 선택: public/images/lion_thumnail.png 사용)
    const TTS_IMAGE_URL = '/images/lion_thumnail.png';
    const ttsRes = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: bot, imageUrl: TTS_IMAGE_URL }),
    });

    // 실패 시 브라우저 음성 폴백
    if (!ttsRes.ok) {
      const u = new SpeechSynthesisUtterance(bot);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
      setBubble(prev => prev + '\n🔇 서버 TTS 장애로 브라우저 음성으로 읽었습니다.');
      return;
    }

    // 성공 시 오디오 재생
    const audioBlob = await ttsRes.blob();
    const url = URL.createObjectURL(audioBlob);
    const audio = new Audio(url);
    await audio.play().catch(() => {
      setBubble(prev => prev + '\n(▶ 재생 버튼을 한 번 눌러주세요)');
    });
  }

  return (
    <div className="min-h-screen bg-[#fffcef] max-w-sm mx-auto flex flex-col">
      {/* 헤더 */}
      <div className="p-4 flex items-center">
        <Link href="/home" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
          <i className="ri-arrow-left-line text-gray-700 text-xl"></i>
        </Link>
        <div className="flex-1 mx-4">
          <h1 className="text-lg font-bold text-gray-800 text-center">{record.title}</h1>
        </div>
      </div>

      {/* 3D 뷰어 + 오버레이 */}
      <div className="flex-1 relative">
        <ThreeViewer record={record} isTalkMode={isTalkMode} actionType={actionType} />

        {/* 대화모드일 때 말풍선 — 상단 중앙 */}
        {isTalkMode && (
          <div className="absolute inset-x-0 top-6 z-10 flex justify-center pointer-events-none">
            <div className="bg-white/95 border border-orange-200 shadow-lg rounded-2xl px-4 py-3 w-[min(80vw,250px)] text-center">
              <p className="text-gray-800 text-sm whitespace-pre-wrap leading-none">{bubble}</p>
              <div className="mt-1 text-[11px] text-gray-500">
                {recording ? '🎤 녹음 중… 버튼을 떼세요' : '🗣️ 말하기 버튼을 눌러요'}
              </div>
            </div>
          </div>
        )}

        {/* 액션 버튼 (대화모드 아닐 때만) */}
        {!isTalkMode && (
          <div className="absolute top-3 left-3 z-10 flex items-center space-x-2">
            <button
              onClick={() => handleActionClick('walk')}
              className={`px-3 h-9 rounded-full shadow-md text-sm font-medium transition ${
                actionType === 'walk' ? 'bg-blue-500 text-white' : 'bg-white/90 text-gray-800 border border-gray-300 backdrop-blur'
              }`}
              aria-label="걷기"
            >
              🚶 걷기
            </button>
            <button
              onClick={() => handleActionClick('run')}
              className={`px-3 h-9 rounded-full shadow-md text-sm font-medium transition ${
                actionType === 'run' ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-800 border border-gray-300 backdrop-blur'
              }`}
              aria-label={record.id === 2 ? '리듬타기' : '뛰기'}
            >
              {record.id === 2 ? '🕺 리듬타기' : '🏃 뛰기'}
            </button>
          </div>
        )}

        {/* 힌트 1: ↑ 버튼 안내 (3초) */}
        {!isTalkMode && hintMounted && (
          <div
            className={[
              'absolute left-1/2 top-16 -translate-x-1/2 z-10',
              'transition-all duration-500 ease-out',
              hintVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2',
              'pointer-events-none',
            ].join(' ')}
          >
            <div className="px-4 py-1.5 rounded-xl bg-white/95 border border-orange-200 text-gray-800 text-[14px] shadow whitespace-nowrap tracking-tight">
              ↑ 버튼을 눌러 친구를 움직여보세요
            </div>
          </div>
        )}

        {/* 힌트 2: 5초 후 3초간 — 대화모드 안내 (하단 중앙 위쪽) */}
        {!isTalkMode && talkHintMounted && (
        <div
          className={[
            "absolute left-1/2 top-16 -translate-x-1/2 z-10",
            "transition-all duration-500 ease-out",
            talkHintVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
            "pointer-events-none",
          ].join(" ")}
        >
          <div className="px-4 py-1.5 rounded-xl bg-white/95 border border-orange-200
                          text-gray-800 text-[14px] shadow whitespace-nowrap tracking-tight">
            ↓대화모드를 눌러 이야기를 해보세요
          </div>
        </div>
      )}
      </div>

      {/* 하단 모드 + 말하기(작은 플로팅) — 동일 폭 1/2씩 */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 items-start">
          {/* 액션모드 (좌) */}
          <button
            onClick={() => { setIsTalkMode(false); setActionType('idle'); }}
            className={`w-full py-3 rounded-xl font-medium text-center whitespace-nowrap transition-all ${
              !isTalkMode ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            액션모드
          </button>

          {/* 대화모드 (우) + 플로팅 PTT */}
          <div className="relative inline-block">
            <button
              onClick={() => setIsTalkMode(true)}
              className={`w-full py-3 rounded-xl font-medium text-center whitespace-nowrap transition-all ${
                isTalkMode ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              대화모드
            </button>

            {isTalkMode && (
              <button
                onPointerDown={handlePressStart}
                onPointerUp={handlePressEnd}
                onPointerLeave={recording ? handlePressEnd : undefined}
                className={`absolute right-0 top-0 -translate-y-[150%] z-10
                            px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg border
                            ${recording
                              ? 'bg-red-500 border-red-600 text-white'
                              : 'bg-orange-500 border-orange-600 text-white'}`}
                aria-pressed={recording}
                title="말하기 (누르고 있기)"
              >
                🎙️ {recording ? '말하는 중' : '말하기'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
