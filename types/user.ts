export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  handicap: number;
  bio?: string;
  favoriteCourse?: string;
  joinedAt: string;
  memberStatus: 'active' | 'suspended';
  preferredTeeTime?: string;
  usualGroup?: string[];
  paymentHandles?: {
    venmo?: string;
    cashApp?: string;
    paypal?: string;
  };
}

export interface UserStats {
  roundsPlayed: number;
  averageScore: number;
  bestScore: number;
  birdies: number;
  eagles: number;
  // TODO: Add more detailed statistics
  // TODO: Add handicap history
  // TODO: Add course-specific stats
}

export interface UserSettings {
  darkMode: boolean;
  soundEnabled: boolean;
  notifications: boolean;
  // TODO: Add more user preferences
  // TODO: Add privacy settings
  // TODO: Add notification preferences
} 