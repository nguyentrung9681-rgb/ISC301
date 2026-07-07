import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) {
        end = 4;
      } else if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
      }

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="pagination-container" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      marginTop: '24px',
      marginBottom: '24px'
    }}>
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-btn"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          border: '1px solid var(--border-light, #e0e0e0)',
          backgroundColor: '#fff',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          opacity: currentPage === 1 ? 0.5 : 1,
          color: 'var(--secondary, #333)',
          transition: 'all 0.2s'
        }}
      >
        <ChevronLeft size={16} />
      </button>

      {getPageNumbers().map((page, index) => {
        const isCurrent = page === currentPage;
        const isEllipsis = page === '...';

        return (
          <button
            key={index}
            type="button"
            disabled={isEllipsis}
            onClick={() => !isEllipsis && onPageChange(page)}
            className={`pagination-btn ${isCurrent ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '36px',
              height: '36px',
              padding: '0 6px',
              borderRadius: '8px',
              border: isEllipsis ? 'none' : '1px solid ' + (isCurrent ? 'var(--primary)' : 'var(--border-light, #e0e0e0)'),
              backgroundColor: isCurrent ? 'var(--primary)' : isEllipsis ? 'transparent' : '#fff',
              color: isCurrent ? '#fff' : 'var(--secondary, #333)',
              fontWeight: isCurrent ? 'bold' : 'normal',
              cursor: isEllipsis ? 'default' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: isCurrent ? '0 2px 4px rgba(255, 87, 34, 0.2)' : 'none'
            }}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-btn"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          border: '1px solid var(--border-light, #e0e0e0)',
          backgroundColor: '#fff',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          opacity: currentPage === totalPages ? 0.5 : 1,
          color: 'var(--secondary, #333)',
          transition: 'all 0.2s'
        }}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
