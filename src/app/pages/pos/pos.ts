import { Component, signal } from '@angular/core';
import { ProductList } from '../../components/product-list/product-list';
import { ShoppingCart } from '../../components/shopping-cart/shopping-cart';
import { CustomerForm } from '../../components/customer-form/customer-form';
import { VariantModal } from '../../components/variant-modal/variant-modal';
import { OrderItem } from '../../models/order';
import { Customer } from '../../models/customer';
import { Product, ProductVariantOption, PriceTier } from '../../models/product';
import { v7 as uuidv7 } from 'uuid';
import { getTieredPrice } from '../../utils/pricing.utils';

@Component({
  selector: 'app-pos', // Changed selector
  imports: [ProductList, ShoppingCart, CustomerForm, VariantModal],
  templateUrl: './pos.html', // Changed templateUrl
  styleUrl: './pos.scss' // Changed styleUrl
})
export class Pos { // Changed class name
  public readonly title = signal('pos-ui');
  cartItems = signal<OrderItem[]>([]);
  selectedCustomer = signal<Customer | null>(null);
  isVariantModalOpen = signal(false);
  selectedProductForVariant = signal<Product | null>(null);

  onProductAdded(item: OrderItem) {
    const existingItem = this.cartItems().find(i => i.product.id === item.product.id && i.variant?.id === item.variant?.id);
    if (existingItem) {
        const updatedItems = this.cartItems().map(i => {
            if (i.id === existingItem.id) {
                return { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price };
            }
            return i;
        });
        this.cartItems.set(updatedItems);
    } else {
        this.cartItems.set([...this.cartItems(), item]);
    }
  }

  onCartUpdated(items: OrderItem[]) {
    this.cartItems.set(items);
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
        price: newPrice,
        total: newPrice
      };
      this.onProductAdded(orderItem);
    }
    this.onCloseVariantModal();
  }
}
