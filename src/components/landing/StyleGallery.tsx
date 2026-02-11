'use client';

import { useEffect, useRef } from 'react';

export const STYLES = [
  { src: '/images/style-webtoon.png', name: '웹툰 스타일', tag: 'Webtoon', tagClass: '' },
  { src: '/images/style-catface.png', name: '고양이 변신', tag: 'Cat', tagClass: '' },
  { src: '/images/style-magazine.png', name: '매거진 커버', tag: 'Magazine', tagClass: '' },
  { src: '/images/style-pixel.png', name: '픽셀아트', tag: 'Pixel', tagClass: '' },
  { src: '/images/style-crayon.png', name: '크레용 그림', tag: 'Crayon', tagClass: '' },
];

interface StyleGalleryProps {
  onOpenLightbox: (src: string, name: string) => void;
}

export default function StyleGallery({ onOpenLightbox }: StyleGalleryProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const els = sectionRef.current?.querySelectorAll('.reveal');
    if (!els) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="preview-section" ref={sectionRef}>
      <div className="section-inner">
        <span className="section-label reveal">ai styles</span>
        <h2 className="section-title reveal">같은 사진, 완전히 다른 느낌</h2>
        <p className="section-desc reveal">
          AI 스타일 하나면 평범한 러닝 사진이<br />올리고 싶은 인증샷으로 바뀝니다.
        </p>
      </div>

      <div className="tpl-scroll-wrap">
        <div className="tpl-gallery">
          {STYLES.map((style, i) => (
            <div key={style.name} className={`tpl-card reveal${i > 0 ? ` reveal-delay-${Math.min(i, 3)}` : ''}`}>
              <div className="tpl-phone">
                <div className="tpl-screen tpl-screen--img">
                  <img
                    src={style.src}
                    className="tpl-img"
                    alt={style.name}
                    loading="lazy"
                    onClick={() => onOpenLightbox(style.src, style.name)}
                  />
                  <span className="tpl-style-badge">AI Generated</span>
                </div>
              </div>
              <div className="tpl-meta">
                <span className="tpl-name">{style.name}</span>
                <span className={`tpl-tag ${style.tagClass}`}>{style.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="tpl-scroll-hint">
        <span>← 스와이프하여 더 보기 →</span>
      </div>
    </section>
  );
}
