import { OrderStatus, sendOrderStatusNotification } from './notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Order {
  id: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
  playerName: string;
  hole: number;
  orderType: 'pickup' | 'grabngo';
  status: OrderStatus;
  timestamp: number;
  prepStartTime?: number; // When order status changed to 'preparing'
}

// Printer settings interface
export interface PrinterSettings {
  simulatedDelays: boolean;
  notificationsEnabled: boolean;
  statusDelays: {
    preparing: number;
    ready: number;
    enRoute: number;
  };
}

// Default printer settings
const DEFAULT_SETTINGS: PrinterSettings = {
  simulatedDelays: true,
  notificationsEnabled: true,
  statusDelays: {
    preparing: 30000, // 30 seconds
    ready: 120000, // 2 minutes
    enRoute: 30000, // 30 seconds
  },
};

// Simulated printer delay times (in milliseconds)
const STATUS_DELAYS = {
  received: 0,
  preparing: 30000, // 30 seconds
  ready: 120000, // 2 minutes
  enRoute: 30000, // 30 seconds
  delivered: 0,
};

// Store active orders
let activeOrders: Order[] = [];
let printerSettings: PrinterSettings = DEFAULT_SETTINGS;
let isConnected = true;

// Load printer settings from AsyncStorage
export async function loadPrinterSettings(): Promise<void> {
  try {
    const settings = await AsyncStorage.getItem('printerSettings');
    if (settings) {
      printerSettings = JSON.parse(settings);
    }
  } catch (error) {
    console.error('Error loading printer settings:', error);
  }
}

// Save printer settings to AsyncStorage
export async function savePrinterSettings(settings: PrinterSettings): Promise<void> {
  try {
    await AsyncStorage.setItem('printerSettings', JSON.stringify(settings));
    printerSettings = settings;
  } catch (error) {
    console.error('Error saving printer settings:', error);
  }
}

// Get current printer settings
export function getPrinterSettings(): PrinterSettings {
  return printerSettings;
}

export function createOrder(
  items: Order['items'],
  playerName: string,
  hole: number,
  orderType: 'pickup' | 'grabngo' = 'pickup'
): Order {
  const order: Order = {
    id: `ORD-${Date.now()}`,
    items,
    playerName,
    hole,
    orderType,
    status: 'received',
    timestamp: Date.now(),
  };

  activeOrders.push(order);
  return order;
}

export async function sendOrderToBar(order: Order): Promise<boolean> {
  try {
    // Simulate sending to printer
    console.log('Sending order to printer:', order);

    // Start order status progression
    simulateOrderProgress(order);

    return true;
  } catch (error) {
    console.error('Error sending order to printer:', error);
    return false;
  }
}

async function simulateOrderProgress(order: Order) {
  // Send initial "received" notification
  if (printerSettings.notificationsEnabled) {
    await sendOrderStatusNotification({
      orderId: order.id,
      status: 'received',
      orderType: order.orderType,
      items: order.items,
    });
  }

  // Progress through statuses with delays
  const statuses: OrderStatus[] = ['preparing', 'ready', 'enRoute', 'delivered'];
  
  for (const status of statuses) {
    if (printerSettings.simulatedDelays) {
      await new Promise(resolve => setTimeout(resolve, printerSettings.statusDelays[status] || STATUS_DELAYS[status]));
    }
    
    // Update order status
    const orderIndex = activeOrders.findIndex(o => o.id === order.id);
    if (orderIndex !== -1) {
      activeOrders[orderIndex].status = status;
      // Set prep start time when status changes to preparing
      if (status === 'preparing') {
        activeOrders[orderIndex].prepStartTime = Date.now();
      }
    }

    // Send notification if enabled
    if (printerSettings.notificationsEnabled) {
      await sendOrderStatusNotification({
        orderId: order.id,
        status,
        orderType: order.orderType,
        items: order.items,
      });
    }

    // If order is delivered, remove it from active orders
    if (status === 'delivered') {
      activeOrders = activeOrders.filter(o => o.id !== order.id);
    }
  }
}

export function getActiveOrders(): Order[] {
  return activeOrders;
}

export function getOrderById(orderId: string): Order | undefined {
  return activeOrders.find(order => order.id === orderId);
}

export function updateOrderStatus(orderId: string, status: OrderStatus): boolean {
  const orderIndex = activeOrders.findIndex(order => order.id === orderId);
  if (orderIndex === -1) return false;

  activeOrders[orderIndex].status = status;
  // Set prep start time when status changes to preparing
  if (status === 'preparing') {
    activeOrders[orderIndex].prepStartTime = Date.now();
  }
  return true;
}

// Kitchen Display System (KDS) functions
export function getOrdersByStatus(status: OrderStatus): Order[] {
  return activeOrders.filter(order => order.status === status);
}

export function getOrdersByHole(hole: number): Order[] {
  return activeOrders.filter(order => order.hole === hole);
}

export function getOrdersByType(orderType: 'pickup' | 'grabngo'): Order[] {
  return activeOrders.filter(order => order.orderType === orderType);
}

// Sort orders by different criteria
export function sortOrders(orders: Order[], sortBy: 'time' | 'hole' | 'type'): Order[] {
  return [...orders].sort((a, b) => {
    switch (sortBy) {
      case 'time':
        return b.timestamp - a.timestamp;
      case 'hole':
        return a.hole - b.hole;
      case 'type':
        return a.orderType.localeCompare(b.orderType);
      default:
        return 0;
    }
  });
}

// Mock printer connection status
export function isPrinterConnected(): boolean {
  return isConnected;
}

// Mock printer status toggle (for testing)
export function togglePrinterConnection(): void {
  isConnected = !isConnected;
}

// Get preparation time in minutes
export function getPreparationTime(order: Order): number | null {
  if (order.status !== 'preparing' || !order.prepStartTime) {
    return null;
  }
  return Math.floor((Date.now() - order.prepStartTime) / 60000);
}

// Get preparation time color based on duration
export function getPreparationTimeColor(minutes: number): string {
  if (minutes < 10) return '#32CD32'; // Green
  if (minutes < 15) return '#FFD700'; // Yellow
  return '#FF4500'; // Red
} 