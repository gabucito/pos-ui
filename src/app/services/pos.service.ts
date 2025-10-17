import { computed, Injectable, signal } from '@angular/core';
import { Order, OrderItem } from '../models/order';
import { Customer } from '../models/customer';
import { Product, ProductVariantOption } from '../models/product';
import { v7 as uuidv7 } from 'uuid';
import { getTieredPrice } from '../utils/pricing.utils';

@Injectable({
  providedIn: 'root',
})
export class PosService {
  orders = signal<Order[]>([]);
  private activeOrderIndex = signal<number>(0);
  private readonly taxRate = 0.19;

  private rawCartItems = computed<OrderItem[]>(() => this.orders()[this.activeOrderIndex()]?.items ?? []);
  cartItems = computed<OrderItem[]>(() => this.applyPricing(this.rawCartItems()));
  cartTotals = computed<{ subtotal: number; tax: number; total: number }>(() =>
    this.calculateTotals(this.cartItems()),
  );
  selectedCustomer = computed<Customer | null>(() => this.orders()[this.activeOrderIndex()]?.customer ?? null);
  isVariantModalOpen = signal(false);
  selectedProductForVariant = signal<Product | null>(null);
  isPaymentModalOpen = signal(false);
  currentOrder = computed<Order | null>(() => this.orders()[this.activeOrderIndex()] ?? null);

  constructor() {
    this.addOrder();
  }

  addOrder() {
    const newOrder: Order = {
      id: uuidv7(),
      items: [],
      customer: null,
      subtotal: 0,
      tax: 0,
      total: 0,
      status: 'pending',
    };
    this.orders.update((orders) => [...orders, newOrder]);
    this.activeOrderIndex.set(this.orders().length - 1);
  }

  switchOrder(index: number) {
    if (index >= 0 && index < this.orders().length) {
      this.activeOrderIndex.set(index);
    }
  }

  closeOrder(index: number) {
    this.orders.update((orders) => orders.filter((_, i) => i !== index));
    if (this.orders().length === 0) {
      this.addOrder(); // Add a new order if all are closed
    } else if (this.activeOrderIndex() >= this.orders().length) {
      this.activeOrderIndex.set(this.orders().length - 1);
    }
  }

  addProductToCart(product: Product) {
    if (product.variants.length > 0) {
      this.onOpenVariantModal(product);
    } else {
      const quantity = 1;
      const newPrice = getTieredPrice(product, quantity);

      const orderItem: OrderItem = {
        id: uuidv7(),
        product: product,
        variant: null,
        quantity: quantity,
        basePrice: product.price,
        price: newPrice,
      };
      this.addOrderItem(orderItem);
    }
  }

  private addOrderItem(item: OrderItem) {
    this.updateCurrentOrderItems((items) => {
      const existingItemIndex = items.findIndex(
        (existing) => existing.product.id === item.product.id && existing.variant?.id === item.variant?.id,
      );

      if (existingItemIndex > -1) {
        return items.map((existing, index) =>
          index === existingItemIndex
            ? { ...existing, quantity: existing.quantity + item.quantity }
            : existing,
        );
      }

      return [...items, { ...item }];
    });
  }

  onCartUpdated(items: OrderItem[]) {
    this.updateCurrentOrderItems(() => items.map((item) => ({ ...item })));
  }

  onCustomerSelected(customer: Customer) {
    this.orders.update((orders) => {
      const index = this.activeOrderIndex();
      const currentOrder = orders[index];
      if (!currentOrder) {
        return orders;
      }

      const updatedOrders = [...orders];
      updatedOrders[index] = { ...currentOrder, customer };
      return updatedOrders;
    });
  }

  onOpenVariantModal(product: Product) {
    this.selectedProductForVariant.set(product);
    this.isVariantModalOpen.set(true);
  }

  onCloseVariantModal() {
    this.isVariantModalOpen.set(false);
    this.selectedProductForVariant.set(null);
  }

  onVariantSelected(variant: ProductVariantOption | null) {
    const product = this.selectedProductForVariant();
    if (product) {
      const selectedVariant = variant || product.variants[0]?.options[0] || null;

      if (selectedVariant) {
        const quantity = 1;
        const newPrice = getTieredPrice(product, quantity, selectedVariant);
        const orderItem: OrderItem = {
          id: uuidv7(),
          product: product,
          variant: selectedVariant,
          quantity: quantity,
          basePrice: product.price,
          price: newPrice,
        };
        this.addOrderItem(orderItem);
      }
    }
    this.onCloseVariantModal();
  }

  onPay() {
    this.isPaymentModalOpen.set(true);
  }

  onPaymentSuccess() {
    this.orders.update((orders) => {
      const currentOrder = { ...orders[this.activeOrderIndex()] };
      currentOrder.status = 'completed';
      const newOrders = [...orders];
      newOrders[this.activeOrderIndex()] = currentOrder;
      return newOrders;
    });
    this.isPaymentModalOpen.set(false);
    this.addOrder(); // Start a new order after successful payment
  }

  private updateCurrentOrderItems(modifier: (items: OrderItem[]) => OrderItem[]) {
    const index = this.activeOrderIndex();
    this.orders.update((orders) => {
      const currentOrder = orders[index];
      if (!currentOrder) {
        return orders;
      }

      const mutableItems = currentOrder.items.map((item) => ({ ...item }));
      const modifiedItems = modifier(mutableItems);
      const pricedItems = this.applyPricing(modifiedItems);
      const totals = this.calculateTotals(pricedItems);

      const nextOrders = [...orders];
      nextOrders[index] = {
        ...currentOrder,
        items: pricedItems,
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
      };
      return nextOrders;
    });
  }

  private applyPricing(items: OrderItem[]): OrderItem[] {
    const productQuantities = this.calculateItemQuantities(items);
    return items.map((item) => {
      if (item.priceOverridden) {
        return { ...item };
      }

      const key = this.getItemKey(item);
      const totalQuantity = productQuantities.get(key) ?? item.quantity;
      const recalculatedPrice = getTieredPrice(item.product, totalQuantity, item.variant ?? null);
      return { ...item, price: recalculatedPrice };
    });
  }

  private calculateItemQuantities(items: OrderItem[]): Map<string, number> {
    const productQuantities = new Map<string, number>();
    for (const item of items) {
      const key = this.getItemKey(item);
      const currentQuantity = productQuantities.get(key) ?? 0;
      productQuantities.set(key, currentQuantity + item.quantity);
    }
    return productQuantities;
  }

  private getItemKey(item: OrderItem): string {
    return item.variant ? `${item.product.id}::${item.variant.id}` : item.product.id;
  }

  private calculateTotals(items: OrderItem[]): { subtotal: number; tax: number; total: number } {
    const subtotal = items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    const tax = subtotal * this.taxRate;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }
}
