'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const SLIDES = [
  { src: '/images/style-webtoon.png', name: '웹툰 스타일' },
  { src: '/images/style-catface.png', name: '고양이 변신' },

  { src: '/images/style-magazine.png', name: '매거진 커버' },
  { src: '/images/style-pixel.png', name: '픽셀아트' },
  { src: '/images/style-crayon.png', name: '크레용 그림' },
];

interface HeroProps {
  onOpenLightbox: (src: string, name: string) => void;
}

export default function Hero({ onOpenLightbox }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startXRef = useRef(0);
  const draggingRef = useRef(false);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const resetInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(nextSlide, 3000);
  }, [nextSlide]);

  useEffect(() => {
    intervalRef.current = setInterval(nextSlide, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [nextSlide]);

  const handleDotClick = (index: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    goToSlide(index);
    resetInterval();
  };

  const handleSwipe = (diff: number) => {
    if (Math.abs(diff) > 40) {
      const next = (currentSlide + (diff > 0 ? 1 : -1) + SLIDES.length) % SLIDES.length;
      goToSlide(next);
    } else {
      onOpenLightbox(SLIDES[currentSlide].src, SLIDES[currentSlide].name);
    }
    resetInterval();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.changedTouches[0].screenX;
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = startXRef.current - e.changedTouches[0].screenX;
    handleSwipe(diff);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    draggingRef.current = true;
    startXRef.current = e.clientX;
    if (intervalRef.current) clearInterval(intervalRef.current);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      const diff = startXRef.current - e.clientX;
      handleSwipe(diff);
    };
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  });

  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-text">
          <div className="hero-eyebrow">ai running proof maker</div>
          <h1 className="hero-title">
            매번 똑같은<br />
            러닝 인증,<br />
            <span className="accent">이제 그만.</span>
          </h1>
          <p className="hero-desc">
            러닝 사진 한 장만 올리면,<br />
            AI가 웹툰·매거진·고양이 변신 등<br />
            <strong style={{ color: 'var(--text-primary)' }}>나만의 인증 이미지</strong>를 만들어줍니다.
          </p>
          <div className="hero-cta">
            <a href="/create" className="btn-primary">
              지금 만들어보기
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3.5 8h9m0 0L9 4.5M12.5 8 9 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="#how" className="btn-secondary">어떻게 작동하나요?</a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="phone-frame">
            <div className="phone-notch"></div>
            <div
              className="phone-screen"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
            >
              <div className="phone-slideshow">
                {SLIDES.map((slide, i) => (
                  <img
                    key={slide.src}
                    src={slide.src}
                    className={`phone-slide${i === currentSlide ? ' active' : ''}`}
                    alt={slide.name}
                  />
                ))}
              </div>
              <div className="phone-slide-label">{SLIDES[currentSlide].name}</div>
              <div className="phone-slide-indicator">
                {SLIDES.map((_, i) => (
                  <span
                    key={i}
                    className={`slide-dot${i === currentSlide ? ' active' : ''}`}
                    onClick={() => handleDotClick(i)}
                  ></span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
