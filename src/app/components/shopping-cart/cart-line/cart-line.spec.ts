import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartLine } from './cart-line';
import { OrderItem } from '../../../models/order';
import { Product } from '../../../models/product';
import { Component, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Host component to provide input to CartLine
@Component({
  template: '<tr app-cart-line [item]="item()"></tr>',
  standalone: true,
  imports: [CartLine]
})
class TestHostComponent {
  item: WritableSignal<OrderItem> = signal(null!);
}

describe('CartLine', () => {
  let hostComponent: TestHostComponent;
  let component: CartLine;
  let fixture: ComponentFixture<TestHostComponent>;

  const mockProduct: Product = {
    id: 'prod1',
    name: 'Test Product',
    description: 'Desc',
    price: 10,
    category: 'Cat',
    imageUrl: 'url',
    variants: [],
    priceTiers: []
  };

  const mockOrderItem: OrderItem = {
    id: 'item1',
    product: mockProduct,
    quantity: 2,
    basePrice: 10,
    price: 10,
    total: 20
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, FormsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.item.set(mockOrderItem);
    fixture.detectChanges();

    component = fixture.debugElement.children[0].componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate total correctly', () => {
    expect(component.total()).toBe(20);
  });

  describe('editing state', () => {
    it('should start editing a field', () => {
      component.startEditing('quantity');
      expect(component.isEditing('quantity')).toBe(true);
      expect(component.editingField()).toBe('quantity');
    });

    it('should stop editing', () => {
      component.startEditing('quantity');
      component.stopEditing();
      expect(component.isEditing('quantity')).toBe(false);
      expect(component.editingField()).toBeNull();
    });
  });

  describe('updateField', () => {
    beforeEach(() => {
      spyOn(component.updateQuantity, 'emit');
      spyOn(component.updatePrice, 'emit');
      spyOn(component.updateProductName, 'emit');
    });

    it('should emit updateQuantity for quantity field', () => {
      component.updateField('quantity', 3);
      expect(component.updateQuantity.emit).toHaveBeenCalledWith({ itemId: mockOrderItem.id, newQuantity: 3 });
    });

    it('should emit updatePrice for price field', () => {
      component.updateField('price', 15);
      expect(component.updatePrice.emit).toHaveBeenCalledWith({ itemId: mockOrderItem.id, newPrice: 15 });
    });

    it('should emit updateProductName for product.name field', () => {
      component.updateField('product.name', 'New Product Name');
      expect(component.updateProductName.emit).toHaveBeenCalledWith({ itemId: mockOrderItem.id, newName: 'New Product Name' });
    });

    it('should warn for unknown field', () => {
      const consoleWarnSpy = spyOn(console, 'warn');
      component.updateField('unknownField', 'value');
      expect(consoleWarnSpy).toHaveBeenCalledWith('Unknown field: unknownField');
    });
  });

  it('removeItem should emit the item to be removed', () => {
    spyOn(component.remove, 'emit');
    component.removeItem();
    expect(component.remove.emit).toHaveBeenCalledWith(mockOrderItem);
  });
});
