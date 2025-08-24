// src/app/viewer/assets.ts

// 1) 액션 타입에 'dance' 추가
export type Action = 'idle' | 'walk' | 'run' | 'dance';

// 2) 액션 맵은 run/dance를 선택적(optional) 키로 정의
type ActionMap = {
  idle: string;
  walk: string;
  run?: string;    // 동물에 따라 없을 수 있음
  dance?: string;  // 트위티만 사용
};

export const ASSETS: Record<number, {
  action: ActionMap;
  talk: string;
}> = {
  // 1번: 사자
  1: {
    action: {
      idle: '/models/simba/idle.glb',
      walk: '/models/simba/walk.glb',
      run : '/models/simba/run.glb',
    },
    talk: '/models/simba/talk.glb',
  },
  // 2번: 트위티  (run 대신 dance 사용)
  2: {
    action: {
      idle: '/models/twitty/idle.glb',
      walk: '/models/twitty/walk.glb',
      run: '/models/twitty/dance.glb',   // ✅ OK
      // run 없음
    },
    talk: '/models/twitty/talk.glb',
  },
  // 3번: 고양이
  3: {
    action: {
      idle: '/models/cat/idle.glb',
      walk: '/models/cat/walk.glb',
      run : '/models/cat/run.glb',
    },
    talk: '/models/cat/talk.glb',
  },
};
