import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Customer } from '../../models/customer';

@Component({
  selector: 'app-customer-form',
  imports: [ReactiveFormsModule],
  templateUrl: './customer-form.html',
  styleUrl: './customer-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerForm {
  customerSelected = output<Customer>();

  customerForm = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
    phone: new FormControl('')
  });

  onSubmit() {
    if (this.customerForm.valid) {
      const newCustomer: Customer = {
        id: Date.now().toString(),
        name: this.customerForm.value.name || '',
        email: this.customerForm.value.email || '',
        phone: this.customerForm.value.phone || ''
      };
      this.customerSelected.emit(newCustomer);
      this.customerForm.reset();
    }
  }
}
