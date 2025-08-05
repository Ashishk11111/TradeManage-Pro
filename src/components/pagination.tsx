import React from 'react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  totalPages,
  currentPage,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={`flex  gap-2 flex-wrap mt-4 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous Page"
      >
        Prev
      </Button>

      {pages.map((page) => (
        <Button
          key={page}
          size="sm"
          variant={page === currentPage ? 'default' : 'outline'}
          onClick={() => onPageChange(page)}
          aria-current={page === currentPage ? 'page' : undefined}
          aria-label={`Page ${page}`}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next Page"
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;
