import React from 'react';

const sizeClass = (size) => {
  switch (size) {
    case 'sm': return 'w-5 h-5';
    case 'lg': return 'w-10 h-10';
    case 'xl': return 'w-12 h-12';
    default: return 'w-6 h-6';
  }
};

export function IconPlane({ className = '', size = 'md', ...props }) {
  return (
    <svg className={`${sizeClass(size)} ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}

export function IconClipboard({ className = '', size = 'md', ...props }) {
  return (
    <svg className={`${sizeClass(size)} ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );
}

export function IconBook({ className = '', size = 'md', ...props }) {
  return (
    <svg className={`${sizeClass(size)} ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

export function IconLibrary({ className = '', size = 'md', ...props }) {
  return (
    <svg className={`${sizeClass(size)} ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
    </svg>
  );
}

export function IconDocument({ className = '', size = 'md', ...props }) {
  return (
    <svg className={`${sizeClass(size)} ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

export function IconChart({ className = '', size = 'md', ...props }) {
  return (
    <svg className={`${sizeClass(size)} ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

export function IconCheck({ className = '', size = 'md', ...props }) {
  return (
    <svg className={`${sizeClass(size)} ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function IconEmail({ className = '', size = 'md', ...props }) {
  return (
    <svg className={`${sizeClass(size)} ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

export function IconTarget({ className = '', size = 'md', ...props }) {
  return (
    <svg className={`${sizeClass(size)} ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export function IconQuestion({ className = '', size = 'md', ...props }) {
  return (
    <svg className={`${sizeClass(size)} ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export function IconPencil({ className = '', size = 'md', ...props }) {
  return (
    <svg className={`${sizeClass(size)} ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}

export function IconChevronRight({ className = '', size = 'md', ...props }) {
  return (
    <svg className={`${sizeClass(size)} ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function IconSearch({ className = '', size = 'md', ...props }) {
  return (
    <svg className={`${sizeClass(size)} ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

export function IconFolder({ className = '', size = 'md', ...props }) {
  return (
    <svg className={`${sizeClass(size)} ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}
