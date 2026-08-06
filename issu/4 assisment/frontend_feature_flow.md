# React Frontend Feature Flow

This document explains the React frontend feature implementation for authentication and routing.

## 1. Which React component contains this feature?
The main feature is contained in `frontend/src/pages/LoginPage.tsx` and `frontend/src/pages/RegisterPage.tsx`.

## 2. Explain the component hierarchy for this feature.
- `frontend/src/main.tsx`
  - wraps the app with `<AuthProvider>`
  - renders `<App />`
- `frontend/src/App.tsx`
  - contains `<BrowserRouter>` and `<Routes>`
  - routes include `<LoginPage />`, `<RegisterPage />`, and `<TasksPage />`
  - `<TasksPage />` is wrapped with `<RequireAuth />` for protection
- `frontend/src/components/Layout.tsx`
  - renders the top navigation and page wrapper
- `frontend/src/pages/LoginPage.tsx`
  - login form and handler
- `frontend/src/pages/RegisterPage.tsx`
  - registration form and handler
- `frontend/src/context/AuthContext.tsx`
  - shared auth state and login/register functions

## 3. Which function is executed when the user interacts with this feature?
- In `LoginPage.tsx`, the `handleSubmit` function runs when the user submits the login form.
- In `RegisterPage.tsx`, the `handleSubmit` function runs when the user submits the registration form.

## 4. Walk me through the frontend flow from the user action until the API request is sent.
1. The user opens `/login` or `/register`.
2. The user fills out the form fields and clicks the submit button.
3. The page calls the local `handleSubmit` function.
4. The form handler performs validation checks.
5. If validation passes, the handler calls the auth context method:
   - `auth.login({ email, password })` in `LoginPage`
   - `auth.register({ name, email, password })` in `RegisterPage`
6. `AuthContext` calls the API service function:
   - `loginUser` or `registerUser` in `frontend/src/services/api.ts`
7. The service sends a `fetch` request to the backend endpoint:
   - `POST /api/auth/login`
   - `POST /api/auth/register`
8. The response is returned to the context and stored in state.

## 5. Which React hooks did you use and why?
- `useState`
  - to track form values, loading state, and validation errors in each page.
- `useNavigate`
  - to redirect users after successful login or registration.
- `useLocation`
  - to preserve the page the user originally tried to visit before login.
- `useMemo`
  - to memoize the `AuthContext` value and avoid unnecessary re-renders.
- `useContext`
  - to consume the auth context from multiple components.
- `useEffect`
  - in `AuthContext` to persist auth state to `localStorage` when it changes.

## 6. How is state managed for this feature?
- Form state is managed locally inside `LoginPage` and `RegisterPage` using `useState`.
- Authentication state is managed globally in `AuthContext` using `useState` and `localStorage`.
- The auth state object contains `token`, `user`, and `isAuthenticated`.
- `AuthContext` exposes `login`, `register`, and `logout` helpers for use by pages.

## 7. How do you validate user input?
- Each form handler checks required fields before sending an API request.
- The register form verifies that `password` and `confirmPassword` match.
- The register form also checks password length for a minimum of 8 characters.
- If validation fails, an error message is set in component state and displayed.

## 8. How do you handle loading states?
- Each page uses `isLoading` state managed by `useState`.
- The submit button is disabled while `isLoading` is `true`.
- The button label changes to show progress (`Signing in...` or `Creating account...`).
- `isLoading` is reset to `false` after the API call completes or fails.
