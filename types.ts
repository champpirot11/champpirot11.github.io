

export enum Scene {
  WELCOME = 'WELCOME',
  LOGIN = 'LOGIN',
  INTRO = 'INTRO',
  QUIZ = 'QUIZ',
  MEMORY_GAME = 'MEMORY_GAME',
  SHOOTER_GAME = 'SHOOTER_GAME',
  LEVEL_UP = 'LEVEL_UP',
  GACHA = 'GACHA',
  KEEP_MEMORIES = 'KEEP_MEMORIES',
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface GachaItem {
  text: string;
  rarity: 'COMMON' | 'RARE' | 'LEGENDARY' | 'SPECIAL';
  icon?: string;
}

export type MemoryCard = {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
};