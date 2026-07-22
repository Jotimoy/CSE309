# Database Task

## Goal
Define database models and integrate them with the backend for user authentication and persistence.

## Details
- Create a user model with fields like id, username, email, password_hash, created_at, and role.
- Integrate a database engine and ORM or query layer with FastAPI.
- Add migration support or initial schema creation for the user table.
- Ensure the backend stores hashed passwords, not plaintext.
- Support user lookup by email or username during login.

## Tasks
- [ ] Define user database model.
- [ ] Configure database connection.
- [ ] Add persistence logic for user creation.
- [ ] Add user lookup queries for authentication.
- [ ] Ensure secure password storage and retrieval.
