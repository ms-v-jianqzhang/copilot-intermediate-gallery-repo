---
mode: 'agent'
description: 'Generate unit tests for a UI component using Vitest + React Testing Library'
tools: ['codebase', 'editFiles', 'runCommands']
---

# Generate Unit Tests for a UI Component

## Context
Generate unit tests for a React UI component in the Photo Gallery & Portfolio
application. Tests use **Vitest** + **React Testing Library** and run in a
**jsdom** environment. Follow the existing patterns in
`GalleryGrid.test.tsx` and `UploadZone.test.tsx`.

## Inputs
1. Which component should I test? (Provide the path, e.g. `src/components/ui/layout/GalleryTable.tsx`)
2. Are there specific behaviors or edge cases you want covered? (Optional)

## Test Stack & Conventions
- Test runner: **Vitest** (`npm test` runs `vitest run`; `npm run test:watch` for watch mode).
- Library: **@testing-library/react** with **@testing-library/user-event** for interactions.
- Matchers: **@testing-library/jest-dom** (configured globally in `vitest.setup.ts`).
- Environment: **jsdom**, `globals: true` (importing `describe`/`it`/`expect` is optional).
- Path alias: import from `@/...` (resolves to `src/...`).
- Test file location: co-locate as `ComponentName.test.tsx` next to the component.
- Use semantic queries (`getByRole`, `getByText`, `getByLabelText`) over test IDs.

## Requirements
1. Create a test file named `<ComponentName>.test.tsx` in the same folder as the component.
2. Cover, where applicable:
   - Default render (key text, headings, and roles appear).
   - Each prop's effect (variants, limits, conditional rendering).
   - User interactions via `userEvent` (clicks, typing, uploads) and resulting state changes.
   - Conditional/empty states and callback props (assert with `vi.fn()`).
   - Accessibility affordances (accessible names via `getByRole(..., { name })`).
3. Keep each test focused and independent; rely on the global `cleanup` in `vitest.setup.ts`.
4. After writing tests, run `npm test` and fix any failures.

## Known jsdom / Animation Gotchas
- **Framer Motion**: `AnimatePresence` can keep exiting nodes mounted in jsdom, breaking
  removal assertions. If testing exit/removal, mock `framer-motion` to render plain
  elements (a `motion` Proxy that strips animation props + `AnimatePresence` → `Fragment`).
- **Object URLs**: jsdom has no `URL.createObjectURL`/`revokeObjectURL`. Stub them with
  `vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:mock'), revokeObjectURL: vi.fn() })`.
- **Timers**: Combining `vi.useFakeTimers()` with `userEvent` can deadlock. Prefer real
  timers + `waitFor(..., { timeout })` for components that use `setTimeout`/`setInterval`.
- **Icon-only buttons**: assert via `getByRole('button', { name: /label/i })`; if the
  button has no accessible name, flag it as an accessibility gap.

## Example Skeleton
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders its default content', () => {
    render(<ComponentName /* required props */ />);
    expect(screen.getByRole('heading', { name: /.../i })).toBeInTheDocument();
  });

  it('invokes the callback on interaction', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<ComponentName onAction={onAction} /* ... */ />);

    await user.click(screen.getByRole('button', { name: /.../i }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });
});