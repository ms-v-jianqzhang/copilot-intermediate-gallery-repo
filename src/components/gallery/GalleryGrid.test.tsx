import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GalleryGrid } from "./GalleryGrid";
import { mockPhotos } from "@/lib/mock-photo-data";

describe("GalleryGrid", () => {
  it("renders no more photos than the provided limit", () => {
    render(<GalleryGrid limit={3} currentPage={1} />);

    // Each photo card exposes its title as a heading.
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(3);
  });

  it("expands the number of displayed photos based on currentPage", () => {
    render(<GalleryGrid limit={3} currentPage={2} />);

    // currentPage * limit = 6 photos shown.
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(6);
  });

  it("renders the first photo's title from the mock data", () => {
    render(<GalleryGrid limit={6} currentPage={1} />);

    expect(screen.getByText(mockPhotos[0].title)).toBeInTheDocument();
  });

  it("filters photos by selected tags", () => {
    render(
      <GalleryGrid limit={9} currentPage={1} selectedTags={["landscape"]} />
    );

    const headings = screen.getAllByRole("heading", { level: 3 });
    const expected = mockPhotos.filter((p) => p.tags.includes("landscape"));

    expect(headings).toHaveLength(expected.length);
    expect(screen.getByText("Sunset Landscape")).toBeInTheDocument();
    expect(screen.getByText("Mountain Vista")).toBeInTheDocument();
    expect(screen.queryByText("Portrait Study")).not.toBeInTheDocument();
  });

  it("filters photos by search query matching the title", () => {
    render(<GalleryGrid limit={9} currentPage={1} searchQuery="portrait" />);

    // Matches "Portrait Study" (title) and "Wildlife Portrait" (title),
    // plus any photo tagged "portrait".
    expect(screen.getByText("Portrait Study")).toBeInTheDocument();
    expect(screen.getByText("Wildlife Portrait")).toBeInTheDocument();
    expect(screen.queryByText("Architecture")).not.toBeInTheDocument();
  });

  it("filters photos by search query matching the photographer", () => {
    render(<GalleryGrid limit={9} currentPage={1} searchQuery="jane smith" />);

    expect(screen.getByText("Portrait Study")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(1);
  });

  it("shows an empty state when no photos match the filters", () => {
    render(
      <GalleryGrid limit={9} currentPage={1} searchQuery="no-such-photo-xyz" />
    );

    expect(
      screen.getByText("No photos match your filters")
    ).toBeInTheDocument();
    // No photo cards should be rendered (titles come from the mock data).
    expect(screen.queryByText(mockPhotos[0].title)).not.toBeInTheDocument();
  });

  it("shows the Load More button only when there are more photos and a handler", () => {
    const onLoadMore = vi.fn();
    render(
      <GalleryGrid limit={3} currentPage={1} onLoadMore={onLoadMore} />
    );

    const button = screen.getByRole("button", { name: /load more photos/i });
    expect(button).toBeInTheDocument();
    expect(
      screen.getByText(/showing 3 of \d+ photos/i)
    ).toBeInTheDocument();
  });

  it("does not show Load More when all photos are displayed", () => {
    render(
      <GalleryGrid limit={mockPhotos.length} currentPage={1} onLoadMore={vi.fn()} />
    );

    expect(
      screen.queryByRole("button", { name: /load more photos/i })
    ).not.toBeInTheDocument();
  });

  it("invokes onLoadMore when the Load More button is clicked", async () => {
    const user = userEvent.setup();
    const onLoadMore = vi.fn();
    render(<GalleryGrid limit={3} currentPage={1} onLoadMore={onLoadMore} />);

    await user.click(screen.getByRole("button", { name: /load more photos/i }));

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("increments the displayed like count when a photo is liked", async () => {
    const user = userEvent.setup();
    render(<GalleryGrid limit={1} currentPage={1} />);

    const firstPhoto = mockPhotos[0];
    const card = screen.getByText(firstPhoto.title).closest("div.group");
    expect(card).not.toBeNull();

    const scopedCard = within(card as HTMLElement);
    expect(scopedCard.getByText(String(firstPhoto.likes))).toBeInTheDocument();

    // Buttons in DOM order: "View Details", like, download, share.
    // The like button is the second button in the card.
    const buttons = scopedCard.getAllByRole("button");
    await user.click(buttons[1]);

    expect(
      scopedCard.getByText(String(firstPhoto.likes + 1))
    ).toBeInTheDocument();
  });
});
