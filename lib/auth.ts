import { User } from '../types/user';

// TODO: Replace with actual Firebase auth
let currentUser: User | null = null;

export const login = async (email: string, password: string): Promise<User> => {
  // TODO: Implement Firebase authentication
  currentUser = {
    id: '1',
    name: 'Test User',
    email,
    handicap: 10,
    joinedAt: new Date().toISOString(),
  };
  return currentUser;
};

export const signup = async (email: string, password: string, name: string): Promise<User> => {
  // TODO: Implement Firebase signup
  currentUser = {
    id: '1',
    name,
    email,
    handicap: 0,
    joinedAt: new Date().toISOString(),
  };
  return currentUser;
};

export const logout = async (): Promise<void> => {
  // TODO: Implement Firebase logout
  currentUser = null;
};

export const getCurrentUser = async (): Promise<User | null> => {
  // TODO: Implement Firebase current user check
  return currentUser;
};

export const updateProfile = async (updates: Partial<User>): Promise<User> => {
  // TODO: Implement Firebase profile update
  if (!currentUser) throw new Error('No user logged in');
  currentUser = { ...currentUser, ...updates };
  return currentUser;
}; 