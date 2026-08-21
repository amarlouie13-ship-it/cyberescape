# Project Architecture Guidelines

## Purpose

This document defines the architectural standards for the project.

The goal is to keep the application:

- Scalable
- Maintainable
- Modular
- Easy to understand
- Easy to debug
- Consistent
- Safe to modify

Every new feature should follow the existing architecture rather than introducing random patterns.

---

# 1. Core Architecture Principles

Follow these principles:

### Separation of Concerns

Keep responsibilities separate.

Do not mix:

- UI rendering
- Business logic
- API calls
- Database logic
- State management
- Validation

Example:

```text
❌ Bad

Component
 ├── Fetch API
 ├── Calculate business rules
 ├── Validate data
 ├── Transform response
 ├── Manage state
 └── Render UI
```

Prefer:

```text
✓ Good

Component
    │
    ├── Hook / Controller
    │       │
    │       ├── Service
    │       │       │
    │       │       └── API
    │       │
    │       └── Business Logic
    │
    └── UI Components
```

---

# 2. Recommended Project Structure

Organize code by feature when possible.

```text
src/
│
├── app/
│   ├── routes/
│   ├── providers/
│   └── layout/
│
├── features/
│   ├── subscribers/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── index.ts
│   │
│   ├── billing/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── payments/
│   ├── inventory/
│   └── reports/
│
├── components/
│   ├── ui/
│   ├── shared/
│   └── layout/
│
├── hooks/
│
├── services/
│
├── lib/
│
├── utils/
│
├── types/
│
└── config/
```

---

# 3. Feature-Based Organization

Each major feature should own its related code.

Example:

```text
features/
└── billing/
    ├── components/
    │   ├── BillingTable.tsx
    │   ├── BillingFilters.tsx
    │   └── BillingForm.tsx
    │
    ├── hooks/
    │   └── useBilling.ts
    │
    ├── services/
    │   └── billingService.ts
    │
    ├── utils/
    │   └── billingCalculations.ts
    │
    ├── types/
    │   └── billing.types.ts
    │
    └── index.ts
```

Do not scatter files for the same feature across unrelated folders unless they are genuinely shared.

---

# 4. Component Architecture

Components should have a single primary responsibility.

Prefer:

```text
BillingPage
│
├── BillingHeader
├── BillingStats
├── BillingFilters
├── BillingTable
└── BillingActions
```

Avoid:

```text
BillingPage.tsx
```

Containing:

- 2,000 lines
- Multiple API calls
- Complex calculations
- Several dialogs
- Table logic
- Form logic
- Business rules
- UI rendering

Break large features into meaningful components.

However, do not split components excessively.

---

# 5. Smart vs Presentational Components

Separate complex logic from reusable UI when beneficial.

### Smart Component

Responsible for:

- Fetching data
- Managing state
- Calling services
- Coordinating actions

Example:

```tsx
function BillingPage() {
  const {
    bills,
    isLoading,
    createBill,
  } = useBilling();

  return (
    <BillingView
      bills={bills}
      isLoading={isLoading}
      onCreate={createBill}
    />
  );
}
```

### Presentational Component

Responsible for:

- Rendering UI
- Receiving props
- Triggering callbacks

```tsx
function BillingView({
  bills,
  isLoading,
  onCreate,
}: BillingViewProps) {
  return (
    <BillingTable
      data={bills}
      isLoading={isLoading}
      onCreate={onCreate}
    />
  );
}
```

---

# 6. API and Service Layer

UI components should not contain complex API logic.

Avoid:

```tsx
const handleSave = async () => {
  const response = await fetch("/api/subscribers", {
    method: "POST",
    body: JSON.stringify(data),
  });

  // Complex transformation
  // Validation
  // Error parsing
  // More API calls
};
```

Prefer:

```text
Component
    ↓
Hook
    ↓
Service
    ↓
API Client
    ↓
Backend
```

Example:

```tsx
// subscriberService.ts

export async function createSubscriber(
  data: CreateSubscriberInput
) {
  return api.post("/subscribers", data);
}
```

Then use the service through hooks or feature logic.

---

# 7. Business Logic

Business logic should not be deeply embedded inside UI components.

Examples of business logic:

- Interest calculations
- Billing calculations
- Payment allocation
- Subscriber status rules
- Inventory calculations
- Permission rules

Prefer:

```text
features/
└── billing/
    └── utils/
        └── calculateInterest.ts
```

Example:

```tsx
export function calculateInterest(
  principal: number,
  rate: number,
  daysLate: number
) {
  return principal * rate * daysLate;
}
```

UI components should consume the result rather than implement the calculation directly.

---

# 8. State Management

Use the simplest appropriate state solution.

### Local State

Use for:

- Form inputs
- Dialog visibility
- UI toggles
- Temporary component state

```tsx
const [isDialogOpen, setIsDialogOpen] = useState(false);
```

### Server State

Use for:

- API data
- Cached requests
- Loading states
- Refetching

Keep server data separate from UI state.

### Global State

Use only when multiple unrelated parts of the application genuinely need shared state.

Examples:

- Authentication
- Theme
- Application-wide preferences

Avoid placing every piece of data into global state.

---

# 9. Data Flow

Prefer predictable one-directional data flow.

```text
User Action
    ↓
Component
    ↓
Handler
    ↓
Hook / Feature Logic
    ↓
Service
    ↓
API
    ↓
Response
    ↓
State Update
    ↓
UI Update
```

Avoid hidden state mutations or multiple sources of truth.

---

# 10. Shared Components

Place truly reusable components in:

```text
components/shared/
```

