'use client';

import { Eye, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * A single row of data rendered by {@link GalleryTable}.
 */
export interface GalleryTableRow {
  /** Unique identifier for the gallery. */
  id: number | string;
  /** Display name of the gallery. */
  name: string;
  /** Gallery type (e.g. "Client Review", "Public", "Portfolio"). */
  type: string;
  /** Number of photos contained in the gallery. */
  photos: number;
  /** Total number of views the gallery has received. */
  views: number;
  /** Current status (e.g. "Active", "Published", "Draft"). */
  status: string;
  /** Human-readable "last updated" label (e.g. "2 hours ago"). */
  lastUpdated: string;
}

/**
 * Props for the {@link GalleryTable} component.
 */
export interface GalleryTableProps {
  /** The rows to render in the table. */
  galleries: GalleryTableRow[];
  /** Optional additional class names applied to the outer container. */
  className?: string;
  /** Message shown when there are no galleries to display. */
  emptyMessage?: string;
  /** Invoked when the view action is triggered for a row. */
  onView?: (gallery: GalleryTableRow) => void;
  /** Invoked when the edit action is triggered for a row. */
  onEdit?: (gallery: GalleryTableRow) => void;
  /** Invoked when the delete action is triggered for a row. */
  onDelete?: (gallery: GalleryTableRow) => void;
}

const COLUMN_HEADERS = [
  'Gallery Name',
  'Type',
  'Photos',
  'Views',
  'Status',
  'Last Updated',
  'Actions',
] as const;

/** Maps a gallery type to its status-badge modifier class. */
function getTypeBadgeClass(type: string): string {
  switch (type) {
    case 'Public':
      return 'status-active';
    case 'Client Review':
    case 'Portfolio':
      return 'status-private';
    default:
      return 'status-draft';
  }
}

/** Maps a gallery status to its status-badge modifier class. */
function getStatusBadgeClass(status: string): string {
  return status === 'Active' || status === 'Published'
    ? 'status-active'
    : 'status-draft';
}

/**
 * A reusable, responsive table for displaying gallery summaries.
 *
 * Renders a horizontally-scrollable, dark-mode aware table with animated rows
 * and optional per-row view/edit/delete actions. Designed to be a drop-in
 * replacement for the inline "Recent Galleries" table on the admin dashboard,
 * but generic enough to reuse anywhere a list of galleries is shown.
 *
 * @example
 * ```tsx
 * <SectionContainer>
 *   <SectionTitle title="Recent Galleries" viewAllLink="/admin/galleries" />
 *   <GalleryTable
 *     galleries={recentGalleries}
 *     onView={(gallery) => console.log('view', gallery.id)}
 *   />
 * </SectionContainer>
 * ```
 */
export function GalleryTable({
  galleries,
  className = '',
  emptyMessage = 'No galleries to display yet.',
  onView,
  onEdit,
  onDelete,
}: GalleryTableProps) {
  if (galleries.length === 0) {
    return (
      <div className={`card-base p-8 text-center ${className}`}>
        <p className="text-slate-500 dark:text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`card-base overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <caption className="sr-only">Recent galleries</caption>
          <thead className="bg-slate-50 dark:bg-slate-700">
            <tr>
              {COLUMN_HEADERS.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="text-left py-3 px-6 font-medium text-slate-700 dark:text-slate-300"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {galleries.map((gallery, index) => (
              <motion.tr
                key={gallery.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="table-row"
              >
                <td className="py-4 px-6">
                  <div className="font-medium text-slate-900 dark:text-white">
                    {gallery.name}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`status-badge ${getTypeBadgeClass(gallery.type)}`}>
                    {gallery.type}
                  </span>
                </td>
                <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                  {gallery.photos}
                </td>
                <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                  {gallery.views.toLocaleString()}
                </td>
                <td className="py-4 px-6">
                  <span className={`status-badge ${getStatusBadgeClass(gallery.status)}`}>
                    {gallery.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                  {gallery.lastUpdated}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onView?.(gallery)}
                      aria-label={`View ${gallery.name}`}
                      className="btn-icon"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit?.(gallery)}
                      aria-label={`Edit ${gallery.name}`}
                      className="btn-icon btn-icon-success"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete?.(gallery)}
                      aria-label={`Delete ${gallery.name}`}
                      className="btn-icon btn-icon-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
