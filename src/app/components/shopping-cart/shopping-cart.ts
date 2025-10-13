import { Component, computed, input, output, signal } from '@angular/core';
import { OrderItem } from '../../models/order';
import { DecimalPipe } from '@angular/common'; // Import DecimalPipe
import { CartLine } from './cart-line/cart-line';
import { getTieredPrice } from '../../utils/pricing.utils';

@Component({
  selector: 'app-shopping-cart',
  imports: [CartLine, DecimalPipe],
  templateUrl: './shopping-cart.html',
  styleUrl: './shopping-cart.scss',
})
export class ShoppingCart {
  items = input.required<OrderItem[]>();

  // Emits events to the parent to request updates.
  updateItems = output<OrderItem[]>();

  subtotal = computed(() => this.processedItems().reduce((acc, item) => acc + (item.quantity * item.price), 0));
  tax = computed(() => this.subtotal() * 0.19); // 19% tax
  total = computed(() => this.subtotal() + this.tax());

  // A computed signal to process and update all prices reactively
  processedItems = computed(() => {
    const currentItems = this.items();
    const productQuantities = this.calculateProductQuantities(currentItems);

    return currentItems.map((item) => {
      const totalQuantity = productQuantities.get(item.product.id) || 0;
      // Use manually overridden price if it exists
      const newPrice = item.priceOverridden
        ? item.price
        : getTieredPrice(item.product.price, totalQuantity, item.product.priceTiers);

      // Return a new object with the updated price
      return {
        ...item,
        price: newPrice,
      };
    });
  });

  private calculateProductQuantities(items: OrderItem[]): Map<string, number> {
    const productQuantities = new Map<string, number>();
    for (const item of items) {
      const currentQuantity = productQuantities.get(item.product.id) || 0;
      productQuantities.set(item.product.id, currentQuantity + item.quantity);
    }
    return productQuantities;
  }

  // Event handler for a quantity change
  handleUpdateQuantity(event: { itemId: string; newQuantity: number }) {
    const { itemId, newQuantity } = event;
    const currentItems = this.items();
    const newItems = currentItems.map((item) => {
      // When quantity changes, clear any manual price override for this item
      // and recalculate the tiered price based on the new total quantity.
      if (item.id === itemId) {
        const newPrice = getTieredPrice(item.basePrice, newQuantity, item.variant?.priceTiers);
        return { ...item, quantity: newQuantity, price: newPrice, priceOverridden: false };
      }
      return item;
    });
    this.updateItems.emit(newItems);
  }

  // Event handler for a price change
  handleUpdatePrice(event: { itemId: string; newPrice: number }) {
    const { itemId, newPrice } = event;
    console.log('Handling price update:', itemId, newPrice);
    const currentItems = this.items();
    const newItems = currentItems.map((item) =>
      item.id === itemId
        ? { ...item, price: newPrice, priceOverridden: true } // Set the override flag
        : item
    );
    this.updateItems.emit(newItems);
  }

  // Event handler for a product name change
  handleUpdateProductName(event: { itemId: string; newName: string }) {
    const { itemId, newName } = event;
    const currentItems = this.items();
    const newItems = currentItems.map((item) =>
      item.id === itemId ? { ...item, product: { ...item.product, name: newName } } : item
    );
    this.updateItems.emit(newItems);
  }

  handleRemove(deleteItem: OrderItem) {
    const newItems = this.items().filter((item) => item.id !== deleteItem.id);
    this.updateItems.emit(newItems); // Emit the new array
  }
}
