import { GoogleGenAI } from '@google/genai';

export const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });

// ── 5-Section 프롬프트 템플릿 타입 시스템 ──────────────────────────

export interface StyleConfig {
  id: string;
  name: string;
  nameEn: string;
  sections: {
    role: string;
    transform: string;
    preserve: string;
    typography: string;
    constraints: string;
  };
  outputFormat: {
    aspectRatio: '9:16' | '1:1' | '4:5';
    style: 'illustration' | 'pixel' | 'voxel' | 'photo-overlay' | 'editorial';
  };
}

export interface RunStats {
  distance: string;
  pace: string;
  time: string;
  date?: string;
}

export function buildPrompt(config: StyleConfig, stats: RunStats): string {
  const { role, transform, preserve, typography, constraints } = config.sections;

  const typographyWithStats = typography
    .replace(/\{distance\}/g, stats.distance)
    .replace(/\{pace\}/g, stats.pace)
    .replace(/\{time\}/g, stats.time)
    .replace(/\{date\}/g, stats.date || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));

  return [
    `[ROLE] ${role}`,
    '',
    `[TRANSFORM] ${transform}`,
    '',
    `[PRESERVE] ${preserve}`,
    '',
    `[TYPOGRAPHY] ${typographyWithStats}`,
    '',
    `[CONSTRAINTS] ${constraints}`,
    '',
    `[OUTPUT] Aspect ratio: ${config.outputFormat.aspectRatio}. Style category: ${config.outputFormat.style}.`,
  ].join('\n');
}

// Task 2, 3에서 새 형식으로 채워넣을 예정
export const STYLE_CONFIGS: Record<string, StyleConfig> = {};
