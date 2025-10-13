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
            { quantity: 12, price: 0.35 } // Even better price for 12 or more
        ],
        variants: [
            {
                id: '1',
                name: 'Size',
                options: [
                    {
                        id: '1',
                        name: 'Small',
                        price: 0.5,
                        priceTiers: [
                            { quantity: 10, price: 0.45 }
                        ]
                    },
                    {
                        id: '2',
                        name: 'Medium',
                        price: 0.75
                    },
                    {
                        id: '3',
                        name: 'Large',
                        price: 1
                    }
                ]
            }
        ]
    },
    {
        id: '2',
        name: 'Banana',
        description: 'A ripe yellow banana',
        price: 0.25,
        imageUrl: 'https://via.placeholder.com/150',
        category: 'Fruits',
        variants: []
    },
    {
        id: '3',
        name: 'Carrot',
        description: 'A fresh orange carrot',
        price: 0.15,
        imageUrl: 'https://via.placeholder.com/150',
        category: 'Vegetables',
        variants: []
    }
];
