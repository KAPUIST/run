'use client';

import { STYLE_CONFIGS } from '@/lib/styles';

// UI 전용 메타데이터 (STYLE_CONFIGS에 없는 표시용 정보)
const STYLE_UI_META: Record<string, { emoji: string }> = {
  crayon:         { emoji: '🖍️' },
  catface:        { emoji: '🐱' },
  gta:            { emoji: '🔫' },
  pixel:          { emoji: '👾' },
  magazine:       { emoji: '📰' },
  manhwa:         { emoji: '📖' },
  receipt:        { emoji: '🧾' },
  film:           { emoji: '🎞️' },
};

// STYLE_CONFIGS에서 동적 생성 — 스타일 추가/삭제 시 자동 반영
const STYLE_OPTIONS = Object.entries(STYLE_CONFIGS).map(([id, config]) => ({
  id,
  name: config.name,
  ...(STYLE_UI_META[id] || { emoji: '🎨' }),
}));

interface StyleSelectorProps {
  selectedStyle: string | null;
  onSelect: (styleId: string) => void;
}

export default function StyleSelector({ selectedStyle, onSelect }: StyleSelectorProps) {
  return (
    <div>
      <h3 className="text-[var(--text-primary)] font-bold text-lg mb-4">AI 스타일 선택</h3>
      <div className="grid grid-cols-4 gap-2.5">
        {STYLE_OPTIONS.map((style) => (
          <button
            key={style.id}
            onClick={() => onSelect(style.id)}
            className={`relative rounded-xl overflow-hidden border-2 transition-all ${
              selectedStyle === style.id
                ? 'border-[var(--accent-primary)] shadow-[0_0_20px_rgba(255,77,0,0.2)] bg-[rgba(255,77,0,0.08)]'
                : 'border-[var(--border)] hover:border-[var(--text-dim)] bg-[var(--bg-card)]'
            }`}
          >
            <div className="flex flex-col items-center gap-2 py-5 px-2">
              <span className="text-3xl">{style.emoji}</span>
              <span className="text-xs font-bold text-[var(--text-primary)]">{style.name}</span>
            </div>
            {selectedStyle === style.id && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--accent-primary)] flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l3.5 3.5L13 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
