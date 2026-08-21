# Error Handling Guidelines

## Purpose

This document defines how errors should be handled across the application.

The goal is to ensure that errors are:

- Detected
- Logged
- Classified
- Handled safely
- Communicated clearly to users
- Recoverable when possible

Errors should never leave the application in an unclear, broken, or permanently loading state.

---

# 1. Core Rule

Every operation that can fail must handle failure explicitly.

Do not assume that:

- API requests always succeed
- Data always exists
- Responses always have the expected shape
- Network connections are always available
- Database operations always succeed
- User input is always valid

Always consider:

```text
Success
Loading
Empty
Error
```

For user-facing asynchronous operations, all relevant states should be handled.

---

# 2. Error Handling Flow

Use a predictable error flow:

```text
User Action
    ↓
UI / Component
    ↓
Feature Logic / Hook
    ↓
Service
    ↓
API
    ↓
Backend
    ↓
Database
```

When an error occurs:

```text
Error
  ↓
Catch / Normalize
  ↓
Log Technical Details
  ↓
Convert to Safe Application Error
  ↓
Display User-Friendly Message
  ↓
Provide Recovery Action
```

Do not expose raw technical errors directly to users.

---

# 3. Error Categories

Errors should be classified when possible.

## Validation Errors

Examples:

- Required field missing
- Invalid email
- Invalid meter number
- Negative payment amount

Example:

```text
Please enter a valid payment amount.
```

Validation errors should normally appear close to the affected field.

---

## Network Errors

Examples:

- No internet connection
- Request timeout
- Server unreachable

Example:

```text
Unable to connect to the server.

Please check your internet connection and try again.
```

Provide a retry action when appropriate.

---

## API Errors

Examples:

- Invalid request
- Unauthorized request
- Missing resource
- Server error

Do not show this directly:

```text
HTTP 500 Internal Server Error
```

Prefer:

```text
Something went wrong while saving your changes.

Please try again.
```

---

## Authentication Errors

Examples:

- Session expired
- Invalid login
- Missing authentication token

Example:

```text
Your session has expired.

Please sign in again to continue.
```

Authentication failures should be handled consistently across the application.

---

## Authorization Errors

Examples:

- User does not have permission
- Restricted feature
- Unauthorized action

Example:

```text
You don't have permission to perform this action.
```

Do not pretend that an authorization failure was a successful action.

---

## Data Errors

Examples:

- Missing required API fields
- Invalid response format
- Corrupted data
- Unexpected `null` value

Handle missing data safely.

Example:

```tsx
const subscriberName =
  subscriber?.fullName ?? "Unknown Subscriber";
```

Do not allow missing data to crash the entire screen.

---

## Business Rule Errors

These occur when an action violates application rules.

Examples:

- Cannot record a negative payment
- Cannot deactivate an already deactivated subscriber
- Cannot apply payment to an invalid billing record
- Interest cannot be posted twice for the same period

Example:

```text
This interest has already been posted for the selected billing period.
```

Business rule errors should clearly explain what prevented the action.

---

## Server Errors

Examples:

- Database failure
- Unexpected backend exception
- Internal processing failure

Users should receive a safe message:

```text
We couldn't complete your request.

Please try again. If the problem continues, contact the administrator.
```

Technical details should be logged separately.

---

# 4. Standard Error Shape

Normalize application errors into a predictable structure.

Example:

```ts
export interface AppError {
  code: string;
  message: string;
  status?: number;
  details?: unknown;
  retryable?: boolean;
}
```

Example:

```ts
{
  code: "NETWORK_ERROR",
  message: "Unable to connect to the server.",
  retryable: true
}
```

Avoid passing raw backend or Axios errors throughout the application.

---

# 5. Error Normalization

Convert unknown errors into a consistent application error.

Example:

```ts
export function normalizeError(error: unknown): AppError {
  if (error instanceof Error) {
    return {
      code: "UNKNOWN_ERROR",
      message: error.message,
      details: error,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "An unexpected error occurred.",
    details: error,
  };
}
```

The UI should consume the normalized error instead of understanding every possible backend error format.

---

# 6. API Error Handling

Services should handle and normalize API failures.

Example:

```ts
export async function createSubscriber(
  data: CreateSubscriberInput
) {
  try {
    const response = await api.post(
      "/subscribers",
      data
    );

    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}
```

Avoid scattering API-specific error handling across every component.

---

# 7. User-Friendly Error Messages

Technical:

```text
SQLSTATE[HY000]: Connection refused
```

User-facing:

```text
Unable to save the changes.

Please try again.
```

Rules:

- Use plain language
- Explain what failed
- Avoid technical jargon
- Do not blame the user
- Provide a next step when possible

---

# 8. Loading State Safety

Every async operation must leave the loading state correctly.

Bad:

```ts
setIsLoading(true);

await saveData();

setIsLoading(false);
```

If `saveData()` throws, loading may remain `true`.

Prefer:

```ts
setIsLoading(true);

try {
  await saveData();
} catch (error) {
  handleError(error);
} finally {
  setIsLoading(false);
}
```

Always use `finally` when cleanup must happen regardless of success or failure.

---

# 9. Retryable Errors

Some errors can be retried.

Examples:

- Network timeout
- Temporary server failure
- Failed data refresh

Example UI:

```text
Unable to load subscribers.

[ Try Again ]
```

Do not automatically retry destructive operations such as:

- Payments
- Deletions
- Billing generation
- Data imports

These actions may have partially completed and must first verify their actual state.

---

# 10. Prevent Duplicate Submissions

While an action is processing:

- Disable the submit button
- Show loading feedback
- Prevent duplicate requests

Example:

```tsx
<Button
  disabled={isSubmitting}
>
  {isSubmitting ? "Saving..." : "Save Changes"}
</Button>
```

