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
- [x] Define user database model.
- [x] Configure database connection.
- [x] Add persistence logic for user creation.
- [x] Add user lookup queries for authentication.
- [x] Ensure secure password storage and retrieval.

## Status
The user database model and integration are implemented using SQLite with a dedicated `database.py` service. User creation, lookup, and secure password hashing are fully supported by the backend auth flow.
