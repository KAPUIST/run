'use client';

import { useEffect, useRef } from 'react';

const STEPS = [
  {
    number: '01',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    title: '러닝 사진 업로드',
    desc: '러닝 중 찍은 사진을 올려주세요. 셀카, 신발, 풍경 어떤 사진이든 OK.',
  },
  {
    number: '02',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    title: 'AI 스타일 선택',
    desc: '만화, 고양이 변신, 매거진 커버, 크레용 그림 등 재밌는 AI 스타일을 고르세요.',
  },
  {
    number: '03',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    title: '저장하고 자랑하기',
    desc: 'AI가 만든 재밌는 인증 이미지를 저장하고 인스타 스토리에 바로 공유하세요.',
  },
];

export default function HowItWorks() {
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
    <section className="how-section" id="how" ref={sectionRef}>
      <div className="section-inner">
        <span className="section-label reveal">how it works</span>
        <h2 className="section-title reveal">
          사진 1장 → AI 인증샷<br />30초면 끝
        </h2>
        <p className="section-desc reveal">편집 앱도, 디자인 감각도 필요 없습니다.</p>

        <div className="how-grid">
          {STEPS.map((step, i) => (
            <div key={step.number} className={`how-card reveal reveal-delay-${i + 1}`}>
              <div className="how-number">{step.number}</div>
              <div className="how-icon">{step.icon}</div>
              <h3 className="how-card-title">{step.title}</h3>
              <p className="how-card-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
