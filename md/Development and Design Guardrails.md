# Development and Design Guardrails

## Purpose

These guardrails define the minimum standards for building, modifying, and reviewing the application.

Every implementation should be:

- Functional
- Clean
- Modern
- Consistent
- Responsive
- Accessible
- Maintainable
- Production-ready

Do not prioritize speed of implementation over correctness, usability, or maintainability.

---

# 1. Core Development Rules

Before implementing a feature:

- Understand the existing architecture.
- Check for reusable components.
- Check existing patterns before creating new ones.
- Avoid duplicating functionality.
- Keep changes focused on the requested feature.
- Do not rewrite unrelated code unless necessary.
- Do not introduce unnecessary dependencies.

When modifying existing code:

- Preserve existing functionality.
- Avoid breaking unrelated features.
- Follow the existing project structure.
- Reuse utilities and components where appropriate.
- Keep backwards compatibility when possible.

---

# 2. UI Implementation Rules

All new UI should use:

- **Tailwind CSS**
- **shadcn/ui**
- **Lucide icons**
- Existing design tokens and theme variables
- Existing reusable components when available

Do not:

- Create custom buttons when shadcn/ui `Button` is sufficient.
- Create custom dialogs when `Dialog` or `AlertDialog` is appropriate.
- Hardcode colors unnecessarily.
- Introduce random spacing values.
- Mix multiple component libraries without a clear reason.
- Create inconsistent styles across screens.

Prefer:

```tsx id="q2r8a1"
<Button variant="outline">
  Cancel
</Button>
```

Instead of manually recreating the component:

```tsx id="z9k3v6"
<button className="border rounded-md px-4 py-2">
  Cancel
</button>
```

---

# 3. Modern UI Requirements

Every important screen should consider:

- Loading state
- Empty state
- Error state
- Success feedback
- Responsive behavior
- Accessibility
- Keyboard interaction

Do not leave users with:

- Blank screens
- Infinite loading states
- Raw technical errors
- Unclear disabled buttons
- Missing feedback after actions

---

# 4. Component Reuse

Before creating a new component:

1. Check if shadcn/ui already provides it.
2. Check if the project already has a reusable component.
3. Extend an existing component if appropriate.
4. Create a new component only when necessary.

Reusable components should be used for repeated patterns such as:

- Page headers
- Data tables
- Empty states
- Loading states
- Confirmation dialogs
- Status badges
- Form sections
- Search and filter controls

Avoid copy-pasting the same UI structure across multiple files.

---

# 5. Tailwind Guardrails

Use Tailwind consistently.

Prefer semantic classes:

```tsx id="k8p4w2"
bg-background
text-foreground
text-muted-foreground
border-border
bg-card
```

Avoid unnecessary hardcoded values:

```tsx id="m7x2q5"
bg-[#1a1a1a]
text-[#ffffff]
p-[17px]
```

Unless they are specifically required by the design system.

Use responsive utilities:

```tsx id="h3f7n9"
grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4
```

Keep class names readable and organized.

---

# 6. shadcn/ui Guardrails

Use shadcn/ui components when they fit the use case.

Examples:

| Use Case | Preferred Component |
|---|---|
| Primary action | `Button` |
| Confirmation | `AlertDialog` |
| Form input | `Input` |
| Selection | `Select` |
| Navigation | `Tabs` |
| Side content | `Sheet` |
| Secondary actions | `DropdownMenu` |
| Status | `Badge` |
| Loading | `Skeleton` |
| Help text | `Tooltip` |
| Searchable selection | `Command` |

Do not recreate these components without a strong reason.

---

# 7. Analytics Guardrails

Track meaningful user interactions.

Good examples:

```text id="u1w9p4"
page_viewed
subscriber_created
payment_recorded
billing_exported
report_generated
search_performed
filter_applied
```

Analytics events should:

- Use consistent naming
- Clearly describe the action
- Include useful non-sensitive metadata
- Avoid duplicate events
- Avoid excessive tracking

Example:

```tsx id="a5r2d8"
analytics.track("subscriber_created", {
  source: "manual_entry",
});
```

Do not track:

- Passwords
- Authentication tokens
- Sensitive personal information
- Raw payment details
- Private user content unless explicitly required and properly handled

---

# 8. Forms and Validation

Every form should:

- Have clear labels.
- Validate required fields.
- Display validation errors near the relevant field.
- Prevent duplicate submissions.
- Show loading state while submitting.
- Provide success or failure feedback.

Do not:

- Rely only on placeholders.
- Allow users to submit repeatedly.
- Hide validation errors.
- Show generic errors when a specific message is available.

Example:

```tsx id="c6m1r8"
<Button disabled={isSubmitting}>
  {isSubmitting && <Loader2 className="animate-spin" />}
  Save Changes
</Button>
```

---

# 9. Destructive Actions

Destructive or irreversible actions require confirmation.

Examples:

- Delete
- Remove
- Disconnect
- Deactivate
- Reset
- Permanently clear data

Use `AlertDialog`.

The confirmation must clearly explain:

- What will happen
- What data will be affected
- Whether the action can be undone

Do not use vague confirmations such as:

