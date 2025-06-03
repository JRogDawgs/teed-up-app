# Teed Up Golf App Specification

## Core Features

### Game Management
- Real-time score tracking
- Player management (registered and guest)
- Course selection and hole tracking
- Order management and delivery
- Basic statistics and trends

### Player Types
1. **Registered Users**
   - Full access to game history
   - Stat tracking and trends
   - Order history
   - Profile management

2. **Guest Players**
   - Limited to current game
   - No stat tracking
   - Optional round saving ($0.25/player)
   - Receives round recap email

## Monetization Model

### Subscription Tiers
- **Free Tier**
  - Basic game tracking
  - Limited to 5 saved rounds
  - Basic statistics
  - Guest player support (limited)

- **Premium Subscription**
  - $3/month or $25/year
  - Unlimited saved rounds
  - Advanced statistics and trends
  - Full guest player support
  - Priority support

### Guest Player Model
- Guests can join games but cannot:
  - Save rounds to history
  - Access long-term statistics
  - Track personal trends
- Guest rounds are flagged for optional monetization:
  - Host can pay $0.25/player to include guest rounds in recaps
  - Includes shareable scorecard
  - Guest receives round recap email
  - Integration with Stripe planned for Phase 5

### Game Model
```typescript
interface Game {
  id: string;
  hostId: string;
  players: Player[];
  courseId: string;
  startTime: number;
  endTime?: number;
  status: 'pending' | 'active' | 'completed';
  currentHole: number;
  currentPlayerIndex: number;
  roundData: {
    [playerId: string]: {
      scores: number[];
      putts: number[];
      fairways: ('hit' | 'left' | 'right')[];
      greens: boolean[];
      penalties: number[];
    };
  };
  // Monetization flags
  isHostSubscriber: boolean;
  hasGuests: boolean;
  hasRegisteredPlayers: boolean;
  guestCount: number;
  eligibleForUpsell: boolean;
}

interface Player {
  id: string;
  name: string;
  email: string;
  isGuest: boolean;
  // Additional fields for registered users
  firstName?: string;
  lastName?: string;
  handicap?: number;
}
```

### Helper Functions
```typescript
// Player type checking
export function isGuestPlayer(player: Player): player is GuestPlayer {
  return 'paid' in player;
}

// Game composition
export function hasGuestPlayers(game: Game): boolean {
  return game.players.some(isGuestPlayer);
}

export function hasRegisteredPlayers(game: Game): boolean {
  return game.players.some(p => !isGuestPlayer(p));
}

// Player counting
export function getGuestPlayerCount(game: Game): number {
  return game.players.filter(isGuestPlayer).length;
}

export function getRegisteredPlayerCount(game: Game): number {
  return game.players.filter(p => !isGuestPlayer(p)).length;
}
```

### Monetization Gates
1. **Game Saving**
   - Guest-only games cannot be saved
   - Free tier limited to 5 saved rounds
   - Premium tier has unlimited saves

2. **Statistics**
   - Guest players excluded from stat aggregation
   - Free tier shows basic stats
   - Premium tier includes advanced analytics

3. **Guest Features**
   - Basic guest support in free tier
   - Full guest features in premium tier
   - Optional guest round saving ($0.25/player)

## UI/UX Guidelines

### Guest Player Indicators
- Orange accent color for guest players
- "Guest" tag in top-right of player cards
- Subtle notice on game creation
- Separate sections for guest and registered players

### Monetization Prompts
- Modal for guest round saving
- Clear pricing information
- Easy opt-out options
- Consistent with Masters theme

### Type Safety
- TypeScript interfaces for all models
- Type guards for player types
- Null safety for optional fields
- Consistent error handling

## Technical Requirements

### Data Management
- Secure storage of player data
- Subscription status tracking
- Payment history
- Game history management

### Security
- Payment data protection
- User data privacy
- Subscription validation
- Access control

### Performance
- Real-time score updates
- Efficient stat calculations
- Smooth UI transitions
- Responsive design