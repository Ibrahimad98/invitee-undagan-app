'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPages = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push('ellipsis');
    }

    // Show pages around current
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis');
    }

    // Always show last page
    pages.push(totalPages);

    return pages;
  };

  const pages = getPages();

  return (
    <nav className={cn('flex items-center justify-center gap-1', className)} aria-label="Pagination">
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={cn(
          'inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm transition-colors',
          currentPage <= 1
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100',
        )}
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Pages */}
      {pages.map((page, idx) =>
        page === 'ellipsis' ? (
          <span
            key={`ellipsis-${idx}`}
            className="inline-flex items-center justify-center w-9 h-9 text-gray-400"
          >
            <MoreHorizontal className="w-4 h-4" />
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              'inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-colors',
              page === currentPage
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100',
            )}
            aria-label={`Halaman ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ),
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={cn(
          'inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm transition-colors',
          currentPage >= totalPages
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100',
        )}
        aria-label="Halaman berikutnya"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