```text id="p4j7x2"
Are you sure?
```

Prefer:

```text id="r8v5m1"
Are you sure you want to deactivate this subscriber?

The subscriber will no longer appear as active and future billing may be affected.
```

---

# 10. Error Handling

Never expose raw system errors directly to users.

Bad:

```text id="w3k6p9"
SQLSTATE[HY000]: General error
```

Better:

```text id="n7q2v4"
Unable to save the subscriber.

Please check your information and try again.
```

Log technical details separately when necessary.

Every recoverable error should provide a useful next step.

---

# 11. Loading and Async Operations

All asynchronous operations should handle:

1. Loading
2. Success
3. Failure

Example:

```text id="y5h8k3"
Idle
  ↓
Loading
  ↓
Success / Error
```

Requirements:

- Disable duplicate actions while processing.
- Show loading indicators.
- Restore controls after failure.
- Handle network errors.
- Prevent UI from becoming permanently stuck.

---

# 12. Responsive Guardrails

Every screen must work on:

- Mobile
- Tablet
- Desktop

Before completing a feature, check:

- No horizontal overflow
- Buttons remain accessible
- Forms adapt correctly
- Text does not overlap
- Tables remain usable
- Navigation works on small screens

Do not design only for desktop.

---

# 13. Accessibility Guardrails

All interactive elements should be accessible.

Requirements:

- Inputs have labels.
- Icon-only buttons have `aria-label`.
- Important interactions support keyboard navigation.
- Focus states remain visible.
- Text has sufficient contrast.
- Errors are understandable.

Example:

```tsx id="v2n6f8"
<Button
  size="icon"
  variant="ghost"
  aria-label="Delete subscriber"
>
  <Trash2 className="size-4" />
</Button>
```

---

# 14. Data and State Guardrails

Do not:

- Duplicate the same state unnecessarily.
- Store derived data when it can be calculated.
- Mutate state directly.
- Assume API responses are always valid.
- Lose existing data when transforming API responses.

Always:

- Validate important API data.
- Preserve required fields.
- Handle missing or null values.
- Keep state ownership clear.
- Use a single source of truth when possible.

---

# 15. API Guardrails

When integrating APIs:

- Handle loading states.
- Handle network failures.
- Validate responses.
- Handle missing fields safely.
- Avoid silent failures.
- Provide useful logs during development.

Do not assume:

```text id="f8r3q1"
response.data.user.name
```

Always exists without validation.

Prefer safe handling:

```tsx id="b6n2x7"
const name = response?.data?.user?.name ?? "Unknown";
```

when appropriate.

---

# 16. Code Quality Guardrails

Code should be:

- Readable
- Modular
- Consistent
- Easy to maintain
- Properly named

Prefer descriptive names:

```tsx id="g1m5r9"
const activeSubscribers = ...
const handlePaymentSubmit = ...
const calculateInterest = ...
```

Avoid:

```tsx id="t4y7p2"
const x = ...
const data2 = ...
const fn = ...
```

Do not create extremely large components when they can reasonably be separated into smaller reusable pieces.

However, do not over-engineer simple features into excessive abstractions.

---

# 17. Performance Guardrails

Avoid:

- Unnecessary re-renders
- Repeated API calls
- Duplicate data fetching
- Large unnecessary dependencies
- Rendering thousands of items without pagination or virtualization

Consider:

- Memoization when it provides measurable value
- Pagination for large datasets
- Debouncing search inputs
- Caching appropriate data
- Lazy loading large features when beneficial

Do not optimize prematurely.

---

# 18. Security Guardrails

Never expose:

- API secrets
- Database credentials
- Private tokens
- Authentication secrets
- Sensitive environment variables

Use environment variables for configuration.

Validate important input on both:

- Client
- Server

Do not trust frontend validation alone.

---

# 19. Before Making a Change

Ask:

1. Does this already exist?
2. Can an existing component be reused?
3. Will this break another feature?
4. Does this follow the current design system?
5. Does this work on mobile?
6. Does it handle loading and errors?
7. Does it provide clear feedback?
8. Should this interaction be tracked with analytics?

---

# 20. Before Declaring Complete

Verify:

- [ ] Feature works as requested.
- [ ] Existing functionality still works.
- [ ] No unnecessary files were modified.
- [ ] Tailwind is used consistently.
- [ ] shadcn/ui components are used where appropriate.
- [ ] Lucide icons are used consistently.
- [ ] UI is responsive.
- [ ] Loading states exist.
- [ ] Empty states exist where relevant.
- [ ] Error handling exists.
- [ ] Success feedback is provided.
- [ ] Destructive actions are confirmed.
- [ ] Accessibility is considered.
- [ ] Analytics tracks meaningful actions where relevant.
- [ ] No sensitive information is tracked.
- [ ] Code is clean and maintainable.

---

# Final Rule

**Do not implement features just to make them work.**

Every implementation should also be evaluated for:

- User experience
- Visual consistency
- Component reuse
- Accessibility
- Responsiveness
- Error handling
- Maintainability
- Analytics where meaningful

The final result should feel like a **cohesive, modern, production-ready application**, not a collection of individually working features.