This is especially important for:

- Payments
- Billing generation
- Imports
- Exports
- Record creation

---

# 11. Form Validation Errors

Show validation errors near the affected field.

Bad:

```text
Error: Invalid input.
```

Better:

```text
Payment Amount
[ -100 ]

Payment amount must be greater than ₱0.
```

Validation should occur:

1. Before submission when possible
2. On the backend for security and data integrity

Frontend validation improves UX.

Backend validation remains authoritative.

---

# 12. Error Boundaries

Use error boundaries to prevent a component failure from crashing the entire application.

Example:

```text
Application
│
├── Layout
│
├── Error Boundary
│   ├── Dashboard
│   ├── Subscribers
│   └── Billing
```

When a section crashes, show a recovery interface.

Example:

```text
Something went wrong while loading this section.

[ Try Again ]
```

Log the technical error for debugging.

---

# 13. Logging Rules

Log useful technical information.

Include when available:

- Error code
- Feature name
- Action
- Relevant record ID
- Timestamp
- Safe context

Example:

```ts
console.error("[Payment] Failed to record payment", {
  error,
  subscriberId,
  billingId,
});
```

Do not log:

- Passwords
- Authentication tokens
- Full sensitive payment details
- Secret keys
- Environment secrets

Remove temporary debugging logs before finalizing production code unless they provide intentional diagnostics.

---

# 14. Error Feedback Patterns

## Small Action

Use a toast.

```text
Unable to update subscriber.
```

## Form Submission

Use field-level errors plus a general message if needed.

## Page Load Failure

Use a dedicated error state.

```text
Unable to load billing records.

[ Try Again ]
```

## Critical Application Failure

Use an error boundary or full-page recovery screen.

---

# 15. Do Not Fail Silently

Never do this:

```ts
try {
  await saveData();
} catch {
}
```

Every caught error should be handled, logged, rethrown, or intentionally ignored with a documented reason.

Bad:

```ts
catch (error) {
  console.log(error);
}
```

if the user receives no feedback and the application remains in an unclear state.

Prefer:

```ts
catch (error) {
  console.error("[Subscriber] Save failed", error);

  toast.error(
    getUserFriendlyErrorMessage(error)
  );
}
```

---

# 16. Preserve Data During Failures

A failed request must not unnecessarily destroy existing UI data.

Avoid:

```text
Data
 ↓
Refresh Request
 ↓
Request Fails
 ↓
Clear Everything
```

Prefer:

```text
Existing Data
 ↓
Refresh Request
 ↓
Request Fails
 ↓
Keep Existing Data
 +
Show Error / Retry
```

Do not clear valid data unless the application knows that the data is no longer valid.

---

# 17. Destructive and Financial Operations

Extra safeguards are required for important operations.

Examples:

- Recording payments
- Applying interest
- Generating bills
- Deleting records
- Deactivating subscribers
- Importing data

The flow should be:

```text
Validate
   ↓
Confirm when necessary
   ↓
Submit Once
   ↓
Wait for Server Confirmation
   ↓
Verify Result
   ↓
Update UI
   ↓
Show Success
```

Never show a success message unless the operation actually succeeded.

Do not assume that a timeout means the operation failed. For critical operations, verify the final state before allowing a retry.

---

# 18. Backend Error Responses

Backend APIs should return consistent responses.

Example:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Payment amount must be greater than zero."
  }
}
```

For successful requests:

```json
{
  "success": true,
  "data": {}
}
```

Avoid inconsistent formats such as:

```text
"error"
{ "message": "error" }
{ "success": false }
500 HTML page
```

Use one predictable API response pattern whenever possible.

---

# 19. HTTP Status Guidelines

Use meaningful status codes.

| Status | Meaning | Typical Use |
|---|---|---|
| `400` | Bad Request | Invalid request |
| `401` | Unauthorized | Authentication required |
| `403` | Forbidden | Permission denied |
| `404` | Not Found | Resource does not exist |
| `409` | Conflict | Duplicate or conflicting state |
| `422` | Validation Error | Invalid input |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Server Error | Unexpected backend failure |
| `503` | Service Unavailable | Temporary server issue |

Do not return `200 OK` for failed operations.

---

# 20. Error Recovery

When possible, provide a clear recovery path.

Examples:

### Network Failure

```text
Unable to load data.

[ Try Again ]
```

### Session Expired

```text
Your session has expired.

[ Sign In Again ]
```

### Missing Resource

```text
This subscriber could not be found.

[ Back to Subscribers ]
```

### Failed Save

```text
We couldn't save your changes.

[ Try Again ]
```

The user should not need to guess what to do next.

---

# 21. Error Handling Checklist

Before completing a feature, verify:

- [ ] Loading state is handled.
- [ ] Success state is handled.
- [ ] Empty state is handled where relevant.
- [ ] Error state is handled.
- [ ] Validation errors are clear.
- [ ] API errors are normalized.
- [ ] Raw technical errors are not exposed to users.
- [ ] Failed requests do not leave the UI stuck loading.
- [ ] Duplicate submissions are prevented.
- [ ] Retry is available when appropriate.
- [ ] Critical operations verify their final state.
- [ ] Existing valid data is preserved after refresh failures.
- [ ] Errors are logged with useful context.
- [ ] Sensitive data is not logged.
- [ ] Success messages are only shown after confirmed success.
- [ ] Error messages provide a useful next step.

---

# Final Rule

**An error is not handled just because it was caught.**

An error is properly handled only when:

1. The application remains in a valid state.
2. The user receives clear feedback.
3. Sensitive technical details remain protected.
4. The error is logged when useful.
5. A recovery path is available when possible.
6. The system does not falsely report success.

Every feature should be designed for both **success and failure**.