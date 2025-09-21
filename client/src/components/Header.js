import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './ui/Button';

const Header = () => {
  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add('dark'); else root.classList.remove('dark');
  }, [dark]);

  const search = () => {
    if (!query.trim()) return;
    window.location.href = `/question-bank?q=${encodeURIComponent(query.trim())}`;
  };

  // Hidden header for pages using the left rail layout
  return null;
};

export default Header;
