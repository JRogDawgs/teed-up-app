// Mock list of admin user IDs
const ADMIN_IDS = [
  'admin1',
  'admin2',
  'admin3',
];

// Mock list of admin emails
const ADMIN_EMAILS = [
  'admin@teedup.com',
  'support@teedup.com',
];

export function isAdmin(userId: string): boolean {
  return ADMIN_IDS.includes(userId);
}

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export function checkAdminAccess(user: { id: string; email: string } | null): boolean {
  if (!user) return false;
  return isAdmin(user.id) || isAdminEmail(user.email);
}

// Mock function to get admin stats
export async function getAdminStats() {
  // TODO: Replace with actual API call
  return {
    totalSubscribers: 156,
    subscriptionBreakdown: {
      monthly: 98,
      yearly: 58,
    },
    totalGuestGames: 243,
    monthlyRevenue: {
      subscriptions: 294,
      guestFees: 60.75,
      total: 354.75,
    },
    recentActivity: [
      {
        type: 'subscription',
        plan: 'yearly',
        amount: 25,
        date: '2024-03-15T10:30:00Z',
      },
      {
        type: 'guest_fee',
        amount: 0.25,
        guests: 1,
        date: '2024-03-15T09:15:00Z',
      },
      {
        type: 'subscription',
        plan: 'monthly',
        amount: 3,
        date: '2024-03-14T16:45:00Z',
      },
    ],
  };
} 