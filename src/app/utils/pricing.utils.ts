import { PriceTier } from "../models/product";

// Helper function to calculate price based on quantity and price tiers
export function getTieredPrice(basePrice: number, quantity: number, priceTiers?: PriceTier[]): number {
  if (!priceTiers || priceTiers.length === 0) {
    return basePrice;
  }

  // Sort tiers by quantity in descending order to find the highest applicable tier
  // Ensure the tiers are sorted once, or handle a pre-sorted array for performance if many calls are expected.
  const sortedTiers = [...priceTiers].sort((a, b) => b.quantity - a.quantity);

  for (const tier of sortedTiers) {
    if (quantity >= tier.quantity) {
      return tier.price;
    }
  }

  return basePrice;
}