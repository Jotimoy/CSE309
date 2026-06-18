# Database Design

## Table: users
- `id` (INT, Primary Key, Auto Increment)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `password_hash` (VARCHAR)
- `role` (ENUM: 'staff', 'manager', 'owner')

## Table: inventory_items
- `id` (INT, Primary Key, Auto Increment)
- `sku` (VARCHAR, Unique)
- `item_name` (VARCHAR)
- `quantity` (INT)
- `threshold` (INT)
- `last_updated` (TIMESTAMP)

## Table: stock_movements
- `id` (INT, Primary Key, Auto Increment)
- `item_id` (INT, Foreign Key referencing inventory_items.id)
- `user_id` (INT, Foreign Key referencing users.id)
- `movement_type` (ENUM: 'IN', 'OUT')
- `quantity_changed` (INT)
- `created_at` (TIMESTAMP)