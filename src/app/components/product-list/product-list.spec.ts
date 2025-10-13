import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductList } from './product-list';
import { PRODUCTS } from '../../mock-data';
import { Product } from '../../models/product';
import * as uuid from 'uuid';
import { PosService } from '../../services/pos.service';

describe('ProductList', () => {
  let component: ProductList;
  let fixture: ComponentFixture<ProductList>;
  let posService: PosService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductList],
      providers: [
        { 
          provide: PosService, 
          useValue: { addProductToCart: jasmine.createSpy('addProductToCart') } 
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductList);
    component = fixture.componentInstance;
    posService = TestBed.inject(PosService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with all products', () => {
    expect(component.products()).toEqual(PRODUCTS);
  });

  it('should initialize searchTerm and selectedCategory as empty', () => {
    expect(component.searchTerm()).toBe('');
    expect(component.selectedCategory()).toBe('');
  });

  it('should compute unique categories including \'All Categories\'', () => {
    const expectedCategories = ['All Categories', ...new Set(PRODUCTS.map(p => p.category))];
    expect(component.categories()).toEqual(expectedCategories);
  });

  describe('onSearch', () => {
    it('should update searchTerm signal', () => {
      const event = { target: { value: 'test' } } as unknown as Event;
      component.onSearch(event);
      expect(component.searchTerm()).toBe('test');
    });

    it('should filter products by search term', () => {
      const event = { target: { value: 'Laptop' } } as unknown as Event;
      component.onSearch(event);
      expect(component.filteredProducts().length).toBe(1);
      expect(component.filteredProducts()[0].name).toBe('Laptop');
    });
  });

  describe('onSelectCategory', () => {
    it('should update selectedCategory signal', () => {
      const event = { target: { value: 'Electronics' } } as unknown as Event;
      component.onSelectCategory(event);
      expect(component.selectedCategory()).toBe('Electronics');
    });

    it('should filter products by category', () => {
      const event = { target: { value: 'Electronics' } } as unknown as Event;
      component.onSelectCategory(event);
      expect(component.filteredProducts().length).toBe(2);
      expect(component.filteredProducts().every(p => p.category === 'Electronics')).toBe(true);
    });

    it('should show all products when \'All Categories\' is selected', () => {
      const event = { target: { value: 'All Categories' } } as unknown as Event;
      component.onSelectCategory(event);
      expect(component.filteredProducts().length).toBe(PRODUCTS.length);
    });
  });

  describe('addProductToCart', () => {
    it('should call posService.addProductToCart with the product', () => {
      const product: Product = PRODUCTS[0];
      component.addProductToCart(product);
      expect(posService.addProductToCart).toHaveBeenCalledWith(product);
    });
  });
});
