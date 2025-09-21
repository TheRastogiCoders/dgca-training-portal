import React from 'react';
import Button from './Button';

const Pagination = ({ page = 1, pages = 1, onChange }) => {
  if (pages <= 1) return null;
  const canPrev = page > 1;
  const canNext = page < pages;
  const go = (p) => onChange?.(Math.min(Math.max(1, p), pages));
  return (
    <div className="flex items-center justify-between mt-4">
      <Button variant="outline" size="sm" disabled={!canPrev} onClick={() => go(page - 1)}>Previous</Button>
      <div className="text-sm text-gray-600">Page {page} of {pages}</div>
      <Button variant="outline" size="sm" disabled={!canNext} onClick={() => go(page + 1)}>Next</Button>
    </div>
  );
};

export default Pagination;


