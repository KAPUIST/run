'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';

interface PhotoUploaderProps {
  preview: string | null;
  onFileSelect: (file: File, preview: string) => void;
}

export default function PhotoUploader({ preview, onFileSelect }: PhotoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    onFileSelect(file, url);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all cursor-pointer min-h-[300px] ${
        isDragging
          ? 'border-[var(--accent-primary)] bg-[rgba(255,77,0,0.05)]'
          : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--text-dim)]'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      {preview ? (
        <div className="relative w-full max-w-[280px] rounded-xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="업로드된 사진" className="w-full h-auto rounded-xl" />
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white/80 font-mono">
            탭하여 변경
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[rgba(255,77,0,0.08)] border border-[rgba(255,77,0,0.15)] flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <div>
            <p className="text-[var(--text-primary)] font-bold mb-1">러닝 사진을 올려주세요</p>
            <p className="text-[var(--text-secondary)] text-sm font-light">
              드래그하거나 탭하여 업로드
            </p>
          </div>
          <p className="text-[var(--text-dim)] text-xs font-mono">JPG, PNG, WEBP</p>
        </div>
      )}
    </div>
  );
}
