import { PriceTier, Product, ProductVariantOption } from '../models/product';

// Helper function to calculate price based on quantity and price tiers
export function getTieredPrice(product: Product, quantity: number, variant?: ProductVariantOption | null): number {
  let basePrice: number;
  let priceTiers: PriceTier[] | undefined;

  if (variant) {
    basePrice = variant.price ?? product.price;
    priceTiers = variant.priceTiers;
  } else {
    basePrice = product.price;
    priceTiers = product.priceTiers;
  }

  if (!priceTiers || priceTiers.length === 0) {
    return basePrice;
  }

  // Sort tiers by quantity in descending order to find the highest applicable tier
  const sortedTiers = [...priceTiers].sort((a, b) => b.quantity - a.quantity);

  for (const tier of sortedTiers) {
    if (quantity >= tier.quantity) {
      return tier.price;
    }
  }

  return basePrice;
}
