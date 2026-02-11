/**
 * 단일 프롬프트 테스트
 * 사용법: npx tsx scripts/test-single.ts <이미지경로>
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { GoogleGenAI } from '@google/genai';

const PROMPT = `Transform this photo into a dramatic Nike-style athletic campaign poster.

Dark, moody background with dramatic spotlight lighting on the runner.
High contrast — deep blacks and bright highlights on the person.
The person should look heroic and powerful, like a Nike "Just Do It" campaign model.
Cinematic color grading: desaturated background with warm skin tones.
Slight motion blur or dynamic energy lines to convey movement and power.
The overall feel should be like a Nike or Adidas billboard advertisement.

Keep the person's exact pose, clothing, and appearance from the original photo.
The face and expression must remain recognizable.

Bold athletic typography:
- "{distance} KM" in massive bold condensed sans-serif (like Futura or Helvetica Black), dominating the composition
- "PACE {pace} | TIME {time}" in smaller clean athletic font below
- White or off-white text with subtle shadow for contrast
- The text should feel like part of a premium sportswear ad campaign
- Optional: a thin horizontal line or minimal geometric accent near the text

Do NOT add any brand logos or "Just Do It" text.
Do NOT change the person's clothing to Nike gear.
Do NOT make it look cheap or template-like — this should feel like a real high-budget campaign shoot.`
  .replace(/\{distance\}/g, '5.2')
  .replace(/\{pace\}/g, "5'42\"")
  .replace(/\{time\}/g, '28:14');

async function main() {
  const imagePath = process.argv[2];
  if (!imagePath) { console.error('Usage: npx tsx scripts/test-single.ts <image>'); process.exit(1); }

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) { console.error('GOOGLE_AI_API_KEY 필요'); process.exit(1); }

  const ai = new GoogleGenAI({ apiKey });
  const base64 = readFileSync(imagePath).toString('base64');

  const outDir = 'test-results/nike-campaign';
  mkdirSync(outDir, { recursive: true });
  writeFileSync(`${outDir}/prompt.txt`, PROMPT);

  console.log('\n🏃 나이키 캠페인 포스터 테스트 × 3회\n');

  for (let i = 1; i <= 3; i++) {
    console.log(`   [${i}/3] 생성 중...`);
    const start = Date.now();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [
          { text: PROMPT },
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
        if (part.text) {
          console.log(`   📝 ${part.text.substring(0, 80)}`);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`   ❌ ${msg}`);
    }
  }
  console.log(`\n🏁 ${outDir}/ 에서 결과 확인`);
}

main();
