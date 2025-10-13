import { Product } from './models/product';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Apple',
    description: 'A delicious red apple',
    price: 0.5,
    imageUrl: 'https://via.placeholder.com/150',
    category: 'Fruits',
    priceTiers: [
      { quantity: 6, price: 0.4 }, // Wholesale price for 6 or more
      { quantity: 12, price: 0.35 }, // Even better price for 12 or more
    ],
    variants: [
      {
        id: '1',
        name: 'Size',
        options: [
          {
            id: '1',
            name: 'Small',
          },
          {
            id: '2',
            name: 'Medium',
            price: 0.75,
            priceTiers: [
              { quantity: 6, price: 0.6 }, // Wholesale price for 6 or more
              { quantity: 12, price: 0.45 }, // Even better price for 12 or more
            ],
          },
          {
            id: '3',
            name: 'Large',
            price: 1,
          },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Banana',
    description: 'A ripe yellow banana',
    price: 0.25,
    imageUrl: 'https://via.placeholder.com/150',
    category: 'Fruits',
    variants: [],
  },
  {
    id: '3',
    name: 'Carrot',
    description: 'A fresh orange carrot',
    price: 0.15,
    imageUrl: 'https://via.placeholder.com/150',
    category: 'Vegetables',
    variants: [],
  },
];

export const PRODUCTSDTO: any[] = [
  {
    id: '3c85cdd5-c34d-48c5-a6f7-7751220f64bf',
    name: 'Tokki Premium Ceremonial Matcha',
    price: {
      minor_units: 2599,
      currency: 'USD',
    },
    pricing_tiers: [
      {
        Volume: {
          min_quantity: 3,
          max_quantity: 5,
          price: {
            minor_units: 2399,
            currency: 'USD',
          },
          location_id: null,
        },
      },
      {
        Volume: {
          min_quantity: 6,
          max_quantity: 99,
          price: {
            minor_units: 2199,
            currency: 'USD',
          },
          location_id: null,
        },
      },
    ],
    variants: [
      {
        id: '40c71e1c-7c3b-4e10-9f4b-7d3aae1a5a12',
        name: '60g tin',
        price: null,
        pricing_tiers: [
          {
            Volume: {
              min_quantity: 6,
              max_quantity: 12,
              price: {
                minor_units: 2299,
                currency: 'USD',
              },
              location_id: null,
            },
          },
        ],
      },
      {
        id: 'a5404649-7e94-4b55-9a7f-5f1bb0b60d6c',
        name: '250g pouch',
        price: {
          minor_units: 4899,
          currency: 'USD',
        },
        pricing_tiers: [
          {
            Volume: {
              min_quantity: 4,
              max_quantity: 8,
              price: {
                minor_units: 4599,
                currency: 'USD',
              },
              location_id: null,
            },
          },
          {
            Promotional: {
              start_date: '2024-05-01T00:00:00Z',
              end_date: '2024-05-31T23:59:59Z',
              price: {
                minor_units: 4399,
                currency: 'USD',
              },
              location_id: '9d4b7c68-1d3b-4c8d-92f5-f6e9ae02a5be',
            },
          },
        ],
      },
    ],
  },
];
