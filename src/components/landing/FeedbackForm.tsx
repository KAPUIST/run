'use client';

import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';

export default function FeedbackForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (localStorage.getItem('ttwi-feedback')) {
      setStatus('success');
    }
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('loading');

    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          text: text.trim() || null,
        });

      if (error) {
        console.error('Feedback error:', error);
        setStatus('error');
        return;
      }
    } catch (err) {
      console.error('Feedback failed:', err);
      setStatus('error');
      return;
    }

    localStorage.setItem('ttwi-feedback', 'true');
    setStatus('success');
  }

  return (
    <section
      id="feedback"
      style={{
        borderTop: '1px solid var(--border)',
        background: 'linear-gradient(180deg, transparent, rgba(255, 77, 0, 0.02))',
      }}
    >
      <div className="section-inner">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <span className="section-label">feedback</span>
          <h2 className="section-title">
            의견을 들려주세요
          </h2>
          <p className="section-desc" style={{ textAlign: 'center', margin: '0 auto' }}>
            신규 스타일, 릴스 영상 편집 등 새 기능이 나오면 가장 먼저 알려드려요.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '1.25rem',
            }}
          >
            {[
              { icon: '🎬', label: '릴스 영상 편집' },
              { icon: '🎨', label: '신규 AI 스타일' },
              { icon: '✏️', label: '텍스트 커스텀' },
            ].map((item) => (
              <span
                key={item.label}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.75rem',
                  background: 'rgba(255, 77, 0, 0.06)',
                  border: '1px solid rgba(255, 77, 0, 0.15)',
                  borderRadius: '100px',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.02em',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                <span
                  style={{
                    fontSize: '0.55rem',
                    color: 'var(--accent-primary)',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                  }}
                >
                  SOON
                </span>
              </span>
            ))}
          </div>

          {status !== 'success' ? (
            <form
              onSubmit={handleSubmit}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                marginTop: '2rem',
                width: '100%',
                maxWidth: '460px',
              }}
            >
              <input
                type="text"
                placeholder="이름"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="notify-input"
              />
              <input
                type="email"
                placeholder="이메일"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="notify-input"
              />
              <input
                type="tel"
                placeholder="전화번호 (선택)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="notify-input"
              />
              <textarea
                placeholder="피드백을 자유롭게 적어주세요 (선택)"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="notify-input"
                rows={3}
                style={{ resize: 'vertical' }}
              />

              <button
                type="submit"
                className="notify-btn"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? '전송 중...' : status === 'error' ? '다시 시도' : '보내기'}
              </button>
            </form>
          ) : (
            <div
              className="notify-success show"
              style={{ marginTop: '2rem' }}
            >
              소중한 의견 감사합니다! 반영해서 업데이트할게요 🙌
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
