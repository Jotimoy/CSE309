# API Design

## Base URL
`/api/v1`

## Endpoints

### 1. `POST /auth/login`
- **Request**: JSON with `email` and `password`.
- **Response**: JWT token and user role.

### 2. `POST /inventory/ocr-scan`
- **Request**: Multipart form-data containing an image file.
- **Response**: JSON with extracted text (e.g., `{ "sku": "A123", "quantity": 10 }`).

### 3. `GET /inventory`
- **Request**: (Optional query params for pagination/filtering).
- **Response**: JSON array of all inventory items and current stock levels.