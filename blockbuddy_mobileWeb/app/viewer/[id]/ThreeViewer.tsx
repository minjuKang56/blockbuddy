// ThreeViewer.tsx — 원본 GLB 표시(배경만 유지)
'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RecordData } from './types';
import { ASSETS, Action } from './assets';


interface ThreeViewerProps {
  record: RecordData;
  isTalkMode: boolean;
  actionType?: 'idle' | 'walk' | 'run'; // ✅ UI와 동일
}


function getModelUrl(
  recordId: number,
  action: 'idle' | 'walk' | 'run',
  talk: boolean
) {
  const cfg = ASSETS[recordId] ?? ASSETS[1];
  if (talk) return cfg.talk;

  // 트위티(2번)에서 run 요청이 오면 dance가 있으면 그걸 사용
  const key = (recordId === 2 && action === 'run' && cfg.action.dance)
    ? 'dance'
    : action;

  return cfg.action[key] ?? cfg.action.idle;
}

function frameToBox(
  box: THREE.Box3,
  camera: THREE.PerspectiveCamera,
  controls?: OrbitControls,
  { margin = 1.25, zoomOut = 2.0, yBias = -0.22 } = {}
) {
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const halfFovY = THREE.MathUtils.degToRad(camera.fov * 0.5);
  const fitH = (size.y * 0.5) / Math.tan(halfFovY);
  const fitW = (size.x * 0.5) / (Math.tan(halfFovY) * camera.aspect);
  const baseDist = margin * Math.max(fitH, fitW);
  const distance = baseDist * zoomOut;

  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  dir.normalize().multiplyScalar(-1);

  const target = center.clone();
  target.y += size.y * yBias;

  const eye = target.clone().add(dir.setLength(distance));
  camera.position.copy(eye);
  camera.near = Math.max(0.01, distance / 100);
  camera.far = distance * 100;
  camera.updateProjectionMatrix();
  camera.lookAt(target);

  if (controls) {
    controls.target.copy(target);
    controls.update();
  }
}

