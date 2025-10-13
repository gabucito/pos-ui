import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CustomerForm } from './customer-form';
import { Customer } from '../../models/customer';

describe('CustomerForm', () => {
  let component: CustomerForm;
  let fixture: ComponentFixture<CustomerForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerForm, ReactiveFormsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty values', () => {
    expect(component.customerForm.get('name')?.value).toBe('');
    expect(component.customerForm.get('email')?.value).toBe('');
    expect(component.customerForm.get('phone')?.value).toBe('');
  });

  describe('onSubmit', () => {
    it('should emit customerSelected and reset the form when valid', () => {
      const customer: Customer = {
        id: Date.now().toString(), // This will be mocked or handled dynamically
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890'
      };

      spyOn(component.customerSelected, 'emit');
      spyOn(component.customerForm, 'reset');

      component.customerForm.setValue({
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      });

      component.onSubmit();

      expect(component.customerSelected.emit).toHaveBeenCalledWith(jasmine.objectContaining({
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      }));
      expect(component.customerForm.reset).toHaveBeenCalled();
      expect(component.customerForm.get('name')?.value).toBeNull(); // reset sets to null
    });

    it('should not emit customerSelected if the form is invalid', () => {
      spyOn(component.customerSelected, 'emit');
      component.customerForm.setValue({
        name: '',
        email: '',
        phone: ''
      });
      component.customerForm.markAsTouched();

      component.onSubmit();

      expect(component.customerSelected.emit).not.toHaveBeenCalled();
    });
  });
});
