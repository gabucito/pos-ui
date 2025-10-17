import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ProductList } from '../../components/product-list/product-list';
import { ShoppingCart } from '../../components/shopping-cart/shopping-cart';
import { CustomerForm } from '../../components/customer-form/customer-form';
import { VariantModal } from '../../components/variant-modal/variant-modal';
import { PaymentModal } from '../../components/payment-modal/payment-modal';
import { PosService } from '../../services/pos.service';

@Component({
  selector: 'app-pos',
  imports: [ProductList, ShoppingCart, CustomerForm, VariantModal, PaymentModal],
  templateUrl: './pos.html',
  styleUrl: './pos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pos {
  private posService = inject(PosService);

  // Expose signals from the service
  cartItems = this.posService.cartItems;
  cartTotals = this.posService.cartTotals;
  selectedCustomer = this.posService.selectedCustomer;
  isVariantModalOpen = this.posService.isVariantModalOpen;
  selectedProductForVariant = this.posService.selectedProductForVariant;
  isPaymentModalOpen = this.posService.isPaymentModalOpen;
  currentOrder = this.posService.currentOrder;
  orders = this.posService.orders;

  // Expose methods from the service
  onProductAdded = this.posService.addProductToCart.bind(this.posService);
  onCartUpdated = this.posService.onCartUpdated.bind(this.posService);
  onCustomerSelected = this.posService.onCustomerSelected.bind(this.posService);
  onOpenVariantModal = this.posService.onOpenVariantModal.bind(this.posService);
  onCloseVariantModal = this.posService.onCloseVariantModal.bind(this.posService);
  onVariantSelected = this.posService.onVariantSelected.bind(this.posService);
  onPay = this.posService.onPay.bind(this.posService);
  onPaymentSuccess = this.posService.onPaymentSuccess.bind(this.posService);

  // Methods for managing multiple orders
  addOrder = this.posService.addOrder.bind(this.posService);
  switchOrder = this.posService.switchOrder.bind(this.posService);
  closeOrder = this.posService.closeOrder.bind(this.posService);
}
