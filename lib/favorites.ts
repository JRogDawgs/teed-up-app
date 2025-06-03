import AsyncStorage from '@react-native-async-storage/async-storage';
import { MenuItem } from '../types/menu';
import { Course } from '../types/game';

const FAVORITES_KEY = '@teed_up_favorites';

interface Favorites {
  food: MenuItem[];
  courses: Course[];
}

export async function getFavorites(): Promise<Favorites> {
  try {
    const jsonValue = await AsyncStorage.getItem(FAVORITES_KEY);
    return jsonValue ? JSON.parse(jsonValue) : { food: [], courses: [] };
  } catch (error) {
    console.error('Error getting favorites:', error);
    return { food: [], courses: [] };
  }
}

export async function toggleFoodFavorite(item: MenuItem): Promise<boolean> {
  try {
    const favorites = await getFavorites();
    const isFavorite = favorites.food.some(f => f.id === item.id);

    if (isFavorite) {
      favorites.food = favorites.food.filter(f => f.id !== item.id);
    } else {
      favorites.food.push(item);
    }

    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return !isFavorite;
  } catch (error) {
    console.error('Error toggling food favorite:', error);
    return false;
  }
}

export async function toggleCourseFavorite(course: Course): Promise<boolean> {
  try {
    const favorites = await getFavorites();
    const isFavorite = favorites.courses.some(c => c.id === course.id);

    if (isFavorite) {
      favorites.courses = favorites.courses.filter(c => c.id !== course.id);
    } else {
      favorites.courses.push(course);
    }

    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return !isFavorite;
  } catch (error) {
    console.error('Error toggling course favorite:', error);
    return false;
  }
}

export async function isFoodFavorite(itemId: string): Promise<boolean> {
  try {
    const favorites = await getFavorites();
    return favorites.food.some(item => item.id === itemId);
  } catch (error) {
    console.error('Error checking food favorite:', error);
    return false;
  }
}

export async function isCourseFavorite(courseId: string): Promise<boolean> {
  try {
    const favorites = await getFavorites();
    return favorites.courses.some(course => course.id === courseId);
  } catch (error) {
    console.error('Error checking course favorite:', error);
    return false;
  }
}

export async function clearFavorites(): Promise<void> {
  try {
    await AsyncStorage.removeItem(FAVORITES_KEY);
  } catch (error) {
    console.error('Error clearing favorites:', error);
  }
} 