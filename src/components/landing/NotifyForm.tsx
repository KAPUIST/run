'use client';

import { useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';

export default function NotifyForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('loading');

    try {
      const { error } = await supabase
        .from('emails')
        .insert({ name, email, phone });

      if (error) {
        console.error('Email error:', error);
        setStatus('error');
        return;
      }
    } catch (err) {
      console.error('Email failed:', err);
      setStatus('error');
      return;
    }

    setStatus('success');
  }

  return (
    <section className="notify-section" id="notify">
      <div className="section-inner">
        <div className="notify-container">
          <span className="section-label">beta tester</span>
          <h2 className="section-title">베타 테스터 신청</h2>
          <p className="section-desc" style={{ textAlign: 'center', margin: '0 auto' }}>
            신청하신 분들께 <strong style={{ color: 'var(--accent-primary)' }}>무료 베타</strong>를 가장 먼저 보내드립니다.<br />
            초기 테스터 의견으로 기능을 함께 만들어갈 예정이에요.
          </p>

          {status !== 'success' && (
            <form className="notify-form" onSubmit={handleSubmit}>
              <input
                type="text"
                className="notify-input"
                placeholder="이름"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="email"
                className="notify-input"
                placeholder="이메일"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="tel"
                className="notify-input"
                placeholder="전화번호 (010-0000-0000)"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <button
                type="submit"
                className="notify-btn"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? '전송 중...' : status === 'error' ? '다시 시도' : '베타 신청하기'}
              </button>
            </form>
          )}

          <div className={`notify-success${status === 'success' ? ' show' : ''}`}>
            베타 테스터로 등록되었습니다! 가장 먼저 초대해드릴게요.
          </div>

          <p className="notify-privacy">베타 초대 외에 다른 연락은 드리지 않습니다.</p>
        </div>
      </div>
    </section>
  );
}