Examples:

```text
components/shared/
├── PageHeader.tsx
├── EmptyState.tsx
├── ErrorState.tsx
├── LoadingState.tsx
├── ConfirmDialog.tsx
└── DataTable.tsx
```

Use:

```text
components/ui/
```

For shadcn/ui components.

Example:

```text
components/ui/
├── button.tsx
├── dialog.tsx
├── input.tsx
├── table.tsx
└── skeleton.tsx
```

Do not modify generated shadcn/ui components unnecessarily.

Create wrappers or composed components when custom application behavior is needed.

---

# 11. Types

Keep types close to the feature that owns them.

Example:

```text
features/
└── subscribers/
    └── types/
        └── subscriber.types.ts
```

Use global types only when they are genuinely shared.

Avoid:

```text
types/
└── everything.ts
```

Prefer meaningful files:

```text
subscriber.types.ts
billing.types.ts
payment.types.ts
inventory.types.ts
```

---

# 12. Utilities

Utilities should be:

- Pure
- Reusable
- Easy to test

Example:

```tsx
export function formatCurrency(
  amount: number
) {
  return new Intl.NumberFormat(
    "en-PH",
    {
      style: "currency",
      currency: "PHP",
    }
  ).format(amount);
}
```

Do not hide major business workflows inside generic utility files.

Feature-specific logic should stay within its feature.

---

# 13. Validation

Validation should exist at multiple layers.

```text
User Input
    ↓
Frontend Validation
    ↓
API Request
    ↓
Backend Validation
    ↓
Database Constraints
```

Frontend validation improves user experience.

Backend validation protects system integrity.

Never rely only on frontend validation.

---

# 14. Error Architecture

Errors should follow a consistent flow.

```text
API
 ↓
Service
 ↓
Feature Logic
 ↓
User-Friendly Message
 ↓
UI Feedback
```

Technical errors should be logged.

User-facing errors should be understandable.

Example:

```text
Technical:
SQLSTATE connection timeout

User:
Unable to save changes. Please try again.
```

---

# 15. Feature Boundaries

Features should not directly depend heavily on each other's internal files.

Avoid:

```text
billing/
    importing
subscribers/components/privateFile.ts
```

Prefer:

```text
billing/
    ↓
shared service or public feature API
    ↓
subscribers/
```

Use explicit exports:

```tsx
export {
  getSubscriber,
  getSubscriberById,
} from "./services/subscriberService";
```

This prevents tight coupling between features.

---

# 16. Dependency Rules

Dependencies should flow in a predictable direction.

```text
Pages
  ↓
Features
  ↓
Components / Hooks
  ↓
Services
  ↓
API Client
```

Lower-level layers should not depend on higher-level layers.

Example:

```text
❌ API Service → imports Page component

✓ Page → imports Feature
✓ Feature → imports Service
```

---

# 17. Configuration

Keep application configuration centralized.

```text
config/
├── app.ts
├── routes.ts
├── constants.ts
└── environment.ts
```

Avoid scattering:

- API URLs
- Feature flags
- Application constants
- Configuration values

across random components.

Use environment variables for environment-specific configuration.

---

# 18. Naming Rules

Use clear and predictable names.

### Components

```text
SubscriberTable.tsx
BillingForm.tsx
PaymentDialog.tsx
```

### Hooks

```text
useSubscribers.ts
useBilling.ts
usePayments.ts
```

### Services

```text
subscriberService.ts
billingService.ts
paymentService.ts
```

### Types

```text
subscriber.types.ts
billing.types.ts
payment.types.ts
```

### Utilities

```text
formatCurrency.ts
calculateInterest.ts
formatDate.ts
```

Avoid vague names:

```text
utils.ts
helpers.ts
data.ts
functions.ts
newFile.ts
```

unless their purpose is genuinely narrow and obvious.

---

# 19. Recommended Feature Workflow

When implementing a feature:

### Step 1 — Understand

Identify:

- Existing related code
- Data sources
- Existing components
- Business rules
- API requirements

### Step 2 — Plan

Determine:

- Which files need modification
- Which components can be reused
- What new files are necessary
- How state will flow
- How errors will be handled

### Step 3 — Implement

Follow the architecture:

```text
UI
 ↓
Feature Logic
 ↓
Service
 ↓
API
```

### Step 4 — Verify

Check:

- Functionality
- Existing workflows
- Error handling
- Loading states
- Responsive behavior
- Data integrity

### Step 5 — Clean Up

Before completing:

- Remove debugging code
- Remove unused imports
- Remove duplicated logic
- Check naming
- Ensure files are in the correct location

---

# 20. Architecture Review Checklist

Before completing a feature:

- [ ] Does the code follow the existing project structure?
- [ ] Is business logic separated from UI?
- [ ] Are API calls handled through the appropriate layer?
- [ ] Is related code grouped by feature?
- [ ] Are reusable components reused?
- [ ] Is state stored in the correct location?
- [ ] Is there a clear data flow?
- [ ] Are feature boundaries respected?
- [ ] Are types organized properly?
- [ ] Are utilities focused and reusable?
- [ ] Are dependencies flowing in the correct direction?
- [ ] Is the implementation easy to modify later?
- [ ] Does the feature avoid unnecessary complexity?

---

# Final Architecture Rule

**Do not organize code only to make the current feature work.**

Organize it so that future developers or AI agents can easily:

- Find related code
- Understand data flow
- Modify features safely
- Reuse existing functionality
- Debug problems
- Add new functionality without creating technical debt

The architecture should remain **predictable, modular, and easy to navigate as the application grows**.