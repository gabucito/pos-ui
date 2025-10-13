import { ChangeDetectionStrategy, Component, computed, input, model, output, signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Order } from '../../models/order';
import { CurrencyPipe, KeyValuePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PosService } from '../../services/pos.service';

export enum PaymentType {
  CASH = 'Cash',
  CARD = 'Card',
  TRANSFER = 'Transfer',
}

export interface Payment {
  type: PaymentType;
  amount: number;
}

@Component({
  selector: 'app-payment-modal',
  imports: [CurrencyPipe, KeyValuePipe, FormsModule],
  templateUrl: './payment-modal.html',
  styleUrl: './payment-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentModal {
  private posService = inject(PosService);

  order = input.required<Order>();
  isModalOpen = model(false);
  
  protected readonly payments = signal<Payment[]>([]);
  protected readonly paymentType = PaymentType;
  
  protected readonly remainingBalance = computed(() => {
    const totalPaid = this.payments().reduce((acc, payment) => acc + payment.amount, 0);
    return this.order().total - totalPaid;
  });

  addPayment(type: PaymentType) {
    const remaining = this.remainingBalance();
    const newPayment: Payment = { type, amount: remaining };
    this.payments.update(payments => [...payments, newPayment]);
    this.distributeRemainingAmount();
  }

  removePayment(index: number) {
    this.payments.update(payments => {
      const newPayments = [...payments];
      newPayments.splice(index, 1);
      return newPayments;
    });
    this.distributeRemainingAmount();
  }

  updatePaymentAmount(index: number, newAmount: number) {
    this.payments.update(payments => {
      const newPayments = [...payments];
      newPayments[index] = { ...newPayments[index], amount: newAmount };
      return newPayments;
    });
  }

  onAmountChange(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const amount = Number(input.value);
    this.updatePaymentAmount(index, amount);
  }

  private distributeRemainingAmount() {
    const remaining = this.remainingBalance();
    const payments = this.payments();
    if (payments.length === 0) {
      return;
    }
    const amountPerPayment = remaining / payments.length;
    this.payments.update(p => p.map(payment => ({ ...payment, amount: payment.amount + amountPerPayment })));
  }

  getPaymentType(type: string): PaymentType {
    return type as PaymentType;
  }

  processPayment() {
    if (this.remainingBalance() > 0) {
      return;
    }

    this.posService.onPaymentSuccess();
    this.isModalOpen.set(false);
  }
}