# Generate Unit Tests for UI Components

## Context
Generate unit tests for a UI component in the Photo Gallery & Portfolio application (Next.js 15, React 19, TypeScript, Tailwind CSS). The component to test is provided as the prompt argument (a name or file path). If none is given, ask which component to test.

## Before Writing Tests
1. Read the component and its props interface; note default props, conditional rendering, and callbacks.
2. Check `package.json` for an existing test setup. If none exists, tell the user the dev dependencies and config needed (recommended: Vitest, jsdom, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`) and add a `test` script, rather than silently assuming one.
3. Look at the matching `mock-*-data.ts` file in `src/lib/` and reuse its data shape for test fixtures.

## Project Patterns to Follow
- Use TypeScript with strict types; type fixtures with the component's exported prop types (for example `GalleryRow`, `Photo`).
- Import using the `@/` alias, and import components from their own file, not through barrels.
- Place tests next to the component as `ComponentName.test.tsx`.
- Query by accessible role, label, or text (`getByRole`, `getByLabelText`); avoid test IDs and class-name selectors.
- Use `userEvent` for interactions and `vi.fn()` for callback props.
- Do not assert on Tailwind class names except where a class encodes state (for example selected or active styling).

## What to Cover
1. **Rendering**: required props render the expected text, headings, and icons-as-labels.
2. **Props and defaults**: optional props (`className`, `bgColor`, `viewAllLink`, `title`) behave correctly when present and absent.
3. **Conditional UI**: empty states, optional links, and badges or statuses that vary with data.
4. **Interactions**: click, keyboard (Enter, Space, Escape, Tab), and callback arguments.
5. **Accessibility**: accessible names for icon-only buttons, table or dialog semantics, and `aria-*` state that changes (`aria-pressed`, `aria-expanded`).
6. **Edge cases**: empty arrays, long text, zero or large numbers, and unknown or missing optional fields.

## Mocking Guidelines
- `framer-motion`: mock `motion.*` as plain elements if animations interfere with assertions.
- `next/link`: renders a normal anchor, so assert on `href`; no mock is needed.
- `lucide-react`: render real icons; assert on accessible names, not SVG internals.
- `react-dropzone` and file uploads: use `File` objects, and stub `URL.createObjectURL` and `URL.revokeObjectURL` (jsdom does not implement them).
- Radix Dialog renders in a portal: query from `screen`, not from the container.
- Components with `'use client'` are tested like any other component; Server Components that only render markup need no special handling.

## Test Structure
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ComponentName } from "@/components/ui/layout/ComponentName";

describe("ComponentName", () => {
  it("renders required content", () => {
    render(<ComponentName title="Example" />);
    expect(screen.getByRole("heading", { name: "Example" })).toBeInTheDocument();
  });

  it("calls onAction with the row data", async () => {
    const onAction = vi.fn();
    render(<ComponentName title="Example" onAction={onAction} />);
    await userEvent.click(screen.getByRole("button", { name: /action/i }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
```

## Requirements
1. One `describe` block per component, with behavior-focused test names ("shows an empty message when there are no galleries").
2. Each test is independent and uses fresh fixtures.
3. No snapshot tests unless explicitly requested.
4. Do not modify the component to make tests pass; report suspected bugs instead.
5. After generating, list any behavior that could not be tested and why.

Create the test file following these patterns, then summarize what is covered.
