export interface PriceTier {
    quantity: number;
    price: number;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
    variants: ProductVariant[];
    priceTiers?: PriceTier[];
}

export interface ProductVariant {
    id: string;
    name: string;
    options: ProductVariantOption[];
}

export interface ProductVariantOption {
    id: string;
    name: string;
    price: number;
    priceTiers?: PriceTier[];
}
