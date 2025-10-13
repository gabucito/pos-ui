import { Component, computed, input, output, signal } from '@angular/core';
import { OrderItem } from '../../../models/order';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: '[app-cart-line]',
  imports: [DecimalPipe, FormsModule],
  templateUrl: './cart-line.html',
  styleUrl: './cart-line.scss',
})
export class CartLine {
  item = input.required<OrderItem>();
  remove = output<OrderItem>();
  update = output<OrderItem>();
  updateQuantity = output<{ itemId: string; newQuantity: number }>();
  updatePrice = output<{ itemId: string; newPrice: number }>();
  updateProductName = output<{ itemId: string; newName: string }>();

  editingField = signal<string | null>(null);

  total = computed(() => this.item().quantity * this.item().price);

  startEditing(field: string) {
    this.editingField.set(field);
  }

  isEditing(field: string): boolean {
    return this.editingField() === field;
  }

  stopEditing() {
    this.editingField.set(null);
  }

  updateField(field: string, newValue: string | number) {
    const currentItem = this.item();

    switch (field) {
      case 'quantity':
        this.updateQuantity.emit({ itemId: currentItem.id, newQuantity: Number(newValue) });
        break;
      case 'price':
        this.updatePrice.emit({ itemId: currentItem.id, newPrice: Number(newValue) });
        break;
      case 'product.name':
        this.updateProductName.emit({ itemId: currentItem.id, newName: newValue as string });
        break;
      default:
        console.warn(`Unknown field: ${field}`);
    }
  }

  // updateField(field: string, newValue: string | number) {
  //   let newItem = { ...this.item() };

  //   // The logic to handle the specific field update
  //   if (field === 'product.name') {
  //     // Create a new nested object for immutability
  //     newItem.product = { ...newItem.product, name: newValue as string };
  //   } else if (field === 'quantity') {
  //     newItem.quantity = Number(newValue);
  //   } else if (field === 'price') {
  //     newItem.price = Number(newValue);
  //   }

  //   console.log('Updated Item:', newItem);
  //   this.update.emit(newItem);
  // }

  removeItem() {
    this.remove.emit(this.item());
  }
}
