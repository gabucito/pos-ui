import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShoppingCart } from './shopping-cart';
import { OrderItem } from '../../models/order';
import { Product, PriceTier } from '../../models/product';
import * as pricingUtils from '../../utils/pricing.utils';
import { Component, signal, WritableSignal } from '@angular/core';

// Host component to provide input to ShoppingCart
@Component({
  template: '<app-shopping-cart [items]="items()"></app-shopping-cart>',
  standalone: true,
  imports: [ShoppingCart]
})
class TestHostComponent {
  items: WritableSignal<OrderItem[]> = signal([]);
}

describe('ShoppingCart', () => {
  let hostComponent: TestHostComponent;
  let component: ShoppingCart;
  let fixture: ComponentFixture<TestHostComponent>;

  const mockProduct1: Product = {
    id: 'prod1',
    name: 'Product 1',
    description: 'Desc 1',
    price: 10,
    category: 'Cat 1',
    imageUrl: 'url1',
    variants: [],
    priceTiers: []
  };

  const mockProduct2: Product = {
    id: 'prod2',
    name: 'Product 2',
    description: 'Desc 2',
    price: 20,
    category: 'Cat 2',
    imageUrl: 'url2',
    variants: [],
    priceTiers: []
  };

  const mockOrderItem1: OrderItem = {
    id: 'item1',
    product: mockProduct1,
    quantity: 1,
    basePrice: 10,
    price: 10,
    total: 10
  };

  const mockOrderItem2: OrderItem = {
    id: 'item2',
    product: mockProduct2,
    quantity: 2,
    basePrice: 20,
    price: 20,
    total: 40
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    // Set initial input for the ShoppingCart component
    hostComponent.items.set([mockOrderItem1, mockOrderItem2]);
    fixture.detectChanges();

    // Get the instance of the ShoppingCart component from the host component
    component = fixture.debugElement.children[0].componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate subtotal correctly', () => {
    expect(component.subtotal()).toBe(50); // 10 + 40
  });

  it('should calculate tax correctly (19% of subtotal)', () => {
    expect(component.tax()).toBeCloseTo(50 * 0.19); // 9.5
  });

  it('should calculate total correctly', () => {
    expect(component.total()).toBeCloseTo(50 + (50 * 0.19)); // 59.5
  });

  describe('processedItems', () => {
    beforeEach(() => {
      spyOn(pricingUtils, 'getTieredPrice').and.callFake((basePrice: number, quantity: number, priceTiers: PriceTier[] | undefined) => {
        if (basePrice === 10 && quantity === 1) return 10; // For mockOrderItem1
        if (basePrice === 20 && quantity === 2) return 18; // For mockOrderItem2, assume a tier discount
        return basePrice;
      });
    });

    it('should apply tiered pricing to items without price override', () => {
      const processed = component.processedItems();
      expect(processed.length).toBe(2);
      expect(processed[0].price).toBe(10);
      expect(processed[0].total).toBe(10);
      expect(processed[1].price).toBe(18);
      expect(processed[1].total).toBe(36); // 2 * 18
    });

    it('should respect price overrides', () => {
      const overriddenItem: OrderItem = {
        ...mockOrderItem1,
        price: 15,
        total: 15,
        priceOverridden: true
      };
      hostComponent.items.set([overriddenItem, mockOrderItem2]);
      fixture.detectChanges();

      const processed = component.processedItems();
      expect(processed[0].price).toBe(15);
      expect(processed[0].total).toBe(15);
      expect(processed[1].price).toBe(18);
      expect(processed[1].total).toBe(36);
    });

    it('should recalculate tiered price when quantity changes and override is false', () => {
      const itemWithQuantityChange: OrderItem = {
        ...mockOrderItem1,
        quantity: 2,
        priceOverridden: false
      };
      hostComponent.items.set([itemWithQuantityChange]);
      fixture.detectChanges();

      // Mock getTieredPrice for this specific scenario
      spyOn(pricingUtils, 'getTieredPrice').and.returnValue(9); // New tiered price for 2 units of product 1

      const processed = component.processedItems();
      expect(processed[0].price).toBe(9);
      expect(processed[0].total).toBe(18); // 2 * 9
    });
  });

  describe('event handlers', () => {
    beforeEach(() => {
      spyOn(component.updateItems, 'emit');
    });

    it('handleUpdateQuantity should update quantity and clear price override', () => {
      const updatedQuantity = 5;
      component.handleUpdateQuantity({ itemId: mockOrderItem1.id, newQuantity: updatedQuantity });

      const expectedItems = [
        { ...mockOrderItem1, quantity: updatedQuantity, priceOverridden: false },
        mockOrderItem2
      ];
      expect(component.updateItems.emit).toHaveBeenCalledWith(expectedItems);
    });

    it('handleUpdatePrice should update price and set price override', () => {
      const updatedPrice = 15;
      component.handleUpdatePrice({ itemId: mockOrderItem1.id, newPrice: updatedPrice });

      const expectedItems = [
        { ...mockOrderItem1, price: updatedPrice, priceOverridden: true },
        mockOrderItem2
      ];
      expect(component.updateItems.emit).toHaveBeenCalledWith(expectedItems);
    });

    it('handleUpdateProductName should update product name', () => {
      const updatedName = 'Updated Product 1';
      component.handleUpdateProductName({ itemId: mockOrderItem1.id, newName: updatedName });

      const expectedItems = [
        { ...mockOrderItem1, product: { ...mockProduct1, name: updatedName } },
        mockOrderItem2
      ];
      expect(component.updateItems.emit).toHaveBeenCalledWith(expectedItems);
    });

    it('handleRemove should remove the item', () => {
      component.handleRemove(mockOrderItem1);

      const expectedItems = [mockOrderItem2];
      expect(component.updateItems.emit).toHaveBeenCalledWith(expectedItems);
    });
  });
});
