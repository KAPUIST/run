/**
 * 프롬프트 A/B 비교 테스트
 *
 * 사용법: npx tsx scripts/compare-prompts.ts <이미지경로> <스타일> <횟수>
 *
 * 같은 프롬프트로 N회 생성하여 일관성 확인
 * 예시: npx tsx scripts/compare-prompts.ts ./photo.jpg nike 3
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { GoogleGenAI } from '@google/genai';
import { STYLE_CONFIGS, buildPrompt, type RunStats } from '../src/lib/gemini';

const TEST_STATS: RunStats = {
  distance: '5.2',
  pace: "5'42\"",
  time: '28:14',
  date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
};

async function main() {
  const imagePath = process.argv[2];
  const styleId = process.argv[3];
  const count = parseInt(process.argv[4] || '3', 10);

  if (!imagePath || !styleId) {
    console.error('Usage: npx tsx scripts/compare-prompts.ts <image> <style> [count=3]');
    process.exit(1);
  }

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) { console.error('GOOGLE_AI_API_KEY 필요'); process.exit(1); }

  const config = STYLE_CONFIGS[styleId];
  if (!config) { console.error(`스타일 "${styleId}" 없음`); process.exit(1); }

  const ai = new GoogleGenAI({ apiKey });
  const base64 = readFileSync(imagePath).toString('base64');
  const prompt = buildPrompt(config, TEST_STATS);

  const timestamp = new Date().toISOString().slice(0, 16).replace(/[:-]/g, '');
  const outDir = `test-results/compare-${styleId}-${timestamp}`;
  mkdirSync(outDir, { recursive: true });
  writeFileSync(`${outDir}/prompt.txt`, prompt);

  console.log(`\n🔬 일관성 테스트: ${config.name} × ${count}회\n`);

  for (let i = 1; i <= count; i++) {
    console.log(`   [${i}/${count}] 생성 중...`);
    const start = Date.now();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: base64 } },
        ],
        config: { responseModalities: ['TEXT', 'IMAGE'] },
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          writeFileSync(`${outDir}/run-${i}.png`, Buffer.from(part.inlineData.data!, 'base64'));
          console.log(`   ✅ ${((Date.now() - start) / 1000).toFixed(1)}s → run-${i}.png`);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`   ❌ ${msg}`);
    }
  }

  console.log(`\n🏁 ${outDir}/ 에서 ${count}개 결과 비교 가능`);
}

main();
