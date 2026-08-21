# Modern UI/UX Design Guidelines

## Overview

Design interfaces that are clean, modern, intuitive, and professional.

The UI should feel like a polished production application, not a generic template or randomly generated interface.

Use:

- **Tailwind CSS** for consistent styling
- **shadcn/ui** for high-quality accessible components
- **Lucide icons** for consistent iconography
- Modern UI/UX patterns
- Responsive layouts
- Clear visual hierarchy
- Subtle interactions and feedback

---

# 1. Design Philosophy

Follow these principles:

### Clean

Keep interfaces uncluttered.

Remove unnecessary elements and prioritize important information.

### Consistent

Use the same spacing, typography, button styles, colors, and interaction patterns throughout the application.

### Hierarchical

Users should immediately understand:

1. What page they are on
2. What information is important
3. What action they should take next

### Functional

Every design decision should serve a purpose.

Do not add visual elements only because they look decorative.

---

# 2. Layout

Use a clear layout structure.

```text
┌─────────────────────────────────────────────┐
│ Sidebar / Navigation                        │
├─────────────────────────────────────────────┤
│                                             │
│ Page Title                     Primary Action│
│ Page Description                            │
│                                             │
├─────────────────────────────────────────────┤
│ Filters / Search / Tabs                     │
├─────────────────────────────────────────────┤
│                                             │
│ Main Content                                │
│                                             │
│ Tables / Cards / Forms / Charts             │
│                                             │
└─────────────────────────────────────────────┘
```

Recommended page structure:

```tsx id="xk3p9q"
<div className="flex min-h-screen">
  <Sidebar />

  <main className="flex-1">
    <PageHeader />

    <div className="container mx-auto px-4 py-6">
      <PageContent />
    </div>
  </main>
</div>
```

---

# 3. Spacing

Use a consistent spacing system.

Prefer Tailwind spacing values:

```text
gap-2
gap-3
gap-4
gap-6
gap-8

p-3
p-4
p-6
p-8
```

Recommended defaults:

| Element | Spacing |
|---|---|
| Icon + Text | `gap-2` |
| Small components | `gap-3` |
| Cards | `p-4` or `p-6` |
| Form fields | `space-y-4` |
| Page sections | `space-y-6` |
| Major sections | `space-y-8` |

Avoid random spacing values unless necessary.

---

# 4. Typography

Create a clear typography hierarchy.

### Page Title

```tsx id="7v8k1s"
<h1 className="text-2xl font-semibold tracking-tight">
  Subscribers
</h1>
```

### Description

```tsx id="g6f2mw"
<p className="text-sm text-muted-foreground">
  Manage and monitor all subscriber accounts.
</p>
```

### Section Title

```tsx id="2qj1dm"
<h2 className="text-lg font-semibold">
  Recent Activity
</h2>
```

Avoid:

- Too many font sizes
- Excessive bold text
- Large headings that dominate the page
- Multiple font families

Use typography to create hierarchy, not decoration.

---

# 5. Colors

Use semantic colors.

Prefer:

```text
background
foreground
card
card-foreground
primary
primary-foreground
secondary
muted
muted-foreground
accent
destructive
border
```

Example:

```tsx id="1mdy4q"
<Card className="border-border bg-card">
```

Do not introduce random colors for individual components.

Use color primarily for:

- Important actions
- Status
- Alerts
- Data visualization
- Visual hierarchy

---

# 6. Cards

Cards should group related information.

Good card structure:

```tsx id="z2x9sw"
<Card>
  <CardHeader>
    <CardTitle>Total Subscribers</CardTitle>
    <CardDescription>
      Active subscriber accounts
    </CardDescription>
  </CardHeader>

  <CardContent>
    <div className="text-3xl font-bold">
      1,245
    </div>
  </CardContent>
</Card>
```

Avoid putting every element inside a card.

Use cards only when they provide meaningful visual grouping.

---

# 7. Buttons

Each screen should have a clear primary action.

Example:

```text
Primary Action

[ + Add Subscriber ]
```

Secondary actions:

```text
[ Cancel ] [ Save Changes ]
```

Destructive actions:

```text
[ Delete Subscriber ]
```

Rules:

- One primary action per context
- Avoid multiple competing primary buttons
- Use icons when they improve recognition
- Icon-only buttons must have tooltips or accessible labels
- Show loading state when processing

Example:

```tsx id="p6z4e1"
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="animate-spin" />}
  Save Changes
</Button>
```

---

# 8. Forms

Forms should be simple and easy to scan.

Recommended structure:

```text
Personal Information
────────────────────

First Name
[________________]

Last Name
[________________]

Contact Information
────────────────────

Phone Number
[________________]

Email Address
[________________]

                 [ Cancel ] [ Save ]
```

Rules:

- Group related fields
- Use clear labels
- Mark required fields
- Show validation near the field
- Do not rely only on placeholder text
- Disable submission while processing

---

# 9. Tables

Tables should prioritize readability.

Recommended structure:

