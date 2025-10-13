import { Component, signal } from '@angular/core';
import { ProductList } from '../../components/product-list/product-list';
import { ShoppingCart } from '../../components/shopping-cart/shopping-cart';
import { CustomerForm } from '../../components/customer-form/customer-form';
import { VariantModal } from '../../components/variant-modal/variant-modal';
import { PaymentModal } from '../../components/payment-modal/payment-modal';
import { OrderItem, Order } from '../../models/order';
import { Customer } from '../../models/customer';
import { Product, ProductVariantOption, PriceTier } from '../../models/product';
import { v7 as uuidv7 } from 'uuid';
import { getTieredPrice } from '../../utils/pricing.utils';

@Component({
  selector: 'app-pos', // Changed selector
  imports: [ProductList, ShoppingCart, CustomerForm, VariantModal, PaymentModal],
  templateUrl: './pos.html', // Changed templateUrl
  styleUrl: './pos.scss' // Changed styleUrl
})
export class Pos { // Changed class name
  public readonly title = signal('pos-ui');
  cartItems = signal<OrderItem[]>([]);
  cartTotals = signal<{ subtotal: number; tax: number; total: number }>({ subtotal: 0, tax: 0, total: 0 });
  selectedCustomer = signal<Customer | null>(null);
  isVariantModalOpen = signal(false);
  selectedProductForVariant = signal<Product | null>(null);
  isPaymentModalOpen = signal(false);
  currentOrder = signal<Order | null>(null);

  onPay() {
    const { subtotal, tax, total } = this.cartTotals();
    const order: Order = {
      id: uuidv7(),
      items: this.cartItems(),
      customer: this.selectedCustomer(),
      subtotal,
      tax,
      total,
      status: 'pending'
    };
    this.currentOrder.set(order);
    this.isPaymentModalOpen.set(true);
  }

  onPaymentSuccess(order: Order) {
    console.log('Payment successful for order:', order);
    this.cartItems.set([]);
    this.selectedCustomer.set(null);
    this.calculateTotals();
  }

  private calculateTotals() {
    const subtotal = this.cartItems().reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const tax = subtotal * 0.19; // 19% tax
    const total = subtotal + tax;
    this.cartTotals.set({ subtotal, tax, total });
    console.log('Cart totals updated');
  }

  onProductAdded(item: OrderItem) {
    const existingItemIndex = this.cartItems().findIndex(i => i.product.id === item.product.id && i.variant?.id === item.variant?.id);

    if (existingItemIndex > -1) {
        const updatedItems = this.cartItems().map((i, index) => {
            if (index === existingItemIndex) {
                const newQuantity = i.quantity + 1;
                const newPrice = getTieredPrice(i.basePrice, newQuantity, i.variant?.priceTiers);
                return { ...i, quantity: newQuantity, price: newPrice };
            }
            return i;
        });
        this.cartItems.set(updatedItems);
    } else {
        this.cartItems.set([...this.cartItems(), item]);
    }
    this.calculateTotals();
  }

  onCartUpdated(items: OrderItem[]) {
    this.cartItems.set(items);
    this.calculateTotals();
  }

  onCustomerSelected(customer: Customer) {
    this.selectedCustomer.set(customer);
  }

  onOpenVariantModal(product: Product) {
    this.selectedProductForVariant.set(product);
    this.isVariantModalOpen.set(true);
  }

  onCloseVariantModal() {
    this.isVariantModalOpen.set(false);
    this.selectedProductForVariant.set(null);
  }

  onVariantSelected(variant: ProductVariantOption) {
    const product = this.selectedProductForVariant();
    if (product) {
      const quantity = 1;
      const newPrice = getTieredPrice(variant.price, quantity, variant.priceTiers);

      const orderItem: OrderItem = {
        id: uuidv7(), // Using uuidv7()
        product: product,
        variant: variant,
        quantity: quantity,
        basePrice: variant.price,
        price: newPrice
      };
      this.onProductAdded(orderItem);
    }
    this.onCloseVariantModal();
  }
}
