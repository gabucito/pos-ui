import { Injectable, signal, computed } from '@angular/core';
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

  // Public signals for the active order
  private rawCartItems = computed<OrderItem[]>(() => this.orders()[this.activeOrderIndex()]?.items || []);

  // A computed signal to process and update all prices reactively
  processedItems = computed(() => {
    const currentItems = this.rawCartItems();
    const productQuantities = this.calculateProductQuantities(currentItems);

    return currentItems.map((item) => {
      const totalQuantity = productQuantities.get(item.product.id) || 0;
      // Use manually overridden price if it exists
      const newPrice = item.priceOverridden
        ? item.price
        : getTieredPrice(item.product, totalQuantity, item.variant);

      // Return a new object with the updated price
      return {
        ...item,
        price: newPrice,
      };
    });
  });

  cartItems = computed<OrderItem[]>(() => this.processedItems());

  cartTotals = computed<{ subtotal: number; tax: number; total: number }>(() => {
    const subtotal = this.cartItems().reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const tax = subtotal * 0.19; // 19% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  });
  selectedCustomer = computed<Customer | null>(() => this.orders()[this.activeOrderIndex()]?.customer || null);
  isVariantModalOpen = signal(false);
  selectedProductForVariant = signal<Product | null>(null);
  isPaymentModalOpen = signal(false);
  currentOrder = computed<Order | null>(() => this.orders()[this.activeOrderIndex()] || null);

  private calculateProductQuantities(items: OrderItem[]): Map<string, number> {
    const productQuantities = new Map<string, number>();
    for (const item of items) {
      const currentQuantity = productQuantities.get(item.product.id) || 0;
      productQuantities.set(item.product.id, currentQuantity + item.quantity);
    }
    return productQuantities;
  }

  constructor() {
    // Initialize with a default empty order
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
    this.orders.update((orders) => {
      const currentOrder = { ...orders[this.activeOrderIndex()] };
      const existingItemIndex = currentOrder.items.findIndex(
        (i) => i.product.id === item.product.id && i.variant?.id === item.variant?.id
      );

      if (existingItemIndex > -1) {
        currentOrder.items = currentOrder.items.map((i, index) => {
          if (index === existingItemIndex) {
            const newQuantity = i.quantity + 1;
            const newPrice = getTieredPrice(i.product, newQuantity, i.variant);
            return { ...i, quantity: newQuantity, price: newPrice };
          }
          return i;
        });
      } else {
        currentOrder.items = [...currentOrder.items, item];
      }

      // Update the orders signal first to trigger cartTotals re-evaluation
      const updatedOrders = [...orders];
      updatedOrders[this.activeOrderIndex()] = currentOrder;
      this.orders.set(updatedOrders);

      // Now, recalculate totals for the current order using the re-evaluated cartTotals
      const { subtotal, tax, total } = this.cartTotals();
      currentOrder.subtotal = subtotal;
      currentOrder.tax = tax;
      currentOrder.total = total;

      // Update the orders signal again with the new totals
      updatedOrders[this.activeOrderIndex()] = currentOrder;
      return updatedOrders;
    });
  }

  onCartUpdated(items: OrderItem[]) {
    this.orders.update((orders) => {
      const currentOrder = { ...orders[this.activeOrderIndex()] };
      currentOrder.items = items;

      // Update the orders signal first to trigger cartTotals re-evaluation
      const updatedOrders = [...orders];
      updatedOrders[this.activeOrderIndex()] = currentOrder;
      this.orders.set(updatedOrders);

      // Now, recalculate totals for the current order using the re-evaluated cartTotals
      const { subtotal, tax, total } = this.cartTotals();
      currentOrder.subtotal = subtotal;
      currentOrder.tax = tax;
      currentOrder.total = total;

      // Update the orders signal again with the new totals
      updatedOrders[this.activeOrderIndex()] = currentOrder;
      return updatedOrders;
    });
  }

  onCustomerSelected(customer: Customer) {
    this.orders.update((orders) => {
      const currentOrder = { ...orders[this.activeOrderIndex()] };
      currentOrder.customer = customer;
      const newOrders = [...orders];
      newOrders[this.activeOrderIndex()] = currentOrder;
      return newOrders;
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
        console.log(newPrice);
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
}