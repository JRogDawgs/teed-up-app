export interface LeaderboardPlayer {
  id: string;
  name: string;
  totalScore: number;
  thruHole: number;
  lastThreeHoles: ('birdie' | 'par' | 'bogey' | 'double' | 'eagle')[];
  position: number;
  isCurrentUser: boolean;
}

export interface LeaderboardData {
  tournamentName: string;
  round: number;
  players: LeaderboardPlayer[];
  lastUpdated: string;
}

// Mock data for development
export async function getLeaderboardData(): Promise<LeaderboardData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    tournamentName: 'Wildwood Club Championship',
    round: 1,
    lastUpdated: new Date().toISOString(),
    players: [
      {
        id: '1',
        name: 'Tiger Woods',
        totalScore: -5,
        thruHole: 18,
        lastThreeHoles: ['birdie', 'par', 'birdie'],
        position: 1,
        isCurrentUser: false,
      },
      {
        id: '2',
        name: 'Rory McIlroy',
        totalScore: -3,
        thruHole: 18,
        lastThreeHoles: ['par', 'birdie', 'par'],
        position: 2,
        isCurrentUser: false,
      },
      {
        id: '3',
        name: 'Jon Rahm',
        totalScore: -2,
        thruHole: 17,
        lastThreeHoles: ['bogey', 'par', 'birdie'],
        position: 3,
        isCurrentUser: false,
      },
      {
        id: '4',
        name: 'Scottie Scheffler',
        totalScore: -1,
        thruHole: 16,
        lastThreeHoles: ['par', 'par', 'birdie'],
        position: 4,
        isCurrentUser: false,
      },
      {
        id: '5',
        name: 'John Smith',
        totalScore: 0,
        thruHole: 15,
        lastThreeHoles: ['bogey', 'par', 'par'],
        position: 5,
        isCurrentUser: true,
      },
      {
        id: '6',
        name: 'Brooks Koepka',
        totalScore: 1,
        thruHole: 18,
        lastThreeHoles: ['par', 'bogey', 'par'],
        position: 6,
        isCurrentUser: false,
      },
      {
        id: '7',
        name: 'Collin Morikawa',
        totalScore: 2,
        thruHole: 17,
        lastThreeHoles: ['bogey', 'par', 'bogey'],
        position: 7,
        isCurrentUser: false,
      },
      {
        id: '8',
        name: 'Justin Thomas',
        totalScore: 3,
        thruHole: 16,
        lastThreeHoles: ['par', 'bogey', 'bogey'],
        position: 8,
        isCurrentUser: false,
      },
    ],
  };
} 