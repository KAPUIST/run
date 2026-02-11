'use client';

import { useEffect, useRef } from 'react';

export default function BackgroundEffects() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const count = 8;
    for (let i = 0; i < count; i++) {
      const line = document.createElement('div');
      line.classList.add('speed-line');
      line.style.top = `${Math.random() * 100}%`;
      line.style.width = `${150 + Math.random() * 300}px`;
      line.style.animationDelay = `${Math.random() * 6}s`;
      line.style.animationDuration = `${3 + Math.random() * 4}s`;
      grid.appendChild(line);
    }
  }, []);

  return (
    <>
      <div className="bg-grid" ref={gridRef}></div>
      <div className="glow-orb glow-orb--orange"></div>
    </>
  );
}
