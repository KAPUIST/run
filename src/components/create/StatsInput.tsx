'use client';

export interface RunStats {
  distance: string;
  pace: string;
  time: string;
}

interface StatsInputProps {
  stats: RunStats;
  onChange: (stats: RunStats) => void;
}

/** 숫자와 소수점만 허용, 최대 3자리.2자리 (예: 999.99) */
function sanitizeDistance(raw: string): string {
  // 숫자와 . 만 남김
  let v = raw.replace(/[^0-9.]/g, '');
  // 소수점 하나만
  const parts = v.split('.');
  if (parts.length > 2) v = parts[0] + '.' + parts.slice(1).join('');
  // 정수부 최대 3자리
  if (parts[0].length > 3) v = parts[0].slice(0, 3) + (parts[1] !== undefined ? '.' + parts[1] : '');
  // 소수부 최대 2자리
  if (parts[1] !== undefined && parts[1].length > 2) {
    v = parts[0] + '.' + parts[1].slice(0, 2);
  }
  return v;
}

/** 숫자만 추출 후 자동으로 MM:SS 또는 H:MM:SS 포맷 */
function formatTime(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 6); // 최대 6자리 (HH:MM:SS)

  if (digits.length === 0) return '';
  if (digits.length <= 2) return digits;   // "28" → 아직 분만 입력
  if (digits.length <= 4) {
    // "2814" → "28:14"
    const mm = digits.slice(0, -2);
    const ss = digits.slice(-2);
    return `${mm}:${ss}`;
  }
  // "10530" → "1:05:30", "103045" → "10:30:45"
  const ss = digits.slice(-2);
  const mm = digits.slice(-4, -2);
  const hh = digits.slice(0, -4);
  return `${hh}:${mm}:${ss}`;
}

/** 초가 0~59 범위인지, 분이 0~59 범위인지 검증 */
function isValidTime(time: string): boolean {
  if (!time.includes(':')) return true; // 아직 입력 중
  const parts = time.split(':').map(Number);
  if (parts.some(isNaN)) return false;
  if (parts.length === 2) {
    return parts[1] >= 0 && parts[1] <= 59;
  }
  if (parts.length === 3) {
    return parts[1] >= 0 && parts[1] <= 59 && parts[2] >= 0 && parts[2] <= 59;
  }
  return false;
}

function calcPace(distance: string, time: string): string {
  const km = parseFloat(distance);
  if (!km || km <= 0) return '';

  const parts = time.split(':').map(Number);
  if (parts.some(isNaN) || parts.length < 2) return '';

  let totalSeconds: number;
  if (parts.length === 3) {
    totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else {
    totalSeconds = parts[0] * 60 + parts[1];
  }

  if (totalSeconds <= 0) return '';

  const secsPerKm = totalSeconds / km;
  const paceMin = Math.floor(secsPerKm / 60);
  const paceSec = Math.round(secsPerKm % 60);

  if (paceSec === 60) return `${paceMin + 1}'00"`;
  return `${paceMin}'${String(paceSec).padStart(2, '0')}"`;
}

export default function StatsInput({ stats, onChange }: StatsInputProps) {
  const autoPace = calcPace(stats.distance, stats.time);
  const timeValid = stats.time === '' || isValidTime(stats.time);

  function handleDistanceChange(raw: string) {
    const value = sanitizeDistance(raw);
    const newPace = calcPace(value, stats.time);
    onChange({ ...stats, distance: value, pace: newPace });
  }

  function handleTimeChange(raw: string) {
    const value = formatTime(raw);
    const newPace = calcPace(stats.distance, value);
    onChange({ ...stats, time: value, pace: newPace });
  }

  return (
    <div>
      <h3 className="text-[var(--text-primary)] font-bold text-lg mb-4">러닝 기록 입력</h3>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-mono text-[var(--text-dim)] mb-2 tracking-wider">거리 (KM)</label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="5.2"
            maxLength={6}
            value={stats.distance}
            onChange={(e) => handleDistanceChange(e.target.value)}
            className="notify-input w-full text-center text-lg font-bold"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-[var(--text-dim)] mb-2 tracking-wider">시간</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="28:14"
            maxLength={8}
            value={stats.time}
            onChange={(e) => handleTimeChange(e.target.value)}
            className={`notify-input w-full text-center text-lg font-bold ${
              !timeValid ? 'border-red-500/50 text-red-400' : ''
            }`}
          />
          {!timeValid && (
            <p className="text-red-400 text-[0.6rem] mt-1 font-mono text-center">초는 0~59</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-mono text-[var(--text-dim)] mb-2 tracking-wider">페이스</label>
          <div className="notify-input w-full text-center text-lg font-bold flex items-center justify-center opacity-80">
            {autoPace || <span className="text-[var(--text-dim)] text-sm font-normal">자동</span>}
          </div>
        </div>
      </div>
      <p className="text-[var(--text-dim)] text-xs mt-2 font-mono">* 숫자만 입력하면 자동 포맷됩니다</p>
    </div>
  );
}
