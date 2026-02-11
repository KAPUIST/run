'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PhotoUploader from '@/components/create/PhotoUploader';
import StyleSelector from '@/components/create/StyleSelector';
import StatsInput, { type RunStats } from '@/components/create/StatsInput';

const LOADING_MESSAGES = [
  'AI가 붓을 들었어요',
  '색을 고르는 중...',
  '열심히 그리는 중...',
  '거의 다 됐어요!',
];

export default function CreatePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [stats, setStats] = useState<RunStats>({ distance: '', pace: '', time: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function handleFileSelect(selectedFile: File, previewUrl: string) {
    setFile(selectedFile);
    setPreview(previewUrl);
    setError(null);
  }

  async function handleGenerate() {
    if (!file || !selectedStyle) return;
    setIsGenerating(true);
    setError(null);
    setLoadingMsg(0);

    // 메시지 순환
    const msgInterval = setInterval(() => {
      setLoadingMsg((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 4000);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('style', selectedStyle);
      formData.append('distance', stats.distance || '5.0');
      formData.append('pace', stats.pace || "5'30\"");
      formData.append('time', stats.time || '27:30');

      const res = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      clearInterval(msgInterval);

      if (!res.ok) {
        setError(data.error || '생성에 실패했습니다.');
        setIsGenerating(false);
        return;
      }

      sessionStorage.setItem('generated-image', data.url);
      router.push(`/result?style=${selectedStyle}`);
    } catch (err) {
      clearInterval(msgInterval);
      console.error('Generate failed:', err);
      setError('네트워크 오류가 발생했습니다.');
      setIsGenerating(false);
    }
  }

  const canGenerate = file && selectedStyle && !isGenerating;

  return (
    <div className="min-h-screen bg-[var(--bg-deep)]">
      {/* Fullscreen Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-[100] bg-[rgba(7,7,11,0.92)] backdrop-blur-md flex flex-col items-center justify-center gap-6">
          {/* Running figure animation */}
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-[3px] border-[var(--accent-primary)]/20" />
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[var(--accent-primary)] animate-spin" />
            <span className="absolute inset-0 flex items-center justify-center text-3xl animate-bounce">
              🏃
            </span>
          </div>
          <div className="text-center">
            <p className="text-[var(--text-primary)] font-bold text-lg mb-2">
              {LOADING_MESSAGES[loadingMsg]}
            </p>
            <p className="text-[var(--text-dim)] text-sm font-mono">
              보통 10~30초 정도 걸려요
            </p>
          </div>
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-[var(--accent-primary)]"
                style={{
                  animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                  opacity: 0.3,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-50 bg-[rgba(7,7,11,0.8)] backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="nav-logo text-base">
            <span className="logo-accent">뛰</span>어<span className="logo-dot"></span>
          </Link>
          <span className="font-mono text-xs text-[var(--text-dim)]">AI 인증샷 만들기</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-5 py-8 flex flex-col gap-8">
        {/* Step 1: Photo */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="font-mono text-xs text-[var(--accent-primary)] tracking-widest">01</span>
            <span className="h-px flex-1 bg-[var(--border)]"></span>
          </div>
          <PhotoUploader preview={preview} onFileSelect={handleFileSelect} />
        </div>

        {/* Step 2: Stats */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="font-mono text-xs text-[var(--accent-primary)] tracking-widest">02</span>
            <span className="h-px flex-1 bg-[var(--border)]"></span>
          </div>
          <StatsInput stats={stats} onChange={setStats} />
        </div>

        {/* Step 3: Style */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="font-mono text-xs text-[var(--accent-primary)] tracking-widest">03</span>
            <span className="h-px flex-1 bg-[var(--border)]"></span>
          </div>
          <StyleSelector selectedStyle={selectedStyle} onSelect={setSelectedStyle} />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="btn-primary w-full justify-center text-base py-4 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
        >
          생성하기
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3.5 8h9m0 0L9 4.5M12.5 8 9 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
