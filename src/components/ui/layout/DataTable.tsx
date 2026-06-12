'use client';

import { ReactNode } from "react";
import { motion } from "framer-motion";

/**
 * Horizontal alignment options for a table column.
 */
export type DataTableAlign = "left" | "center" | "right";

/**
 * Describes a single column in a {@link DataTable}.
 *
 * @typeParam T - The shape of a single row of data.
 */
export interface DataTableColumn<T> {
  /** Stable key used for React reconciliation and as a fallback value accessor. */
  key: string;
  /** Text rendered in the column header. */
  header: string;
  /** Horizontal alignment for both header and cells. Defaults to `"left"`. */
  align?: DataTableAlign;
  /** Optional extra classes applied to each body cell in this column. */
  className?: string;
  /**
   * Custom cell renderer. When omitted, the value at `row[key]` is rendered
   * as-is (it must be a valid `ReactNode`).
   */
  render?: (row: T) => ReactNode;
}

/**
 * Props for the generic, reusable {@link DataTable} component.
 *
 * @typeParam T - The shape of a single row of data.
 */
export interface DataTableProps<T> {
  /** Column definitions describing headers and how each cell renders. */
  columns: ReadonlyArray<DataTableColumn<T>>;
  /** The rows to display. */
  data: ReadonlyArray<T>;
  /** Returns a stable, unique key for a given row. */
  rowKey: (row: T) => string | number;
  /** Optional accessible caption for the table (visually hidden). */
  caption?: string;
  /** Message shown when `data` is empty. Defaults to `"No data available."`. */
  emptyMessage?: string;
  /** Extra classes applied to the outer wrapper. */
  className?: string;
}

const alignmentClass: Record<DataTableAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

/**
 * A generic, reusable table component that follows the project's layout and
 * styling conventions (card surface, dark mode, responsive horizontal scroll,
 * and subtle Framer Motion row animations).
 *
 * Columns are fully data-driven via {@link DataTableColumn.render}, so the same
 * component can power the admin "Recent Galleries" table or any other tabular
 * data set.
 *
 * @example
 * ```tsx
 * <DataTable
 *   caption="Recent Galleries"
 *   data={recentGalleries}
 *   rowKey={(gallery) => gallery.id}
 *   columns={[
 *     { key: "name", header: "Gallery Name", render: (g) => g.name },
 *     { key: "photos", header: "Photos", render: (g) => g.photos },
 *   ]}
 * />
 * ```
 */
export function DataTable<T>({
  columns,
  data,
  rowKey,
  caption,
  emptyMessage = "No data available.",
  className = "",
}: DataTableProps<T>) {
  return (
    <div className={`card-base overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className="bg-slate-50 dark:bg-slate-700">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`py-3 px-6 font-medium text-slate-700 dark:text-slate-300 ${
                    alignmentClass[column.align ?? "left"]
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-8 px-6 text-center text-slate-500 dark:text-slate-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <motion.tr
                  key={rowKey(row)}
                  className="table-row"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`py-4 px-6 ${alignmentClass[column.align ?? "left"]} ${
                        column.className ?? ""
                      }`}
                    >
                      {column.render
                        ? column.render(row)
                        : ((row as Record<string, ReactNode>)[column.key] ?? null)}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
