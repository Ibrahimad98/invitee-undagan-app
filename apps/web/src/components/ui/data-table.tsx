"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  skeletonRows?: number;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  className?: string;
  onRowClick?: (row: T, index: number) => void;
}

function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  skeletonRows = 5,
  emptyMessage = "No data available",
  emptyIcon,
  className,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className={cn("w-full overflow-auto rounded-lg border border-gray-200", className)}>
      <table className="w-full caption-bottom text-sm">
        <thead className="border-b bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "h-12 px-4 text-left align-middle font-medium text-gray-500",
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="h-32 text-center text-gray-500"
              >
                <div className="flex flex-col items-center justify-center gap-2 py-8">
                  {emptyIcon}
                  <p>{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row, rowIndex)}
                className={cn(
                  "border-b transition-colors hover:bg-gray-50",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn("px-4 py-3 align-middle", column.className)}
                  >
                    {column.render
                      ? column.render(row, rowIndex)
                      : (row[column.key] as React.ReactNode) ?? "—"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export { DataTable };
