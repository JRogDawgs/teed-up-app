import AsyncStorage from '@react-native-async-storage/async-storage';
import { Game } from '../types/game';

const GAME_HISTORY_KEY = '@teed_up_game_history';

export interface GameHistoryEntry extends Game {
  savedAt: string;
}

export const saveGameToHistory = async (game: Game): Promise<void> => {
  try {
    const history = await getGameHistory();
    const newEntry: GameHistoryEntry = {
      ...game,
      savedAt: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(
      GAME_HISTORY_KEY,
      JSON.stringify([newEntry, ...history])
    );
  } catch (error) {
    console.error('Error saving game to history:', error);
    throw error;
  }
};

export const getGameHistory = async (): Promise<GameHistoryEntry[]> => {
  try {
    const history = await AsyncStorage.getItem(GAME_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting game history:', error);
    return [];
  }
};

export const clearGameHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(GAME_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing game history:', error);
    throw error;
  }
}; 