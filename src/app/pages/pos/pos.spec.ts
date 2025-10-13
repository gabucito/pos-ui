import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Pos } from './pos';
import { OrderItem } from '../../models/order';
import { Customer } from '../../models/customer';
import { Product, ProductVariantOption } from '../../models/product';
import { PRODUCTS } from '../../mock-data';
import * as uuid from 'uuid';
import * as pricingUtils from '../../utils/pricing.utils';

describe('Pos', () => {
  let component: Pos;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pos],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    const fixture = TestBed.createComponent(Pos);
    component = fixture.componentInstance;
  });

  it('should create the pos', () => {
    expect(component).toBeTruthy();
  });

  it('should have a title of \'pos-ui\'', () => {
    expect(component.title()).toEqual('pos-ui');
  });

  describe('onProductAdded', () => {
    it('should add a new product to the cart if it does not exist', () => {
      const product = PRODUCTS[0];
      const orderItem: OrderItem = {
        id: '1',
        product: product,
        quantity: 1,
        basePrice: product.price,
        price: product.price,
        total: product.price
      };
      component.onProductAdded(orderItem);
      expect(component.cartItems()).toEqual([orderItem]);
    });

    it('should increment quantity and update total if product (and variant) already exists', () => {
      const product = PRODUCTS[0];
      const initialOrderItem: OrderItem = {
        id: '1',
        product: product,
        quantity: 1,
        basePrice: product.price,
        price: product.price,
        total: product.price
      };
      component.cartItems.set([initialOrderItem]);

      const newItem: OrderItem = {
        id: '1',
        product: product,
        quantity: 1,
        basePrice: product.price,
        price: product.price,
        total: product.price
      };
      component.onProductAdded(newItem);

      expect(component.cartItems().length).toBe(1);
      expect(component.cartItems()[0].quantity).toBe(2);
      expect(component.cartItems()[0].total).toBe(product.price * 2);
    });

    it('should handle variants correctly when adding existing products', () => {
      const product = PRODUCTS[0];
      const variant1 = product.variants[0].options[0]; // Small
      const variant2 = product.variants[0].options[1]; // Medium

      const item1: OrderItem = {
        id: '1',
        product: product,
        variant: variant1,
        quantity: 1,
        basePrice: variant1.price!,
        price: variant1.price!,
        total: variant1.price!
      };
      const item2: OrderItem = {
        id: '2',
        product: product,
        variant: variant2,
        quantity: 1,
        basePrice: variant2.price!,
        price: variant2.price!,
        total: variant2.price!
      };

      component.cartItems.set([item1]);
      component.onProductAdded(item2); // Add a different variant of the same product
      expect(component.cartItems().length).toBe(2);

      const item1Again: OrderItem = {
        id: '1',
        product: product,
        variant: variant1,
        quantity: 1,
        basePrice: variant1.price!,
        price: variant1.price!,
        total: variant1.price!
      };
      component.onProductAdded(item1Again); // Add the first variant again
      expect(component.cartItems().length).toBe(2);
      expect(component.cartItems()[0].quantity).toBe(2);
      expect(component.cartItems()[0].total).toBe(variant1.price! * 2);
    });
  });

  describe('onCartUpdated', () => {
    it('should update the cartItems signal with the new array', () => {
      const product = PRODUCTS[0];
      const newCart: OrderItem[] = [{
        id: '1',
        product: product,
        quantity: 5,
        basePrice: product.price,
        price: product.price,
        total: product.price * 5
      }];
      component.onCartUpdated(newCart);
      expect(component.cartItems()).toEqual(newCart);
    });
  });

  describe('onCustomerSelected', () => {
    it('should update the selectedCustomer signal', () => {
      const customer: Customer = { id: '1', name: 'John Doe', email: 'john@example.com', phone: '123-456-7890' };
      component.onCustomerSelected(customer);
      expect(component.selectedCustomer()).toEqual(customer);
    });
  });

  describe('onOpenVariantModal', () => {
    it('should set isVariantModalOpen to true and selectedProductForVariant to the passed product', () => {
      const product = PRODUCTS[0];
      component.onOpenVariantModal(product);
      expect(component.isVariantModalOpen()).toBe(true);
      expect(component.selectedProductForVariant()).toEqual(product);
    });
  });

  describe('onCloseVariantModal', () => {
    it('should set isVariantModalOpen to false and selectedProductForVariant to null', () => {
      component.isVariantModalOpen.set(true);
      component.selectedProductForVariant.set(PRODUCTS[0]);
      component.onCloseVariantModal();
      expect(component.isVariantModalOpen()).toBe(false);
      expect(component.selectedProductForVariant()).toBeNull();
    });
  });

  describe('onVariantSelected', () => {
    beforeEach(() => {
      spyOn(uuid, 'v7' as any).and.returnValue('mock-uuid');
      spyOn(pricingUtils, 'getTieredPrice').and.returnValue(10); // Mock a fixed price
      spyOn(component, 'onProductAdded');
      spyOn(component, 'onCloseVariantModal');
    });

    it('should add a new order item with the selected variant and close the modal', () => {
      const product = PRODUCTS[0];
      const variant = product.variants[0].options[0]; // Small variant
      component.selectedProductForVariant.set(product);

      component.onVariantSelected(variant);

      expect(pricingUtils.getTieredPrice).toHaveBeenCalledWith(variant.price, 1, variant.priceTiers);
      expect(component.onProductAdded).toHaveBeenCalledWith(jasmine.objectContaining({
        id: 'mock-uuid',
        product: product,
        variant: variant,
        quantity: 1,
        basePrice: variant.price,
        price: 10,
        total: 10
      }));
      expect(component.onCloseVariantModal).toHaveBeenCalled();
    });

    it('should not add an item if no product is selected for variant', () => {
      component.selectedProductForVariant.set(null);
      const variant = PRODUCTS[0].variants[0].options[0];
      component.onVariantSelected(variant);
      expect(component.onProductAdded).not.toHaveBeenCalled();
      expect(component.onCloseVariantModal).toHaveBeenCalled();
    });
  });
});
