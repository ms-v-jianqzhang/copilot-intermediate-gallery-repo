'use client';

import { Eye, Edit, Trash2 } from "lucide-react";
import { SectionTitle } from "./SectionTitle";

/** Visibility/type label shown for a gallery. */
export type GalleryType = "Client Review" | "Public" | "Portfolio" | "Draft";

/** Publication state shown for a gallery. */
export type GalleryStatus = "Active" | "Published" | "Draft";

/** A single row in the galleries table. */
export interface GalleryRow {
  id: number | string;
  name: string;
  type: GalleryType;
  photos: number;
  views: number;
  status: GalleryStatus;
  lastUpdated: string;
}

/** Props for {@link GalleriesTable}. */
export interface GalleriesTableProps {
  /** Galleries to render, one per row. */
  galleries: readonly GalleryRow[];
  /** Optional section heading; omit to render only the table. */
  title?: string;
  /** Optional "View All" link shown beside the title. */
  viewAllLink?: string;
  /** Called when the view, edit or delete button of a row is pressed. */
  onView?: (gallery: GalleryRow) => void;
  onEdit?: (gallery: GalleryRow) => void;
  onDelete?: (gallery: GalleryRow) => void;
  /** Message shown when `galleries` is empty. */
  emptyMessage?: string;
  className?: string;
}

const TYPE_BADGE: Record<GalleryType, string> = {
  "Client Review": "status-private",
  Public: "status-active",
  Portfolio: "status-private",
  Draft: "status-draft",
};

const STATUS_BADGE: Record<GalleryStatus, string> = {
  Active: "status-active",
  Published: "status-active",
  Draft: "status-draft",
};

const COLUMNS = ["Gallery Name", "Type", "Photos", "Views", "Status", "Last Updated", "Actions"] as const;

/**
 * Responsive, dark-mode aware table of galleries with optional row actions.
 *
 * @example
 * <SectionContainer>
 *   <GalleriesTable title="Recent Galleries" viewAllLink="/admin/galleries" galleries={recentGalleries} />
 * </SectionContainer>
 */
export function GalleriesTable({
  galleries,
  title,
  viewAllLink,
  onView,
  onEdit,
  onDelete,
  emptyMessage = "No galleries yet",
  className = "",
}: GalleriesTableProps) {
  return (
    <div className={className}>
      {title && <SectionTitle title={title} viewAllLink={viewAllLink} />}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <caption className="sr-only">{title ?? "Galleries"}</caption>
            <thead className="bg-slate-50 dark:bg-slate-700">
              <tr>
                {COLUMNS.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="text-left py-3 px-6 font-medium text-slate-700 dark:text-slate-300"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {galleries.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length} className="py-8 px-6 text-center text-slate-500 dark:text-slate-400">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                galleries.map((gallery) => (
                  <tr key={gallery.id} className="table-row">
                    <th scope="row" className="py-4 px-6 text-left font-medium text-slate-900 dark:text-white">
                      {gallery.name}
                    </th>
                    <td className="py-4 px-6">
                      <span className={`status-badge ${TYPE_BADGE[gallery.type]}`}>{gallery.type}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{gallery.photos}</td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                      {gallery.views.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`status-badge ${STATUS_BADGE[gallery.status]}`}>{gallery.status}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{gallery.lastUpdated}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onView?.(gallery)}
                          aria-label={`View ${gallery.name}`}
                          className="btn-icon"
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit?.(gallery)}
                          aria-label={`Edit ${gallery.name}`}
                          className="btn-icon btn-icon-success"
                        >
                          <Edit className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete?.(gallery)}
                          aria-label={`Delete ${gallery.name}`}
                          className="btn-icon btn-icon-danger"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
