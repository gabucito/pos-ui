# Point of Sales (POS) Application Development Plan

This document outlines the development plan for the new Point of Sales (POS) application. It will serve as a checklist to track progress and ensure all requirements are met.

## Data Models

### Product

*   `id`: string (unique identifier)
*   `name`: string
*   `description`: string
*   `imageUrl`: string
*   `category`: string
*   `variants`: `ProductVariant[]`

### ProductVariant

*   `id`: string (unique identifier)
*   `name`: string (e.g., "Size", "Color")
*   `options`: `ProductVariantOption[]`

### ProductVariantOption

*   `id`: string (unique identifier)
*   `name`: string (e.g., "Small", "Medium", "Large")
*   `price`: number

### Customer

*   `id`: string (unique identifier)
*   `name`: string
*   `email`: string
*   `phone`: string

### Order

*   `id`: string (unique identifier)
*   `items`: `OrderItem[]`
*   `customer`: `Customer`
*   `subtotal`: number
*   `tax`: number
*   `total`: number
*   `status`: string (e.g., "pending", "completed", "canceled")

### OrderItem

*   `id`: string (unique identifier)
*   `product`: `Product`
*   `variant`: `ProductVariantOption`
*   `quantity`: number
*   `price`: number
*   `total`: number

## Application State

The application state will be managed using Angular signals. The following signals will be used to manage the application's state:

*   `products`: `Signal<Product[]>` - A signal that holds the list of all products.
*   `cart`: `Signal<Order>` - A signal that holds the current order.
*   `selectedCustomer`: `Signal<Customer>` - A signal that holds the selected customer.

## Phase 1: Core Components

### Product List/Grid View

*   **Status:** TODO
*   **Description:** A visually appealing grid or list of products that the cashier can select from. Each product will display its name, image, and price. The component should be searchable and filterable by category.
*   **Appearance:**
    *   Modern grid layout with responsive design for different screen sizes.
    *   High-quality product images.
    *   Clear and readable font for product information.
    *   A search bar at the top of the component.
    *   Filter options (e.g., dropdown, checkboxes) for categories.
    *   When a product with variants is selected, a modal should appear to allow the user to select the desired variant.
*   **Interaction:**
    *   Clicking on a product without variants should add it to the cart.
    *   Clicking on a product with variants should open the variant selection modal.
    *   The search bar should filter the product list in real-time.
    *   The category filters should update the product list.
*   **Events:**
    *   `productAdded`: Emits the `OrderItem` to be added to the cart.

### Shopping Cart/Table

*   **Status:** TODO
*   **Description:** A table that displays the products added to the current order. It should show the product name, quantity, price, and total for each item. The cashier should be able to update the quantity of each product and remove items from the cart.
*   **Appearance:**
    *   A clear and organized table layout.
    *   Each row represents a product in the cart.
    *   Columns for Product Name, Quantity, Price, and Total.
    *   Buttons or controls to increase/decrease quantity and remove items.
    *   A summary section at the bottom of the table showing the subtotal, tax, and total amount.
*   **Interaction:**
    *   The quantity of each item can be updated directly in the table.
    *   Clicking the remove button should remove the item from the cart.
*   **Events:**
    *   `cartUpdated`: Emits the updated `Order` object.

### Customer Form

*   **Status:** TODO
*   **Description:** A form to add or select a customer for the current order. The form should include fields for the customer's name, email, and phone number. It should also allow the cashier to search for existing customers.
*   **Appearance:**
    *   A simple and intuitive form layout.
    *   Clear labels for each input field.
    *   A search bar to find existing customers.
    *   Buttons to save a new customer or select an existing one.
*   **Interaction:**
    *   The search bar should filter the customer list in real-time.
    *   Clicking the save button should create a new customer and select it.
    *   Clicking on a customer from the search results should select that customer.
*   **Events:**
    *   `customerSelected`: Emits the selected `Customer` object.

### Payment/Checkout Modal

*   **Status:** TODO
*   **Description:** A modal that appears when the cashier is ready to process the payment. It should provide options for different payment methods (e.g., cash, credit card) and allow the cashier to enter the amount paid.
*   **Appearance:**
    *   A modal overlay that covers the main application content.
    *   Clear options for payment methods.
    *   An input field for the amount paid.
    *   A button to confirm the payment.
*   **Interaction:**
    *   The user can select a payment method.
    *   The user can enter the amount paid.
    *   Clicking the confirm button should process the payment.
*   **Events:**
    *   `paymentProcessed`: Emits the `Payment` object.

## Phase 2: Advanced Features

*   **Status:** TODO
*   **Description:** This phase will include more advanced features like order history, inventory management, and reporting.
