# Browser DevTools Guide for Feature Testing

This guide explains how to inspect the frontend login/register feature using browser developer tools.

## 1. Open Chrome DevTools and show the Network tab for this feature
1. Open your app in Chrome at the frontend URL (for example `http://localhost:5173`).
2. Press `F12` or `Ctrl+Shift+I` / `Cmd+Option+I` to open DevTools.
3. Click the `Network` tab.
4. Make sure the Network tab is clear, then reload the page if needed.
5. Optionally enable `Preserve log` so requests remain visible after navigation.

## 2. Trigger the feature and identify the API request in the Network tab
1. Navigate to the feature page in the app: `/login` or `/register`.
2. Fill the form fields and submit the form.
3. Watch the Network panel for new requests.
4. The feature request is the one sent when you submit the form; it usually appears as a `POST` request to `/api/auth/login` or `/api/auth/register`.

## 3. Show the Request URL, HTTP Method, Request Headers, Request Payload, and Response
1. In the Network panel, click the request that corresponds to the login/register action.
2. In the right-hand pane, select the `Headers` tab.
   - Check `Request URL` near the top.
   - Check `Request Method` just below the URL.
   - Review the `Request Headers` section for `Content-Type`, `Accept`, and any authorization headers.
3. Switch to the `Payload` or `Request` section to inspect the form data sent to the API.
4. Switch to the `Response` tab to review the JSON returned by the server.

## 4. Show the HTTP Status Code returned by the API
1. With the request selected, look at the top of the right-hand panel.
2. The status code is shown near the request line, for example `200 OK` or `401 Unauthorized`.
3. This confirms whether the backend accepted the request successfully.

## 5. Show how long the request took to complete
1. In the Network panel request list, find the `Time` or `Duration` column.
2. The value in this column shows how long the request took.
3. You can also view the detailed timing breakdown by selecting the request and opening the `Timing` tab.

## 6. Which request in the Network tab belongs to your feature?
For this authentication feature, the request belongs to the feature if it meets all of these:
- It is a `POST` request.
- The URL contains `/api/auth/login` or `/api/auth/register`.
- It is triggered when the user submits the login or registration form.
- The request payload includes form fields like `email`, `password`, and optionally `name`.

## Quick checklist
- Open DevTools → Network
- Clear log or enable `Preserve log`
- Trigger login/register submit
- Select the `POST /api/auth/...` request
- Inspect Headers, Payload, Response, Status, and Timing

## Notes
- If the request does not appear, confirm the backend is running and the frontend is proxying `/api` correctly.
- If the response is an error, use the Status Code and Response details to debug the API call.
