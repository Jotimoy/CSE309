# Entity Relationship Diagram (ERD)

## Entities and Attributes

- **Users**: `user_id` (PK), `username`, `password_hash`, `role`
- **Products**: `product_id` (PK), `sku`, `name`, `description`, `stock_quantity`, `min_threshold`
- **Transactions**: `transaction_id` (PK), `product_id` (FK), `user_id` (FK), `type` (IN/OUT), `quantity`, `timestamp`

## Relationships

- **Users to Transactions**: One-to-Many (One user can process many transactions).
- **Products to Transactions**: One-to-Many (One product can have many transactions).

*(Note: In a formal graphical ERD, these would be represented as boxes connected by crow's foot notation.)*