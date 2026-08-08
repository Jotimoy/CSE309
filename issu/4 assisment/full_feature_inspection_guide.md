# Full Feature Inspection Guide

This guide documents the full inspection workflow for the React frontend feature, backend FastAPI flow, API behavior, and how to validate the feature using browser tools.

## React Developer Tools

### 1. Open React Developer Tools
- Open your app in Chrome: `http://localhost:5173`
- Press `F12` or `Cmd+Option+I` to open DevTools
- Click the `Components` tab inside React Developer Tools

### 2. Show me the component hierarchy for your feature
The login/register auth feature uses this hierarchy:
- `App`
  - `Layout`
    - `Routes`
      - `LoginPage` or `RegisterPage`
        - `form`
          - `input` fields for email/password/name
          - `button` submit
  - `RequireAuth` wraps `TasksPage` for protected routing

React Developer Tools will show this tree under the `Components` tab.

## React Profiler

### 1. Open the React Profiler
- In DevTools, click the `Profiler` tab.

### 2. Start recording a profiling session
- Click `Start profiling`

### 3. Use your feature and stop the recording
- Submit the login or register form
- Click `Stop profiling`

This captures render timing and component update information for the auth feature.

## Backend (FastAPI MVC)

### 1. Explain the complete request flow from React to the database and back to React.
1. User submits the login or register form in the browser.
2. `LoginPage` or `RegisterPage` calls `auth.login(...)` or `auth.register(...)`.
3. `AuthContext` invokes `loginUser(...)` or `registerUser(...)` from `frontend/src/services/api.ts`.
4. The frontend sends a `fetch` request to `/api/auth/login` or `/api/auth/register`.
5. Vite proxy forwards `/api` to the backend at `http://127.0.0.1:8000`.
6. FastAPI receives the request via the `auth_router` router.
7. The router calls the corresponding controller function: `login()` or `register()`.
8. The controller calls service methods in `app/services/auth_service.py`.
9. The service performs database access through `app/services/database.py`.
10. The service returns the user object and/or token.
11. FastAPI returns a JSON response to the frontend.
12. The frontend stores auth state in `AuthContext` and navigates accordingly.

### 2. Which router receives the request?
- Requests go to `backend/app/routers/auth_router.py`.
- The router prefix is `/auth`, so login uses `/auth/login` and registration uses `/auth/register`.

### 3. Which controller function is executed?
- `login()` for login requests.
- `register()` for registration requests.
- `current_user()` for `GET /auth/me` requests.

### 4. Which service method is called?
- `login()` calls `authenticate_user(...)` and `create_auth_token(...)`.
- `register()` calls `get_user_by_email(...)`, `create_user(...)`, and `create_auth_token(...)`.

### 5. Which repository method is called?
- In this structure, repository-style functions are in `backend/app/services/auth_service.py` and `backend/app/services/database.py`.
- Data access functions include `get_connection()`, `create_user(...)`, `get_user_by_email(...)`, and `get_user_by_token(...)`.

### 6. Where is the business logic implemented?
- Business logic lives in `backend/app/routers/auth_router.py` and `backend/app/services/auth_service.py`.
- The router handles request validation and HTTP response errors.
- The service enforces auth rules, password verification, and token creation.

### 7. Where is the database access implemented?
- Database access is implemented in `backend/app/services/database.py`.
- The auth service also uses SQL queries directly via SQLite connection in `auth_service.py`.

### 8. Why did you separate the Router, Controller, Service, and Repository layers?
- Separation improves maintainability and testability.
- Routers map HTTP requests to controller logic.
- Controllers validate request data and return HTTP responses.
- Services contain business rules and orchestrate operations.
- Repository/database layers handle raw SQL and persistence.
- This keeps each layer focused and easier to modify later.

### 9. Show me the complete backend flow in your code.
- Router file: `backend/app/routers/auth_router.py`
- Service file: `backend/app/services/auth_service.py`
- Database file: `backend/app/services/database.py`
- Models file: `backend/app/models/user.py`

The flow is:
- `POST /auth/register` → `register()` → `get_user_by_email()` → `create_user()` → `create_auth_token()`
- `POST /auth/login` → `login()` → `authenticate_user()` → `create_auth_token()`
- `GET /auth/me` → `current_user()` → `_get_current_user()` → `get_user_by_token()`

