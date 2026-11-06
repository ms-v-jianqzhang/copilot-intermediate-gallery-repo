import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UploadZone } from "./UploadZone";

// framer-motion keeps exiting nodes mounted in jsdom (the exit animation never
// completes), which breaks removal assertions. Replace it with plain elements.
vi.mock("framer-motion", () => {
  const strip = new Set([
    "initial",
    "animate",
    "exit",
    "transition",
    "whileHover",
    "whileTap",
    "whileInView",
    "whileFocus",
    "whileDrag",
    "variants",
    "layout",
    "layoutId",
    "drag",
    "onAnimationComplete",
  ]);
  const createComponent = (tag: string) =>
    React.forwardRef((props: Record<string, unknown>, ref: React.Ref<unknown>) => {
      const clean: Record<string, unknown> = {};
      for (const key in props) {
        if (!strip.has(key)) clean[key] = props[key];
      }
      return React.createElement(tag, { ...clean, ref });
    });
  const motion = new Proxy(
    {},
    { get: (_target, tag: string) => createComponent(tag) }
  );
  return {
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  };
});

// jsdom does not implement object URLs; stub them so previews can render.
beforeEach(() => {
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: vi.fn(() => "blob:mock-preview"),
    revokeObjectURL: vi.fn(),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function createImageFile(name = "photo.png") {
  return new File(["binary-content"], name, { type: "image/png" });
}

describe("UploadZone", () => {
  it("renders the default drop-zone prompt", () => {
    render(<UploadZone />);

    expect(screen.getByText("Upload your photos")).toBeInTheDocument();
    expect(
      screen.getByText(/drag and drop your images here/i)
    ).toBeInTheDocument();
  });

  it("adds a file card when a file is selected", async () => {
    const user = userEvent.setup();
    render(<UploadZone />);

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    await user.upload(input, createImageFile("sunset.png"));

    expect(screen.getByText("Uploading Files")).toBeInTheDocument();
    expect(screen.getByText("sunset.png")).toBeInTheDocument();
  });

  it("calls the onUpload callback with the dropped files", async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn();
    render(<UploadZone onUpload={onUpload} />);

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = createImageFile("beach.png");
    await user.upload(input, file);

    expect(onUpload).toHaveBeenCalledTimes(1);
    expect(onUpload.mock.calls[0][0][0].name).toBe("beach.png");
  });

  it("transitions a file from uploading to success after the upload completes", async () => {
    const user = userEvent.setup();
    render(<UploadZone />);

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    await user.upload(input, createImageFile("forest.png"));

    // The simulated upload completes after 2 seconds.
    await waitFor(
      () => {
        expect(screen.getByText("Upload complete")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("removes a file card when the remove button is clicked", async () => {
    const user = userEvent.setup();
    render(<UploadZone />);

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    await user.upload(input, createImageFile("remove-me.png"));

    expect(screen.getByText("remove-me.png")).toBeInTheDocument();

    // The remove button is the only button rendered on the file card.
    const removeButton = screen.getByRole("button");
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText("remove-me.png")).not.toBeInTheDocument();
    });
  });
});
