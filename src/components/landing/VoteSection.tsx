'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function VoteSection() {
  const [voteCount, setVoteCount] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const voted = localStorage.getItem('ttwi-voted');
    if (voted) setHasVoted(true);
    loadVoteCount();
  }, []);

  async function loadVoteCount() {
    try {
      const { count, error } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true });
      if (!error && count !== null) {
        setVoteCount(count);
      }
    } catch (e) {
      console.warn('Load votes failed:', e);
    }
  }

  async function handleVote(type: string) {
    if (hasVoted) return;
    try {
      const { error } = await supabase
        .from('votes')
        .insert({ vote_type: type });
      if (error) {
        console.error('Vote error:', error);
        return;
      }
    } catch (e) {
      console.error('Vote failed:', e);
      return;
    }

    localStorage.setItem('ttwi-voted', type);
    setHasVoted(true);
    loadVoteCount();
  }

  return (
    <section className="vote-section" id="vote">
      <div className="section-inner">
        <div className="vote-container">
          <span className="section-label">러너가 결정합니다</span>
          <h2 className="vote-question">
            이런 인증 방식,<br />실제로 쓸 것 같으세요?
          </h2>
          <p className="vote-sub">
            투표 결과로 실제 기능 우선순위를 정합니다.<br />러너분들이 만드는 서비스예요.
          </p>

          <div className="vote-buttons">
            <button
              className={`vote-btn vote-btn--yes${hasVoted ? ' voted' : ''}`}
              onClick={() => handleVote('yes')}
            >
              <span className="vote-emoji">🔥</span>
              <div>
                <div className="vote-label">이거 쓸 것 같다</div>
                <div className="vote-count">{voteCount} votes</div>
              </div>
            </button>
          </div>

          <div className={`vote-result${hasVoted ? ' show' : ''}`}>
            <p className="vote-thanks">의견 감사합니다!</p>
            <p className="vote-thanks-sub">아래에서 베타 테스터로 먼저 써보실 수 있어요 👇</p>
          </div>
        </div>
      </div>
    </section>
  );
}
