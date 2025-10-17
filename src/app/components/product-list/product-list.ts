import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Product } from '../../models/product';
import { PRODUCTS } from '../../mock-data';
import { PosService } from '../../services/pos.service';

@Component({
  selector: 'app-product-list',
  imports: [NgOptimizedImage],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductList {
  private posService = inject(PosService);

  products = signal<Product[]>(PRODUCTS);
  searchTerm = signal<string>('');
  selectedCategory = signal<string>('');

  categories = computed(() => {
    const allCategories = this.products().map(p => p.category);
    return Array.from(new Set(allCategories));
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
    this.posService.addProductToCart(product);
  }
}
