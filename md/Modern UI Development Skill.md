# Modern UI Development Skill

## Overview

Build clean, modern, responsive, and production-ready user interfaces using:

- **Tailwind CSS** for styling
- **shadcn/ui** for accessible and reusable UI components
- **Analytics** for tracking important user interactions
- Modern UI patterns for dashboards, forms, tables, navigation, and responsive layouts

The goal is to create interfaces that feel polished, intentional, fast, and professional.

---

## Design Principles

Always prioritize:

- Clean and minimal layouts
- Good visual hierarchy
- Consistent spacing
- Responsive design
- Accessibility
- Reusable components
- Clear user feedback
- Smooth interactions
- Good empty, loading, and error states

Avoid:

- Excessive gradients
- Too many colors
- Random border radiuses
- Inconsistent spacing
- Overly large headings
- Unnecessary animations
- Generic "AI-looking" dashboard designs
- Building custom components when a good shadcn/ui component already exists

---

## Styling

Use **Tailwind CSS** for all styling.

Prefer:

```tsx
className="flex items-center justify-between gap-4 p-4"
```

Use consistent spacing and layout patterns.

### Recommended Layout

```tsx
<div className="min-h-screen bg-background">
  <main className="container mx-auto px-4 py-6">
    {/* Content */}
  </main>
</div>
```

Prefer semantic Tailwind colors:

```tsx
bg-background
bg-card
text-foreground
text-muted-foreground
border-border
```

Avoid hardcoding colors unless the design specifically requires them.

---

## Components

Use **shadcn/ui** whenever appropriate.

Prefer existing components such as:

- Button
- Card
- Input
- Select
- Dialog
- Sheet
- Dropdown Menu
- Tabs
- Table
- Badge
- Avatar
- Skeleton
- Tooltip
- Popover
- Calendar
- Command
- Alert
- Toast / Sonner

Example:

```tsx
<Button>
  Save Changes
</Button>
```

Use variants instead of manually recreating button styles:

```tsx
<Button variant="outline">Cancel</Button>
<Button variant="destructive">Delete</Button>
```

---

## Modern Component Patterns

Every major screen should consider the following states:

### Loading

Use skeleton components instead of plain text.

```tsx
<Skeleton className="h-8 w-[250px]" />
```

### Empty State

Provide:

- Clear message
- Helpful description
- Relevant action

Example:

```tsx
<Card>
  <CardContent className="flex flex-col items-center justify-center py-12">
    <p className="text-lg font-medium">No records found</p>
    <p className="text-sm text-muted-foreground">
      Create your first record to get started.
    </p>
    <Button className="mt-4">
      Create Record
    </Button>
  </CardContent>
</Card>
```

### Error State

Show understandable errors and provide recovery actions when possible.

Avoid exposing raw API or technical errors directly to users.

---

## Forms

Use:

- Clear labels
- Helpful validation messages
- Proper input types
- Disabled/loading submit states
- Success and error feedback

Prefer:

```tsx
<Form>
  <FormField />
</Form>
```

For destructive actions, use confirmation dialogs.

Example:

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">
      Delete
    </Button>
  </AlertDialogTrigger>

  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>
        Are you absolutely sure?
      </AlertDialogTitle>

      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>

    <AlertDialogFooter>
      <AlertDialogCancel>
        Cancel
      </AlertDialogCancel>

      <AlertDialogAction>
        Continue
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## Tables and Data

For data-heavy pages:

- Use searchable tables when necessary
- Add filters for large datasets
- Support sorting where useful
- Use pagination for large results
- Provide loading states
- Provide empty states
- Make important actions easy to discover

Avoid placing too many actions directly inside tables.

Use dropdown menus for secondary actions.

---

## Analytics

Track meaningful user interactions.

Examples:

```tsx
analytics.track("button_clicked", {
  button_name: "create_subscriber",
});
```

Useful events include:

- Page viewed
- Feature used
- Button clicked
- Form submitted
- Search performed
- Filter applied
- Export completed
- Import completed
- Error encountered

Example naming:

```text
subscriber_created
billing_exported
report_generated
search_performed
payment_recorded
```

Do not track unnecessary or sensitive user information.

Focus analytics on understanding:

- Which features are used
- Where users drop off
- Which workflows fail
- Which actions are most important

---

## Feedback and Notifications

Use toast notifications for successful actions.

Examples:

```tsx
toast.success("Subscriber created successfully.");
```

```tsx
toast.error("Unable to save changes.");
```

Use inline validation for form errors.

Do not rely only on toast messages for critical errors.

---

## Responsive Design

Design for mobile, tablet, and desktop.

Use responsive Tailwind utilities:

```tsx
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4
```

For dashboards:

```tsx
<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
```

Ensure:

- Tables remain usable on mobile
- Buttons do not overflow
- Forms adapt to smaller screens
- Navigation works on mobile
- Important actions remain accessible

Use `Sheet` or mobile navigation patterns when appropriate.

---

## Accessibility

Always:

- Use semantic HTML
- Provide labels for inputs
- Add accessible names to icon-only buttons
- Ensure sufficient contrast
- Support keyboard navigation
- Use tooltips when icons need explanation

Example:

```tsx
<Button
  variant="ghost"
  size="icon"
  aria-label="Delete subscriber"
>
  <Trash2 className="size-4" />
</Button>
```

---

## Icons

Use a consistent icon library such as Lucide.

Prefer icons to improve recognition, but do not use icons without context.

Example:

```tsx
import {
  Plus,
  Search,
  Settings,
  Trash2
} from "lucide-react";
```

---

## Animation

Use subtle animations only when they improve the experience.

Good uses:

- Dialog transitions
- Dropdown transitions
- Loading indicators
- Hover states
- Small layout transitions

Avoid excessive animation or distracting effects.

---

## Recommended Page Structure

Most application pages should follow this structure:

```tsx
<Page>
  <PageHeader>
    <div>
      <h1>Page Title</h1>
      <p>Brief description of this page.</p>
    </div>

    <PageActions>
      <Button>
        <Plus />
        Create
      </Button>
    </PageActions>
  </PageHeader>

  <PageContent>
    {/* Stats, filters, table, cards, etc. */}
  </PageContent>
</Page>
```

---

## Final Checklist

Before considering a feature complete, verify:

- [ ] Uses Tailwind CSS consistently
- [ ] Uses shadcn/ui components where appropriate
- [ ] Responsive on mobile and desktop
- [ ] Has loading states
- [ ] Has empty states
- [ ] Has error handling
- [ ] Provides user feedback
- [ ] Uses accessible controls
- [ ] Analytics tracks important actions
- [ ] No unnecessary custom UI components
- [ ] Spacing and typography are consistent
- [ ] The interface feels clean and modern
- [ ] Code is reusable and maintainable

## Core Rule

When building UI, do not simply make it functional.

Make it feel **intentional, polished, consistent, responsive, and production-ready**.