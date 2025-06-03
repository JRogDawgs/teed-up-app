import { Game, Player, HoleScore } from '../types/game';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PlayerStats {
  roundsPlayed: number;
  averageScore: number;
  bestScore: number;
  averagePutts: number;
  fairwaysHit: number;
  greensInRegulation: number;
  handicap: number;
}

interface GameStats {
  date: string;
  course: string;
  score: number;
  putts: number;
  fairwaysHit: number;
  greensInRegulation: number;
}

interface HoleStats {
  mostCommonScore: number;
  averageScore: number;
  birdiePercentage: number;
  parPercentage: number;
  bogeyPercentage: number;
  worsePercentage: number;
}

interface ScoringTrends {
  averageScore: number;
  averageOverPar: number;
  bestHoles: number[];
  worstHoles: number[];
  mostImprovedHoles: number[];
  mostDeclinedHoles: number[];
}

const STATS_KEY = '@tee_up_stats';

export const calculatePlayerStats = (games: Game[], playerId: string): PlayerStats => {
  const playerGames = games.filter(game => 
    game.players.some(p => p.id === playerId)
  );

  const stats: PlayerStats = {
    roundsPlayed: playerGames.length,
    averageScore: 0,
    bestScore: 0,
    averagePutts: 0,
    fairwaysHit: 0,
    greensInRegulation: 0,
    handicap: 0,
  };

  if (playerGames.length === 0) return stats;

  let totalScore = 0;
  let totalPutts = 0;
  let totalFairways = 0;
  let totalGreens = 0;
  let scores: number[] = [];

  playerGames.forEach(game => {
    const playerScore = game.scores.find(s => s.playerId === playerId);
    if (!playerScore) return;

    const roundScore = playerScore.holes.reduce((sum, hole) => sum + (hole.score || 0), 0);
    const roundPutts = playerScore.holes.reduce((sum, hole) => sum + (hole.putts || 0), 0);
    const roundFairways = playerScore.holes.filter(hole => hole.fairwayHit).length;
    const roundGreens = playerScore.holes.filter(hole => hole.greenInRegulation).length;

    totalScore += roundScore;
    totalPutts += roundPutts;
    totalFairways += roundFairways;
    totalGreens += roundGreens;
    scores.push(roundScore);
  });

  stats.averageScore = totalScore / playerGames.length;
  stats.bestScore = Math.min(...scores);
  stats.averagePutts = totalPutts / (playerGames.length * 18);
  stats.fairwaysHit = totalFairways / (playerGames.length * 18);
  stats.greensInRegulation = totalGreens / (playerGames.length * 18);

  // TODO: Implement proper handicap calculation
  stats.handicap = Math.round(stats.averageScore - 72);

  return stats;
};

export const saveGameStats = async (game: Game): Promise<void> => {
  try {
    const existingStats = await AsyncStorage.getItem(STATS_KEY);
    const stats: Record<string, GameStats[]> = existingStats ? JSON.parse(existingStats) : {};

    game.players.forEach(player => {
      const playerScore = game.scores.find(s => s.playerId === player.id);
      if (!playerScore) return;

      const gameStats: GameStats = {
        date: game.date,
        course: game.course.name,
        score: playerScore.holes.reduce((sum, hole) => sum + (hole.score || 0), 0),
        putts: playerScore.holes.reduce((sum, hole) => sum + (hole.putts || 0), 0),
        fairwaysHit: playerScore.holes.filter(hole => hole.fairwayHit).length,
        greensInRegulation: playerScore.holes.filter(hole => hole.greenInRegulation).length,
      };

      if (!stats[player.id]) {
        stats[player.id] = [];
      }
      stats[player.id].push(gameStats);
    });

    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving game stats:', error);
  }
};

export const getPlayerGameHistory = async (playerId: string): Promise<GameStats[]> => {
  try {
    const existingStats = await AsyncStorage.getItem(STATS_KEY);
    if (!existingStats) return [];

    const stats: Record<string, GameStats[]> = JSON.parse(existingStats);
    return stats[playerId] || [];
  } catch (error) {
    console.error('Error getting player game history:', error);
    return [];
  }
};

export const clearPlayerStats = async (playerId: string): Promise<void> => {
  try {
    const existingStats = await AsyncStorage.getItem(STATS_KEY);
    if (!existingStats) return;

    const stats: Record<string, GameStats[]> = JSON.parse(existingStats);
    delete stats[playerId];
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error clearing player stats:', error);
  }
};

