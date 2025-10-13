import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VariantModal } from './variant-modal';
import { Product, ProductVariantOption } from '../../models/product';
import { Component, signal, WritableSignal } from '@angular/core';

// Host component to provide input to VariantModal
@Component({
  template: '<app-variant-modal [product]="product()"></app-variant-modal>',
  standalone: true,
  imports: [VariantModal]
})
class TestHostComponent {
  product: WritableSignal<Product | null> = signal(null);
}

describe('VariantModal', () => {
  let hostComponent: TestHostComponent;
  let component: VariantModal;
  let fixture: ComponentFixture<TestHostComponent>;

  const mockProduct: Product = {
    id: 'prod1',
    name: 'Test Product',
    description: 'Desc',
    price: 10,
    category: 'Cat',
    imageUrl: 'url',
    variants: [
      { id: 'size-variant', name: 'Size', options: [{ id: 's', name: 'Small', price: 10 }] },
      { id: 'color-variant', name: 'Color', options: [{ id: 'red', name: 'Red', price: 0 }] }
    ],
    priceTiers: []
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.product.set(mockProduct);
    fixture.detectChanges();

    component = fixture.debugElement.children[0].componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive product input', () => {
    expect(component.product()).toEqual(mockProduct);
  });

  it('selectVariant should emit variantSelected event', () => {
    spyOn(component.variantSelected, 'emit');
    const variantOption: ProductVariantOption = { id: 's', name: 'Small', price: 10 };
    component.selectVariant(variantOption);
    expect(component.variantSelected.emit).toHaveBeenCalledWith(variantOption);
  });

  it('onClose should emit closeModal event', () => {
    spyOn(component.closeModal, 'emit');
    component.onClose();
    expect(component.closeModal.emit).toHaveBeenCalled();
  });
});
