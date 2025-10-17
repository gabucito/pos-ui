import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Product, ProductVariantOption } from '../../models/product';

@Component({
  selector: 'app-variant-modal',
  imports: [],
  templateUrl: './variant-modal.html',
  styleUrl: './variant-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VariantModal {
  product = input<Product | null>();
  variantSelected = output<ProductVariantOption>();
  closeModal = output<void>();

  selectVariant(variant: ProductVariantOption) {
    this.variantSelected.emit(variant);
  }

  onClose() {
    this.closeModal.emit();
  }
}
