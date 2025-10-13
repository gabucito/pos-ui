import { Component, signal, computed, output } from '@angular/core';
import { Product, PriceTier } from '../../models/product'; // Import PriceTier
import { PRODUCTS } from '../../mock-data';
import { OrderItem } from '../../models/order';
import { v7 as uuidv7 } from 'uuid';
import { getTieredPrice } from '../../utils/pricing.utils';

@Component({
  selector: 'app-product-list',
  imports: [],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductList {
  productAdded = output<OrderItem>();
  openVariantModal = output<Product>();

  products = signal<Product[]>(PRODUCTS);
  searchTerm = signal<string>('');
  selectedCategory = signal<string>('');

  categories = computed(() => {
    const allCategories = this.products().map(p => p.category);
    return ['All Categories', ...new Set(allCategories)];
  });

  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const category = this.selectedCategory();

    return this.products().filter(product => {
      const nameMatch = product.name.toLowerCase().includes(term);
      const categoryMatch = category === '' || product.category === category;
      return nameMatch && categoryMatch;
    });
  });

  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  onSelectCategory(event: Event) {
    this.selectedCategory.set((event.target as HTMLSelectElement).value);
  }

  addProductToCart(product: Product) {
    if (product.variants.length > 0) {
      this.openVariantModal.emit(product);
    } else {
      const quantity = 1;
      const newPrice = getTieredPrice(product.price, quantity, product.priceTiers);

      const orderItem: OrderItem = {
        id: uuidv7(),
        product: product,
        variant: null,
        quantity: quantity,
        basePrice: product.price,
        price: newPrice
      };
      this.productAdded.emit(orderItem);
    }
  }
}
