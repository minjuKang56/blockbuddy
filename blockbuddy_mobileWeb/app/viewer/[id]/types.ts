// types.ts
export type ActionType = 'idle' | 'walk' | 'run' | 'dance';

export interface RecordData {
  id: number;
  title: string;
  description: string;
  date: string;
  thumbnail: string;
}