export default function ThreeViewer({
  record,
  isTalkMode,
  actionType = 'idle',
}: ThreeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const animationIdRef = useRef<number>();
  const modelRef = useRef<THREE.Object3D | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const animationsRef = useRef<Record<string, THREE.AnimationAction>>({});

  const [isLoading, setIsLoading] = useState(true);
  const [currentMessage, setCurrentMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  // 말풍선(기존 유지)
  useEffect(() => {
    if (!isTalkMode) { setShowMessage(false); return; }
    const messages: Record<number, string[]> = {
      1: ['으르렁! 안녕 친구야!', '나는 정글의 王!', '모험 떠나볼까?', '같이 놀자!'],
      2: ['파오~~ 안녕!', '긴 코 신기하지?', '물을 푱!', '기억력 짱!'],
      3: ['하이!', '목 길지?', '하늘이 가까워!', '나뭇잎 맛있어!'],
    };
    const arr = messages[record.id] || ['안녕!'];
    let i = 0, stop = false;
    const loop = () => {
      if (stop) return;
      setCurrentMessage(arr[i]);
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
        setTimeout(() => { i = (i + 1) % arr.length; loop(); }, 1000);
      }, 3000);
    };
    loop();
    return () => { stop = true; };
  }, [isTalkMode, record.id]);

  // 초기화 (효과 모두 OFF)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#fffcef'); // 배경만 유지
    sceneRef.current = scene;

    const w = container.clientWidth || 800;
    const h = container.clientHeight || 600;

    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.set(0, 2, 5);
    cameraRef.current = camera;
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    // 출력 색공간만 sRGB 고정 (표준)
    if ('outputColorSpace' in (renderer as any) && (THREE as any).SRGBColorSpace) {
      (renderer as any).outputColorSpace = (THREE as any).SRGBColorSpace;
    } else {
      (renderer as any).outputEncoding = (THREE as any).sRGBEncoding;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);

    // ✅ 톤매핑/노출 모두 끔 → 원본 머티리얼 그대로
    renderer.toneMapping = THREE.NoToneMapping;
    (renderer as any).toneMappingExposure = 3.0;

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.update();
    controlsRef.current = controls;

    // ✅ 조명/환경맵 모두 제거하면 완전 어둡기 때문에
    //    '색만 보이도록' 최소한의 평탄한 AmbientLight 1.0만 둠.
    //    (원본 재질 파라미터는 손대지 않음)
    // ✅ 최소 조명 세트 (HDR/환경맵 없음)
    // 1) 하늘/지면 색이 다른 은은한 주변광
    const hemi = new THREE.HemisphereLight(0xffffff, 0xdddddd, 10); 
    scene.add(hemi);

    // 2) 정면-상단 키라이트
    const sun = new THREE.DirectionalLight(0xffffff, 12);
    sun.position.set(2, 4, 6);
    sun.target.position.set(0, 0, 0);
    scene.add(sun);
    scene.add(sun.target);

    // 3) 보조 필라이트 (그림자면 밝히기)
    const fill = new THREE.DirectionalLight(0xffffff, 10);
    fill.position.set(-3, 2.5, -3);
    fill.target.position.set(0, 0, 0);
    scene.add(fill);
    scene.add(fill.target);

    // 4) 앰비언트(전체 레벨)
    const amb = new THREE.AmbientLight(0xffffff, 10);
    scene.add(amb);



    const onResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const W = containerRef.current.clientWidth;
      const H = containerRef.current.clientHeight || 1;
      cameraRef.current.aspect = W / H;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(W, H);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      if (mixerRef.current) mixerRef.current.update(clock.getDelta());
      controlsRef.current?.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      if (mixerRef.current) { try { mixerRef.current.stopAllAction(); } catch {} }
      mixerRef.current = null;

      renderer.dispose();
      if (container && renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
      scene.traverse((obj) => {
        if ((obj as any).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          const mat = mesh.material as THREE.Material | THREE.Material[];
          (Array.isArray(mat) ? mat : [mat]).forEach((m) => (m as any)?.dispose?.());
        }
      });
    };
  }, []);

  // GLB 로딩/교체 (머티리얼/텍스처 절대 손대지 않음)
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current) return;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const url = getModelUrl(record.id, actionType, isTalkMode);

    const loader = new GLTFLoader();
    let cancelled = false;

    const cleanup = () => {
      if (mixerRef.current) { try { mixerRef.current.stopAllAction(); } catch {} }
      mixerRef.current = null;
      if (modelRef.current) scene.remove(modelRef.current);
      modelRef.current = null;
      animationsRef.current = {};
    };

    setIsLoading(true);
    loader.load(
      url,
      (gltf) => {
        if (cancelled) return;
        cleanup();

        const model = gltf.scene;
        scene.add(model);
        modelRef.current = model;

        // 바닥 정렬/스케일만 유지 (보기 편하게)
        const box0 = new THREE.Box3().setFromObject(model);
        const min0 = box0.min.clone();
        const ctr0 = box0.getCenter(new THREE.Vector3());
        model.position.set(-ctr0.x, -min0.y, -ctr0.z);

        const size0 = box0.getSize(new THREE.Vector3());
        const maxDim = Math.max(size0.x, size0.y, size0.z);
        if (maxDim > 10) model.scale.setScalar(10 / maxDim);

        // 애니메이션(있을 때만 첫 클립 재생)
        if (gltf.animations?.length) {
          mixerRef.current = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip, i) => {
            const act = mixerRef.current!.clipAction(clip);
            animationsRef.current[clip.name || `anim${i}`] = act;
          });
          Object.values(animationsRef.current)[0]?.reset().play();
        }

        // 카메라 프레이밍
        const box = new THREE.Box3().setFromObject(model);
        frameToBox(box, camera, controlsRef.current || undefined);

        setIsLoading(false);
      },
      undefined,
      (err) => {
        if (!cancelled) {
          console.error('❌ GLB 로드 실패:', err);
          setIsLoading(false);
        }
      }
    );

    return () => { cancelled = true; };
  }, [record.id, actionType, isTalkMode]);

  return (
    <div className="w-full h-[calc(100vh-140px)] min-h-[480px] relative">
      <div ref={containerRef} className="w-full h-full relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">3D 모델 로딩 중...</p>
            </div>
          </div>
        )}
      </div>

      {isTalkMode && showMessage && currentMessage && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2">
          <div className="relative bg-white rounded-2xl px-6 py-4 shadow-lg border-2 border-orange-200 max-w-xs">
            <p className="text-gray-800 text-center font-medium">{currentMessage}</p>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
              <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent border-t-white"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
