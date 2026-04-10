-- Swift Flow POS System - Seed Data
-- This script populates initial data for demo/testing

-- Delete existing data (for re-seeding)
DELETE FROM stock_alerts;
DELETE FROM inventory_logs;
DELETE FROM transaction_items;
DELETE FROM transactions;
DELETE FROM inventory;
DELETE FROM products;
DELETE FROM users;

-- Seed Users
INSERT INTO users (name, email, role) VALUES
  ('John Cashier', 'john@swiftflow.local', 'cashier'),
  ('Sarah Cashier', 'sarah@swiftflow.local', 'cashier'),
  ('Admin User', 'admin@swiftflow.local', 'admin'),
  ('Manager User', 'manager@swiftflow.local', 'manager');

-- Seed Products (Restaurant Menu Items)
INSERT INTO products (name, category, price, cost, description, sku, active) VALUES
  ('Margherita Pizza', 'Main', 12.99, 4.50, 'Classic pizza with tomato, mozzarella, and basil', 'PIZZA-001', true),
  ('Caesar Salad', 'Appetizer', 8.99, 2.50, 'Fresh romaine with house-made Caesar dressing', 'SALAD-001', true),
  ('Grilled Salmon', 'Main', 18.99, 7.00, 'Atlantic salmon with seasonal vegetables', 'FISH-001', true),
  ('Ribeye Steak', 'Main', 24.99, 9.00, '12oz prime cut with garlic butter', 'STEAK-001', true),
  ('Chocolate Cake', 'Dessert', 7.99, 2.00, 'Rich chocolate cake with ganache', 'CAKE-001', true),
  ('Iced Tea', 'Beverage', 2.99, 0.50, 'Freshly brewed iced tea', 'TEA-001', true),
  ('Espresso', 'Beverage', 3.49, 0.75, 'Double shot espresso', 'COFFEE-001', true),
  ('Chicken Parmesan', 'Main', 16.99, 5.50, 'Breaded chicken with marinara and cheese', 'CHICKEN-001', true),
  ('Garlic Bread', 'Appetizer', 4.99, 1.50, 'Toasted bread with garlic butter', 'BREAD-001', true),
  ('Tiramisu', 'Dessert', 6.99, 1.80, 'Classic Italian dessert with mascarpone', 'TIRAMISU-001', true),
  ('Carbonara Pasta', 'Main', 14.99, 4.00, 'Pasta with bacon, egg, and Pecorino Romano', 'PASTA-001', true),
  ('House Wine', 'Beverage', 6.99, 2.00, 'Red or white wine by the glass', 'WINE-001', true);

-- Seed Inventory (stock levels)
INSERT INTO inventory (product_id, quantity_on_hand, reorder_level, last_restocked_at) VALUES
  (1, 45, 10, CURRENT_TIMESTAMP),
  (2, 32, 15, CURRENT_TIMESTAMP),
  (3, 18, 8, CURRENT_TIMESTAMP),
  (4, 12, 5, CURRENT_TIMESTAMP),
  (5, 25, 10, CURRENT_TIMESTAMP),
  (6, 50, 20, CURRENT_TIMESTAMP),
  (7, 60, 25, CURRENT_TIMESTAMP),
  (8, 20, 8, CURRENT_TIMESTAMP),
  (9, 40, 15, CURRENT_TIMESTAMP),
  (10, 15, 8, CURRENT_TIMESTAMP),
  (11, 28, 10, CURRENT_TIMESTAMP),
  (12, 35, 15, CURRENT_TIMESTAMP);

-- Seed some sample transactions (optional - for demo analytics)
INSERT INTO transactions (transaction_id, cashier_user_id, subtotal, tax, total, payment_method, status) VALUES
  ('ORD-20240115-0001', 1, 45.97, 3.68, 49.65, 'cash', 'completed'),
  ('ORD-20240115-0002', 2, 32.98, 2.64, 35.62, 'card', 'completed'),
  ('ORD-20240115-0003', 1, 59.97, 4.80, 64.77, 'cash', 'completed');

-- Seed transaction items
INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price, line_total) VALUES
  (1, 1, 2, 12.99, 25.98),  -- 2x Margherita Pizza
  (1, 7, 1, 3.49, 3.49),    -- 1x Espresso
  (1, 5, 1, 7.99, 7.99),    -- 1x Chocolate Cake
  (2, 2, 2, 8.99, 17.98),   -- 2x Caesar Salad
  (2, 12, 1, 6.99, 6.99),   -- 1x House Wine
  (3, 3, 2, 18.99, 37.98),  -- 2x Grilled Salmon
  (3, 4, 1, 24.99, 24.99);  -- 1x Ribeye Steak

-- Seed inventory logs
INSERT INTO inventory_logs (product_id, type, quantity_change, reference_id, notes) VALUES
  (1, 'sale', -2, 'ORD-20240115-0001', 'Sold via transaction'),
  (7, 'sale', -1, 'ORD-20240115-0001', 'Sold via transaction'),
  (5, 'sale', -1, 'ORD-20240115-0001', 'Sold via transaction'),
  (2, 'sale', -2, 'ORD-20240115-0002', 'Sold via transaction'),
  (12, 'sale', -1, 'ORD-20240115-0002', 'Sold via transaction'),
  (3, 'sale', -2, 'ORD-20240115-0003', 'Sold via transaction'),
  (4, 'sale', -1, 'ORD-20240115-0003', 'Sold via transaction');

-- Create an alert for a low stock item (for demo)
INSERT INTO stock_alerts (product_id, alert_type, status) VALUES
  (4, 'low_stock', 'active'); -- Ribeye is at 12, reorder level is 5, so it's low
