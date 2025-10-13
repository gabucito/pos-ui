import { Customer } from './customer';
import { Product } from './product';
import { ProductVariantOption } from './product';

export interface Order {
    id: string;
    items: OrderItem[];
    customer: Customer;
    subtotal: number;
    tax: number;
    total: number;
    status: 'pending' | 'completed' | 'canceled';
}

export interface OrderItem {
    id: string;
    product: Product;
    variant?: ProductVariantOption | null;
    quantity: number;
    basePrice: number;
    price: number;
    total: number;
    priceOverridden?: boolean;
}
