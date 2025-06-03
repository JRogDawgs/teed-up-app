# Internal Development Notes

## Monetization Implementation

### Current Implementation Status
1. **Game Model**
   - ✅ Added `isHostSubscriber` flag
   - ✅ Added `hasGuests` and `hasRegisteredPlayers` flags
   - ✅ Added `guestCount` tracking
   - ✅ Added `eligibleForUpsell` flag (when guestCount > 1)

2. **Guest Player Logic**
   - ✅ Guest players cannot save rounds
   - ✅ Guest players excluded from stat aggregation
   - ✅ Guest rounds flagged for optional monetization
   - ✅ Guest recap emails implemented

3. **Subscription Gates**
   - ✅ Basic subscription status tracking
   - ✅ Guest-only game save prevention
   - ✅ Guest player restrictions
   - ⏳ Subscription tier enforcement (pending)

### Implementation Details

#### Game Creation
```typescript
// Game creation includes monetization flags
const gameData = {
  players: selectedPlayers,
  hasGuests: selectedPlayers.some(isGuestPlayer),
  hasRegisteredPlayers: selectedPlayers.some(p => !isGuestPlayer(p)),
  isHostSubscriber: false, // TODO: Get from user profile
  guestCount: selectedPlayers.filter(isGuestPlayer).length,
  eligibleForUpsell: selectedPlayers.filter(isGuestPlayer).length > 1
};
```

#### Guest Player Handling
```typescript
// Guest player type guard
export function isGuestPlayer(player: Player): player is GuestPlayer {
  return 'paid' in player;
}

// Guest player restrictions
if (gameSummary.players.every(p => p.isGuest)) {
  Alert.alert(
    'No Registered Players',
    'This game cannot be saved to history as it only contains guest players.'
  );
  return;
}
```

#### Monetization Prompt
```typescript
// Show monetization prompt for eligible games
if (getGuestPlayerCount(game) > 1 && !game.isHostSubscriber) {
  setShowMonetizationPrompt(true);
}
```

### Future Implementation Notes

#### Stripe Integration (Phase 5)
1. **Guest Round Saving**
   - Implement $0.25/player charge
   - Add payment processing
   - Generate receipts
   - Track payment history

2. **Subscription Management**
   - Handle $3/month or $25/year plans
   - Process recurring payments
   - Manage subscription status
   - Handle cancellations

#### Feature Gates
1. **Game Saving**
   - Free tier: 5 rounds
   - Premium: Unlimited
   - Guest rounds: Optional save

2. **Statistics**
   - Free tier: Basic stats
   - Premium: Advanced analytics
   - Guest players: Excluded

### Testing Requirements

#### Guest Player Features
1. **Game Creation**
   - [ ] Verify guest player addition
   - [ ] Check guest fee processing
   - [ ] Validate guest restrictions
   - [ ] Test guest notifications

2. **Game Saving**
   - [ ] Verify guest-only game prevention
   - [ ] Test mixed player games
   - [ ] Validate guest round saving
   - [ ] Check stat aggregation

3. **Monetization**
   - [ ] Test guest fee charging
   - [ ] Verify receipt generation
   - [ ] Check payment history
   - [ ] Validate subscription gates

### Security Considerations

1. **Payment Processing**
   - Implement secure payment flow
   - Protect payment information
   - Validate transactions
   - Handle payment errors

2. **User Data**
   - Protect user information
   - Secure subscription data
   - Handle guest player data
   - Manage payment history

3. **Access Control**
   - Validate subscription status
   - Check feature access
   - Manage guest permissions
   - Control stat access 