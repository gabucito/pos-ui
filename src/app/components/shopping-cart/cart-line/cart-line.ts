import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { OrderItem } from '../../../models/order';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: '[app-cart-line]',
  imports: [DecimalPipe, FormsModule],
  templateUrl: './cart-line.html',
  styleUrl: './cart-line.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  removeItem() {
    this.remove.emit(this.item());
  }
}