## API

### 1. What is the endpoint for this feature?
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me` for current user info

### 2. Why did you choose this HTTP method?
- `POST` is used for login and register because they create or validate credentials and send a payload.
- `GET` is used for `/auth/me` to read the authenticated user information.

### 3. What request body does this endpoint accept?
- `/auth/register` accepts:
  - `name` (string)
  - `email` (string)
  - `password` (string)
- `/auth/login` accepts:
  - `email` (string)
  - `password` (string)

### 4. What response does it return?
- Both endpoints return an `AuthResponse` JSON object:
  - `token` (string)
  - `user` object with `id`, `name`, `email`, `role`, `created_at`

### 5. Which HTTP status codes can this endpoint return?
- `201 Created` for successful registration
- `200 OK` for successful login
- `400 Bad Request` if an email is already registered
- `401 Unauthorized` if login fails or auth token is invalid
- `500 Internal Server Error` if unexpected backend errors occur

## cURL & Postman

### 1. Copy the cURL command from Chrome DevTools and explain it.
Example cURL for login:
```bash
curl 'http://localhost:5173/api/auth/login' \
  -H 'Content-Type: application/json' \
  --data-raw '{"email":"user@example.com","password":"password123"}'
```
- `curl` sends the HTTP request
- `-H 'Content-Type: application/json'` sets the request header
- `--data-raw` contains JSON payload

### 2. Execute the same request using Postman.
- Open Postman
- Create a new `POST` request
- Set URL to `http://localhost:5173/api/auth/login`
- Set body type to `raw` and `JSON`
- Paste the same JSON payload
- Send request

### 3. Show me the request body in Postman.
- Request body is JSON with `email` and `password`.

### 4. Show me the response returned by the backend.
- Response is JSON containing `token` and `user` fields.

### 5. Modify one value in the request and execute it again.
- Change `email` or `password` and resubmit.

### 6. What happens if required data is missing?
- The frontend form validation prevents submission if required fields are empty.
- If the backend receives missing fields, FastAPI would return a `422 Unprocessable Entity` by default.

### 7. What happens if invalid data is sent?
- If credentials are incorrect, login returns `401 Unauthorized` with detail `Invalid email or password`.
- If email is already registered during registration, it returns `400 Bad Request`.

## Database (Optional)

### 1. Which database tables are involved?
- `users`
- `auth_tokens`

### 2. Explain the database schema related to your feature.
- `users` has columns: `id`, `name`, `email`, `password_hash`, `salt`, `role`, `created_at`
- `auth_tokens` has columns: `id`, `user_id`, `token`, `created_at`

### 3. Which model represents this table?
- The database table is represented by `backend/app/models/user.py` Pydantic models for request/response validation.

### 4. What CRUD operation is performed?
- Create user in `create_user(...)`
- Read user by email in `get_user_by_email(...)`
- Read user by token in `get_user_by_token(...)`
- Create auth token in `create_auth_token(...)`

### 5. How is the data saved to the database?
- The code uses SQLite with `sqlite3.connect(...)`.
- SQL `INSERT` statements persist users and auth tokens.

### 6. What happens if the requested record does not exist?
- `get_user_by_email(...)` returns `None` if the user is not found.
- `authenticate_user(...)` returns `None` and the router returns `401 Unauthorized`.

## Code Understanding

### 1. Explain this function line by line.
- Use the function definition and a short explanation for each step. [Example below]

### 2. Why did you write this function?
- To implement a single piece of business logic, keep code reusable, and isolate responsibilities.

### 3. Explain this API call.
- `fetch(...)` sends JSON to the backend and handles response parsing.

### 4. Explain this database query (if applicable).
- `SELECT * FROM users WHERE email = ?` looks up the user by email.

### 5. Why did you choose this implementation?
- It is simple, readable, and matches the existing project scaffold.

### 6. If you had more time, what improvements would you make?
- Add proper migrations instead of raw SQLite table creation.
- Use JWT tokens instead of ad-hoc auth token table.
- Add better error handling and response logging.
- Move auth and persistence into separate repository classes.
- Add unit and integration tests for API and frontend.
