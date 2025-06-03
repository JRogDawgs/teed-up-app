import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { GuestPlayer } from './game';
import { GameSummary } from './game';

// TODO: Replace with Firebase Cloud Messaging
const NOTIFICATION_CHANNEL_ID = 'tee-up-notifications';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export type OrderStatus = 'received' | 'preparing' | 'ready' | 'enRoute' | 'delivered';

interface OrderNotification {
  orderId: string;
  status: OrderStatus;
  orderType: 'pickup' | 'grabngo';
  items: Array<{ name: string; quantity: number }>;
}

const STATUS_EMOJIS = {
  received: '📝',
  preparing: '👨‍🍳',
  ready: '✅',
  enRoute: '🚗',
  delivered: '🎯',
};

const STATUS_MESSAGES = {
  received: 'Your order has been received!',
  preparing: 'Your order is being prepared',
  ready: 'Your order is ready!',
  enRoute: 'Your order is on its way',
  delivered: 'Enjoy your order!',
};

export const setupNotifications = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
      name: 'Tee\'d Up Notifications',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
};

export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return false;
  }
  
  return true;
};

export const sendHoleNotification = async (holeNumber: number) => {
  if (holeNumber === 7) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time to Order! 🍔",
        body: "Place your food and drink order before the turn",
        data: { type: 'order_reminder' },
      },
      trigger: null, // Show immediately
    });
  }
};

export const sendGameInvite = async (gameId: string, inviterName: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Game Invitation 🏌️‍♂️",
      body: `${inviterName} invited you to play a round`,
      data: { type: 'game_invite', gameId },
    },
    trigger: null,
  });
};

export const sendScoreUpdate = async (playerName: string, holeNumber: number, score: number) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Score Update 📊",
      body: `${playerName} scored ${score} on hole ${holeNumber}`,
      data: { type: 'score_update' },
    },
    trigger: null,
  });
};

export const sendTurnReminder = async (minutes: number = 15) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Turn Coming Up! ⏰",
      body: `The turn is in ${minutes} minutes`,
      data: { type: 'turn_reminder' },
    },
    trigger: { seconds: minutes * 60 },
  });
};

export async function sendOrderStatusNotification({
  orderId,
  status,
  orderType,
  items,
}: OrderNotification) {
  const emoji = STATUS_EMOJIS[status];
  const message = STATUS_MESSAGES[status];
  const itemSummary = items
    .map(item => `${item.quantity}x ${item.name}`)
    .join(', ');

  let body = `${emoji} ${message}\n\n${itemSummary}`;

  // Add pickup instructions based on order type
  if (status === 'ready') {
    if (orderType === 'pickup') {
      body += '\n\nSwing by the bar and grab your order — your drinks are waiting!';
    } else {
      body += '\n\nWe\'ll bring it to you between holes 9 & 10!';
    }
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Order Update',
      body,
      data: { orderId, status, orderType },
    },
    trigger: null, // Show immediately
  });
}

export async function sendPromotionalNotification(title: string, message: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body: message,
    },
    trigger: null,
  });
}

export async function sendTournamentNotification(title: string, message: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body: message,
    },
    trigger: null,
  });
}

// Helper function to format notification messages
export function formatNotificationMessage(type: string, data: any): string {
  switch (type) {
    case 'order_status':
      return `${STATUS_EMOJIS[data.status]} ${STATUS_MESSAGES[data.status]}`;
    case 'promo':
      return `🎉 ${data.message}`;
    case 'tournament':
      return `🏆 ${data.message}`;
    default:
      return data.message;
  }
}

export async function sendGuestRecapEmail(guest: GuestPlayer, gameSummary: GameSummary): Promise<void> {
  try {
    // TODO: Replace with actual email service integration
    console.log('Sending guest recap email:', {
      to: guest.email,
      subject: 'Your Teed Up Golf Round Summary',
      gameId: gameSummary.gameId,
      playerName: guest.name,
    });

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.error('Error sending guest recap email:', error);
    throw error;
  }
}

export async function sendGuestInviteEmail(email: string, inviterName: string): Promise<void> {
  try {
    // TODO: Replace with actual email service integration
    console.log('Sending guest invite email:', {
      to: email,
      subject: `${inviterName} invited you to Teed Up Golf`,
      inviterName,
    });

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.error('Error sending guest invite email:', error);
    throw error;
  }
} 