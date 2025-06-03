// Mock payment processing (will be replaced with Stripe/in-app purchases)
export async function chargeGuestFee(email: string): Promise<boolean> {
  try {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful payment 90% of the time
    return Math.random() < 0.9;
  } catch (error) {
    console.error('Error processing guest fee:', error);
    return false;
  }
}

export async function refundGuestFee(email: string): Promise<boolean> {
  try {
    // Simulate refund processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful refund 95% of the time
    return Math.random() < 0.95;
  } catch (error) {
    console.error('Error processing guest fee refund:', error);
    return false;
  }
}

export const GUEST_FEE = 0.25; // $0.25 USD 