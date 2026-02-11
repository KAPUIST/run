/**
 * 프롬프트 테스트 러너
 *
 * 사용법: npx tsx scripts/test-prompts.ts <이미지경로> [스타일1,스타일2,...]
 *
 * 예시:
 *   npx tsx scripts/test-prompts.ts ./test-photo.jpg              # 전체 스타일
 *   npx tsx scripts/test-prompts.ts ./test-photo.jpg nike,magazine # 특정 스타일만
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { GoogleGenAI } from '@google/genai';
import { STYLE_CONFIGS, buildPrompt, type RunStats } from '../src/lib/gemini';

const TEST_STATS: RunStats = {
  distance: '5.2',
  pace: "5'42\"",
  time: '28:14',
  date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }),
};

async function main() {
  const imagePath = process.argv[2];
  if (!imagePath) {
    console.error('Usage: npx tsx scripts/test-prompts.ts <image-path> [styles]');
    process.exit(1);
  }

  const filterStyles = process.argv[3]?.split(',') || Object.keys(STYLE_CONFIGS);
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    console.error('GOOGLE_AI_API_KEY 환경변수 필요');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });
  const imageData = readFileSync(imagePath);
  const base64 = imageData.toString('base64');

  const timestamp = new Date().toISOString().slice(0, 16).replace(/[:-]/g, '');
  const outDir = `test-results/${timestamp}`;
  mkdirSync(outDir, { recursive: true });

  console.log(`\n🧪 프롬프트 테스트 시작 (${filterStyles.length}개 스타일)\n`);

  for (const styleId of filterStyles) {
    const config = STYLE_CONFIGS[styleId];
    if (!config) {
      console.warn(`⚠️  "${styleId}" 스타일 없음, 건너뜀`);
      continue;
    }

    const prompt = buildPrompt(config, TEST_STATS);
    console.log(`🎨 [${styleId}] ${config.name} 생성 중...`);
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
          const outPath = `${outDir}/${styleId}.png`;
          writeFileSync(outPath, Buffer.from(part.inlineData.data!, 'base64'));
          console.log(`   ✅ ${((Date.now() - start) / 1000).toFixed(1)}s → ${outPath}`);
        }
        if (part.text) {
          console.log(`   📝 ${part.text.substring(0, 100)}`);
        }
      }

      // 프롬프트도 함께 저장 (디버깅용)
      writeFileSync(`${outDir}/${styleId}-prompt.txt`, prompt);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`   ❌ ${msg}`);
    }
  }

  console.log(`\n🏁 완료! 결과: ${outDir}/`);
}

main();
