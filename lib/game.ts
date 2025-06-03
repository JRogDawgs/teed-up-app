import { Game, Player, Course, HoleScore } from '../types/game';
import { RegisteredUser } from './user';

// TODO: Replace with Firebase database
let currentGame: Game | null = null;
let gameHistory: Game[] = [];

export interface GuestPlayer {
  id: string;
  name: string;
  email: string;
  paid: boolean;
}

export type Player = RegisteredUser | GuestPlayer;

export interface Game {
  id: string;
  hostId: string;
  players: Player[];
  courseId: string;
  startTime: number;
  endTime?: number;
  status: 'pending' | 'active' | 'completed';
  currentHole: number;
  currentPlayerIndex: number;
  roundData: {
    [playerId: string]: {
      scores: number[];
      putts: number[];
      fairways: ('hit' | 'left' | 'right')[];
      greens: boolean[];
      penalties: number[];
    };
  };
  isHostSubscriber: boolean;
  hasGuests: boolean;
  hasRegisteredPlayers: boolean;
}

export interface GameSummary {
  gameId: string;
  courseId: string;
  startTime: number;
  endTime: number;
  players: {
    id: string;
    name: string;
    email: string;
    isGuest: boolean;
    scores: number[];
    totalScore: number;
    stats: {
      putts: number;
      fairways: number;
      greens: number;
      penalties: number;
    };
  }[];
  courseStats: {
    averageScore: number;
    bestScore: number;
    worstScore: number;
    mostFairways: number;
    mostGreens: number;
    leastPutts: number;
  };
}

export const createGame = async (
  hostId: string,
  courseId: string,
  players: Player[]
): Game => {
  const game: Game = {
    id: `GAME-${Date.now()}`,
    hostId,
    players,
    courseId,
    startTime: Date.now(),
    status: 'pending',
    currentHole: 1,
    currentPlayerIndex: 0,
    roundData: {},
    isHostSubscriber: false,
    hasGuests: false,
    hasRegisteredPlayers: false,
  };

  // Initialize round data for each player
  players.forEach((player) => {
    game.roundData[player.id] = {
      scores: [],
      putts: [],
      fairways: [],
      greens: [],
      penalties: [],
    };
  });

  currentGame = game;
  return game;
};

export const updateScore = async (
  gameId: string,
  playerId: string,
  holeNumber: number,
  score: HoleScore
): Promise<Game> => {
  if (!currentGame || currentGame.id !== gameId) {
    throw new Error('Game not found');
  }

  const playerScore = currentGame.scores.find(s => s.playerId === playerId);
  if (!playerScore) {
    throw new Error('Player not found in game');
  }

  playerScore.holes[holeNumber - 1] = score;
  return currentGame;
};

export const endGame = async (gameId: string): Promise<Game> => {
  if (!currentGame || currentGame.id !== gameId) {
    throw new Error('Game not found');
  }

  gameHistory.push(currentGame);
  const endedGame = currentGame;
  currentGame = null;
  return endedGame;
};

export const getCurrentGame = async (): Promise<Game | null> => {
  return currentGame;
};

export const getGameHistory = async (): Promise<Game[]> => {
  return gameHistory;
};

export const getPlayerStats = async (playerId: string): Promise<{
  roundsPlayed: number;
  averageScore: number;
  bestScore: number;
}> => {
  const playerGames = gameHistory.filter(game => 
    game.players.some(p => p.id === playerId)
  );

  const scores = playerGames.map(game => {
    const playerScore = game.scores.find(s => s.playerId === playerId);
    if (!playerScore) return 0;
    return playerScore.holes.reduce((sum, hole) => sum + (hole.score || 0), 0);
  });

  return {
    roundsPlayed: playerGames.length,
    averageScore: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
    bestScore: scores.length ? Math.min(...scores) : 0,
  };
};

export function isGuestPlayer(player: Player): player is GuestPlayer {
  return 'paid' in player;
}

export function getPlayerEmail(player: Player): string {
  if (isGuestPlayer(player)) {
    return player.email;
  }
  return player.email;
}

export function getPlayerName(player: Player): string {
  if (isGuestPlayer(player)) {
    return player.name;
  }
  return `${player.firstName} ${player.lastName}`;
}

// Helper functions for game composition
export function hasGuestPlayers(game: Game): boolean {
  return game.players.some(isGuestPlayer);
}

export function hasRegisteredPlayers(game: Game): boolean {
  return game.players.some(p => !isGuestPlayer(p));
}

export function getGuestPlayerCount(game: Game): number {
  return game.players.filter(isGuestPlayer).length;
}

export function getRegisteredPlayerCount(game: Game): number {
  return game.players.filter(p => !isGuestPlayer(p)).length;
} 