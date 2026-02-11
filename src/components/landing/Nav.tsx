'use client';

import { useEffect } from 'react';

export default function Nav() {
  useEffect(() => {
    let lastScroll = 0;
    const handleScroll = () => {
      const nav = document.querySelector('nav');
      if (!nav) return;
      const current = window.scrollY;
      nav.style.borderBottomColor =
        current > 50 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.04)';
      lastScroll = current;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav>
      <a href="/" className="nav-logo">
        <span className="logo-accent">뛰</span>어<span className="logo-dot"></span>
      </a>
      <span className="nav-tag">BETA</span>
    </nav>
  );
}
