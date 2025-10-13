import { Component, computed, input, output, signal, inject } from '@angular/core';
import { OrderItem } from '../../models/order';
import { DecimalPipe } from '@angular/common'; // Import DecimalPipe
import { CartLine } from './cart-line/cart-line';
import { getTieredPrice } from '../../utils/pricing.utils';
import { PosService } from '../../services/pos.service';

@Component({
  selector: 'app-shopping-cart',
  imports: [CartLine, DecimalPipe],
  templateUrl: './shopping-cart.html',
  styleUrl: './shopping-cart.scss',
})
export class ShoppingCart {
  private posService = inject(PosService);

  items = this.posService.processedItems;

  subtotal = computed(() => this.posService.cartTotals().subtotal);
  tax = computed(() => this.posService.cartTotals().tax);
  total = computed(() => this.posService.cartTotals().total);

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
    this.posService.onCartUpdated(newItems);
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
    this.posService.onCartUpdated(newItems);
  }

  // Event handler for a product name change
  handleUpdateProductName(event: { itemId: string; newName: string }) {
    const { itemId, newName } = event;
    const currentItems = this.items();
    const newItems = currentItems.map((item) =>
      item.id === itemId ? { ...item, product: { ...item.product, name: newName } } : item
    );
    this.posService.onCartUpdated(newItems);
  }

  handleRemove(deleteItem: OrderItem) {
    const newItems = this.items().filter((item) => item.id !== deleteItem.id);
    this.posService.onCartUpdated(newItems); // Emit the new array
  }
}
