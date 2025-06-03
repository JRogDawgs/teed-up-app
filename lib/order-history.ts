import AsyncStorage from '@react-native-async-storage/async-storage';
import { MenuItem } from './menu';

const ORDER_HISTORY_KEY = '@tee_up_order_history';

export interface OrderHistoryItem {
  id: string;
  timestamp: number;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  totalPrice: number;
  orderType: 'pickup' | 'grabngo';
  status: 'completed' | 'cancelled';
}

export const saveOrder = async (order: Omit<OrderHistoryItem, 'id' | 'timestamp'>): Promise<OrderHistoryItem> => {
  try {
    const history = await getOrderHistory();
    const newOrder: OrderHistoryItem = {
      ...order,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    
    const updatedHistory = [newOrder, ...history];
    await AsyncStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(updatedHistory));
    return newOrder;
  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  }
};

export const getOrderHistory = async (): Promise<OrderHistoryItem[]> => {
  try {
    const history = await AsyncStorage.getItem(ORDER_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting order history:', error);
    return [];
  }
};

export const clearOrderHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ORDER_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing order history:', error);
    throw error;
  }
};

export const getOrderById = async (orderId: string): Promise<OrderHistoryItem | null> => {
  const history = await getOrderHistory();
  return history.find(order => order.id === orderId) || null;
}; 