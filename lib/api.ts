import { User } from '../types/user';
import { Game } from '../types/game';

export async function fetchUser(id: string): Promise<User> {
  throw new Error('Not implemented');
}

export async function fetchGame(id: string): Promise<Game> {
  throw new Error('Not implemented');
}

export async function createGame(game: Omit<Game, 'id'>): Promise<Game> {
  throw new Error('Not implemented');
} 