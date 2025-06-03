export type GameFormat = 'Stroke Play' | 'Skins' | 'Wolf' | 'Match Play' | 'Stableford';
export type TeeBox = 'Black' | 'Blue' | 'White' | 'Gold' | 'Red';
export type ScoreType = 'Birdie' | 'Eagle' | 'Par' | 'Bogey' | 'Double Bogey' | 'Triple Bogey' | 'Other';

export interface HoleScore {
  score: number;
  scoreType: ScoreType;
  putts: number;
  fairwayHit: boolean;
  greenInRegulation: boolean;
}

export interface PlayerScore {
  scores: HoleScore[];
  frontNine: number;
  backNine: number;
  totalScore: number;
}

export interface Player {
  id: string;
  name: string;
  handicap: number;
  avatarUrl?: string;
}

export interface Hole {
  number: number;
  par: number;
  handicap: number;
}

export interface Course {
  id: string;
  name: string;
  location: string;
  holes: Hole[];
}

export interface Game {
  id: string;
  course: Course;
  players: Player[];
  scores: Record<string, PlayerScore>;
  date: string;
  format: 'Stroke Play' | 'Match Play' | 'Skins' | 'Wolf';
  teeBox: string;
  isMoneyGame: boolean;
}

// TODO: Add game settings types for different game formats
// TODO: Add money game tracking types
// TODO: Add tournament-specific types 