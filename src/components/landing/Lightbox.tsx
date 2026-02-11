'use client';

import { useEffect, useCallback } from 'react';

interface LightboxProps {
  isOpen: boolean;
  currentSrc: string;
  currentName: string;
  onClose: () => void;
  onNav: (direction: number) => void;
}

export default function Lightbox({ isOpen, currentSrc, currentName, onClose, onNav }: LightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNav(-1);
      if (e.key === 'ArrowRight') onNav(1);
    },
    [isOpen, onClose, onNav]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <div
      className={`lightbox${isOpen ? ' open' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button className="lightbox-close" onClick={onClose} aria-label="닫기">
        &times;
      </button>
      <button
        className="lightbox-nav lightbox-prev"
        onClick={(e) => {
          e.stopPropagation();
          onNav(-1);
        }}
        aria-label="이전"
      >
        &lsaquo;
      </button>
      {currentSrc && (
        <img
          className="lightbox-img"
          src={currentSrc}
          alt={currentName}
        />
      )}
      <button
        className="lightbox-nav lightbox-next"
        onClick={(e) => {
          e.stopPropagation();
          onNav(1);
        }}
        aria-label="다음"
      >
        &rsaquo;
      </button>
      <div className="lightbox-caption">{currentName}</div>
    </div>
  );
}