export const calculateHoleStats = (games: Game[], playerId: string): HoleStats[] => {
  const holeStats: HoleStats[] = Array(18).fill(null).map(() => ({
    mostCommonScore: 0,
    averageScore: 0,
    birdiePercentage: 0,
    parPercentage: 0,
    bogeyPercentage: 0,
    worsePercentage: 0,
  }));

  const playerGames = games.filter(game => 
    game.players.some(p => p.id === playerId)
  );

  if (playerGames.length === 0) return holeStats;

  // Calculate stats for each hole
  for (let hole = 0; hole < 18; hole++) {
    const scores: number[] = [];
    let birdies = 0;
    let pars = 0;
    let bogeys = 0;
    let worse = 0;

    playerGames.forEach(game => {
      const playerScore = game.scores.find(s => s.playerId === playerId);
      if (!playerScore || !playerScore.holes[hole]?.score) return;

      const score = playerScore.holes[hole].score;
      scores.push(score);

      const par = game.course.holes[hole].par;
      if (score === par - 1) birdies++;
      else if (score === par) pars++;
      else if (score === par + 1) bogeys++;
      else if (score > par + 1) worse++;
    });

    if (scores.length > 0) {
      // Calculate most common score
      const scoreCounts = scores.reduce((acc, score) => {
        acc[score] = (acc[score] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      
      holeStats[hole].mostCommonScore = parseInt(
        Object.entries(scoreCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0]
      );

      // Calculate averages and percentages
      holeStats[hole].averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      holeStats[hole].birdiePercentage = (birdies / scores.length) * 100;
      holeStats[hole].parPercentage = (pars / scores.length) * 100;
      holeStats[hole].bogeyPercentage = (bogeys / scores.length) * 100;
      holeStats[hole].worsePercentage = (worse / scores.length) * 100;
    }
  }

  return holeStats;
};

export const calculateScoringTrends = (games: Game[], playerId: string): ScoringTrends => {
  const trends: ScoringTrends = {
    averageScore: 0,
    averageOverPar: 0,
    bestHoles: [],
    worstHoles: [],
    mostImprovedHoles: [],
    mostDeclinedHoles: [],
  };

  const playerGames = games.filter(game => 
    game.players.some(p => p.id === playerId)
  );

  if (playerGames.length === 0) return trends;

  // Calculate average score and over par
  let totalScore = 0;
  let totalOverPar = 0;
  const holeScores: number[][] = Array(18).fill(null).map(() => []);

  playerGames.forEach(game => {
    const playerScore = game.scores.find(s => s.playerId === playerId);
    if (!playerScore) return;

    let roundScore = 0;
    let roundOverPar = 0;

    playerScore.holes.forEach((hole, index) => {
      if (!hole.score) return;
      
      const par = game.course.holes[index].par;
      roundScore += hole.score;
      roundOverPar += hole.score - par;
      holeScores[index].push(hole.score - par);
    });

    totalScore += roundScore;
    totalOverPar += roundOverPar;
  });

  trends.averageScore = totalScore / playerGames.length;
  trends.averageOverPar = totalOverPar / playerGames.length;

  // Calculate best and worst holes
  const holeAverages = holeScores.map(scores => 
    scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
  );

  // Find best and worst holes
  const sortedHoles = holeAverages
    .map((score, index) => ({ score, index }))
    .sort((a, b) => a.score - b.score);

  trends.bestHoles = sortedHoles.slice(0, 3).map(h => h.index + 1);
  trends.worstHoles = sortedHoles.slice(-3).reverse().map(h => h.index + 1);

  // Calculate most improved and declined holes
  if (playerGames.length >= 2) {
    const recentGames = playerGames.slice(-5);
    const olderGames = playerGames.slice(0, -5);

    const recentAverages = calculateHoleAverages(recentGames, playerId);
    const olderAverages = calculateHoleAverages(olderGames, playerId);

    const improvements = recentAverages.map((recent, index) => ({
      improvement: olderAverages[index] - recent,
      index,
    }));

    improvements.sort((a, b) => b.improvement - a.improvement);
    trends.mostImprovedHoles = improvements.slice(0, 3).map(h => h.index + 1);
    trends.mostDeclinedHoles = improvements.slice(-3).reverse().map(h => h.index + 1);
  }

  return trends;
};

const calculateHoleAverages = (games: Game[], playerId: string): number[] => {
  const holeScores: number[][] = Array(18).fill(null).map(() => []);

  games.forEach(game => {
    const playerScore = game.scores.find(s => s.playerId === playerId);
    if (!playerScore) return;

    playerScore.holes.forEach((hole, index) => {
      if (!hole.score) return;
      const par = game.course.holes[index].par;
      holeScores[index].push(hole.score - par);
    });
  });

  return holeScores.map(scores => 
    scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
  );
}; 