```text
┌────────────────────────────────────────────────────┐
│ Search...                  Filter    + Add          │
├────────────────────────────────────────────────────┤
│ Name         Status        Date          Actions   │
├────────────────────────────────────────────────────┤
│ Juan Dela    Active        Aug 21, 2026     ⋮      │
│ Maria Cruz   Pending       Aug 20, 2026     ⋮      │
└────────────────────────────────────────────────────┘
```

Use:

- Search
- Filters
- Sorting
- Pagination
- Status badges
- Dropdown menus for secondary actions

Avoid overcrowding rows with too many buttons.

---

# 10. Status Design

Use badges for statuses.

Examples:

```text
Active
Inactive
Pending
Paid
Unpaid
Processing
Completed
Failed
```

Keep status styles consistent across the application.

Do not create a different visual style for the same status on different pages.

---

# 11. Empty States

Empty states should explain what happened and what the user can do.

Example:

```text
        📄

     No subscribers found

You haven't added any subscribers yet.

        [ Add Subscriber ]
```

Every important data screen should have a proper empty state.

---

# 12. Loading States

Avoid blank screens while loading.

Use skeletons for:

- Tables
- Cards
- Dashboard statistics
- Content sections

Example:

```tsx id="u7n4pk"
<div className="space-y-4">
  <Skeleton className="h-10 w-full" />
  <Skeleton className="h-32 w-full" />
  <Skeleton className="h-32 w-full" />
</div>
```

---

# 13. Error States

Errors should be understandable.

Bad:

```text
Error 500
```

Better:

```text
Unable to load subscribers

Something went wrong while loading the subscriber data.

[ Try Again ]
```

Provide recovery actions whenever possible.

---

# 14. Icons

Use **Lucide icons** consistently.

Good uses:

```text
+ Add
🔍 Search
⚙ Settings
🗑 Delete
✏ Edit
⬇ Download
```

Rules:

- Use icons consistently
- Keep icon sizes consistent
- Do not mix multiple icon libraries
- Do not use decorative icons excessively
- Add tooltips for icon-only actions

---

# 15. Dialogs

Use dialogs for focused actions.

Good uses:

- Confirm deletion
- Create a record
- Edit a small amount of information
- View details

Avoid putting an entire complex page inside a small dialog.

For complex workflows, use a dedicated page or sheet.

---

# 16. Navigation

Navigation should clearly communicate:

- Current location
- Available sections
- Important actions

Example:

```text
Dashboard
Subscribers
Billing
Payments
Reports
Inventory

──────────────

Settings
Logout
```

Highlight the active navigation item clearly.

Avoid deeply nested navigation unless necessary.

---

# 17. Dashboard Design

Dashboards should provide useful information quickly.

Recommended structure:

```text
Dashboard
Overview of your system

┌───────────┐ ┌───────────┐ ┌───────────┐
│ Active    │ │ Revenue   │ │ Pending   │
│  1,245    │ │ ₱120,000  │ │    42     │
└───────────┘ └───────────┘ └───────────┘

Revenue Overview
────────────────────────────

[ Chart ]

Recent Activity
────────────────────────────

[ Activity Feed ]
```

Do not overload dashboards with too many charts.

Prioritize actionable information.

---

# 18. Responsive Design

Always design for:

- Mobile
- Tablet
- Desktop

Example:

```tsx id="q9l2sk"
<div className="
  grid
  grid-cols-1
  gap-4
  md:grid-cols-2
  xl:grid-cols-4
">
```

On smaller screens:

- Stack layouts vertically
- Convert complex navigation to a sheet
- Make buttons easier to tap
- Allow tables to scroll horizontally when necessary
- Keep important actions accessible

---

# 19. Interaction Design

Interactions should provide feedback.

Use:

- Hover states
- Focus states
- Loading states
- Disabled states
- Success notifications
- Error notifications

Example:

```tsx id="az6k3f"
<Button
  className="transition-colors"
>
  Save
</Button>
```

Keep animations subtle and fast.

Avoid distracting animations.

---

# 20. Design Review Checklist

Before completing a screen:

- [ ] Is the page easy to understand at a glance?
- [ ] Is there a clear primary action?
- [ ] Is the visual hierarchy clear?
- [ ] Is spacing consistent?
- [ ] Are shadcn/ui components used appropriately?
- [ ] Are colors semantic and consistent?
- [ ] Does the page work on mobile?
- [ ] Are loading states included?
- [ ] Are empty states included?
- [ ] Are error states included?
- [ ] Are destructive actions confirmed?
- [ ] Are icon-only buttons accessible?
- [ ] Does the design avoid unnecessary visual clutter?
- [ ] Does the interface feel modern and production-ready?

---

# Core Rule

**Do not design interfaces that merely look good in a screenshot.**

Design interfaces that are:

- Easy to understand
- Easy to navigate
- Consistent
- Responsive
- Accessible
- Functional
- Polished
- Production-ready

Every screen should feel like part of the same cohesive product.