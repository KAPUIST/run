# AI 이미지 변환 프롬프트 엔지니어링 시스템 구축

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 8개 AI 스타일 변환 프롬프트를 체계적 프레임워크로 재설계하여, 매번 일관되고 고품질인 결과물을 생성하는 시스템을 구축한다.

**Architecture:** 모든 프롬프트를 5-Section 구조 템플릿(ROLE → TRANSFORM → PRESERVE → TYPOGRAPHY → CONSTRAINTS)으로 통일한다. 프롬프트 빌더 함수가 사용자 입력값을 안전하게 주입하고, 테스트 러너로 각 스타일을 체계적으로 검증한다.

**Tech Stack:** TypeScript, Google GenAI (Gemini 2.5 Flash Image), Zod validation, Node.js test runner

---

## 문제 분석

### 현재 상태
- 8개 스타일 프롬프트가 **각각 다른 구조**와 **다른 상세 수준**
- 동일 의도를 **다르게 표현** ("Keep exact poses" vs "CRITICAL: Keep the people exactly as they are")
- **네거티브 프롬프트**가 일부에만 존재 (animalcrossing, magazine)
- **출력 포맷** 지정이 nike에만 존재 (9:16)
- 테스트가 **ad-hoc 스크립트** (하드코딩된 API 키, 경로)
- 문자열 replace로 동적 값 치환 → **깨지기 쉬운 구조**

### 목표 상태
- 모든 프롬프트가 **동일한 5-Section 템플릿** 준수
- 프롬프트 빌더가 **타입-세이프하게** 동적 값 주입
- 각 스타일별 **네거티브 제약조건** 명시
- **출력 포맷** (해상도, 비율) 전 스타일 통일
- 체계적 **테스트 러너**로 일관성 검증 가능

---

## Task 1: 프롬프트 템플릿 타입 시스템 정의

**Files:**
- Modify: `src/lib/gemini.ts`

**Step 1: StyleConfig 인터페이스 확장**

`src/lib/gemini.ts`의 `StyleConfig`를 5-Section 구조로 확장한다:

```typescript
export interface StyleConfig {
  id: string;
  name: string;
  nameEn: string;
  // 5-Section 프롬프트 구조
  sections: {
    role: string;        // AI의 역할 (예: "You are a pixel art game artist")
    transform: string;   // 핵심 변환 지시 (스타일 특화)
    preserve: string;    // 보존해야 할 요소
    typography: string;  // 텍스트/통계 표시 방법
    constraints: string; // 하지 말아야 할 것 (네거티브)
  };
  outputFormat: {
    aspectRatio: '9:16' | '1:1' | '4:5';
    style: 'illustration' | 'pixel' | 'voxel' | 'photo-overlay' | 'editorial';
  };
}

// 프롬프트 조합 함수
export function buildPrompt(config: StyleConfig, stats: RunStats): string;

export interface RunStats {
  distance: string;  // "5.2"
  pace: string;      // "5'42\""
  time: string;      // "28:14"
  date?: string;     // "February 2026" (magazine용)
}
```

**Step 2: 테스트 실행하여 실패 확인**

Run: `npx tsc --noEmit`
Expected: 기존 STYLE_CONFIGS가 새 인터페이스와 맞지 않아 타입 에러

**Step 3: buildPrompt 함수 구현**

```typescript
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
```

**Step 4: 타입 체크 통과 확인**

Run: `npx tsc --noEmit`
Expected: StyleConfig와 buildPrompt 자체는 에러 없음 (STYLE_CONFIGS는 아직 미수정이므로 에러)

**Step 5: Commit**

```bash
git add src/lib/gemini.ts
git commit -m "feat: 5-Section 프롬프트 템플릿 타입 시스템 정의"
```

---

## Task 2: 8개 스타일 프롬프트 재작성 — 파트 1 (crayon, catface, minecraft, animalcrossing)

**Files:**
- Modify: `src/lib/gemini.ts`

**Step 1: crayon 스타일 재작성**

```typescript
crayon: {
  id: 'crayon',
  name: '유치원 느낌',
  nameEn: 'Crayon Drawing',
  sections: {
    role: 'You are a kindergarten art teacher recreating photos as children\'s crayon drawings on white paper.',
    transform: `Transform the entire scene into a child's crayon/marker drawing on white construction paper.
Use wobbly uneven lines that go outside the boundaries. Bright cheerful primary colors.
Simple stick-figure-like proportions but the poses must be recognizable from the original photo.
The drawing style should look authentically child-made — imperfect, joyful, with visible crayon texture and paper grain.
Add a crayon-drawn sun with a smiley face in one corner and a gold star sticker in another corner.`,
    preserve: `The number of people and their general poses from the original photo must be recognizable.
Clothing colors should roughly match the original (translated into crayon colors).
The general scene composition (background elements like trees, road, sky) should be identifiable.`,
    typography: `Write in wobbly crayon handwriting (as if a child wrote it):
- "{distance} KM" in large colorful crayon letters, centered
- "PACE {pace} | TIME {time}" in smaller crayon writing below
The text should look hand-written by a 5-year-old — uneven letter sizes, mixed colors, slightly tilted.`,
    constraints: `Do NOT make it look digitally drawn or clean vector art.
Do NOT preserve photographic realism — everything must be crayon/marker style.
Do NOT use thin precise lines — all lines should be thick and wobbly.
Do NOT add any UI elements, frames, or borders.`,
  },
  outputFormat: { aspectRatio: '9:16', style: 'illustration' },
},
```

**Step 2: catface 스타일 재작성**

```typescript
catface: {
  id: 'catface',
  name: '고양이 변신',
  nameEn: 'Cat Transformation',
  sections: {
    role: 'You are a photorealistic digital artist specializing in anthropomorphic animal portraits.',
    transform: `Replace every human in the photo with an anthropomorphic cat version of themselves.
Each cat should have: realistic fur texture, cat ears, cat nose, whiskers, and cat eyes.
The cats must maintain human-like facial expressions matching the original person's mood.
The body proportions stay human-like (standing upright, human hands if visible).
Apply a subtle warm cinematic color grade to the overall image.`,
    preserve: `Exact same clothing, shoes, and accessories on each person — translated onto the cat body.
Exact same poses and body positioning.
Background environment stays completely unchanged and photorealistic.
Lighting conditions from the original photo must be maintained.`,
    typography: `Clean modern sans-serif typography:
- "{distance} KM" in large bold white text with subtle drop shadow, upper-center area
- "PACE {pace} | TIME {time}" in smaller white text at bottom-center
Text must be clearly readable against the background. Use semi-transparent dark backing if needed for contrast.`,
    constraints: `Do NOT make the cats look cartoonish or anime-style — they must be photorealistic.
Do NOT change the background or environment.
Do NOT alter the lighting or color of the environment (only subtle cinematic grade).
Do NOT add any cat accessories (collars, bows) not present in the original.`,
  },
  outputFormat: { aspectRatio: '9:16', style: 'illustration' },
},
```

**Step 3: minecraft 스타일 재작성**

```typescript
minecraft: {
  id: 'minecraft',
  name: '마인크래프트',
  nameEn: 'Minecraft',
  sections: {
    role: 'You are a Minecraft world builder recreating real photos as in-game screenshots.',
    transform: `Convert the entire scene into a Minecraft game screenshot.
Everything must be made of blocky voxel cubes — people, ground, sky, trees, buildings.
All surfaces must have Minecraft-style pixelated textures (16x16 pixel blocks).
People become Minecraft player character models (Steve/Alex proportions) wearing pixel-block versions of their real clothing.
The scene should look like an actual Minecraft world with appropriate biome elements.`,
    preserve: `The number of figures and their general arrangement in the scene.
Clothing colors and patterns translated into pixel-block textures.
General environment type (urban → village, park → forest biome, road → path blocks).
Time of day / lighting mood from the original photo.`,
    typography: `Stats displayed as Minecraft in-game chat/HUD text:
- "{distance} KM" in Minecraft's default pixelated font, large size, yellow text like achievement notification
- "PACE {pace} | TIME {time}" in smaller pixel text below, white color
- Style it like an achievement popup: "[Achievement Unlocked] {distance} KM completed!"
Text should appear as if it's part of the game's UI overlay.`,
    constraints: `Do NOT use smooth gradients — everything must be blocky and pixelated.
Do NOT make it look like a low-poly 3D render — it must look specifically like Minecraft.
Do NOT add Minecraft mobs (creepers, etc.) unless contextually appropriate.
Do NOT use any smooth or rounded shapes.`,
  },
  outputFormat: { aspectRatio: '9:16', style: 'voxel' },
},
```

**Step 4: animalcrossing 스타일 재작성**

```typescript
animalcrossing: {
  id: 'animalcrossing',
  name: '동물의 숲',
  nameEn: 'Animal Crossing',
  sections: {
    role: 'You are a Nintendo concept artist compositing real people into Animal Crossing: New Horizons environments.',
    transform: `Replace ONLY the background and environment with Animal Crossing game art style.
The surroundings become: soft rounded grassy ground with small colorful flowers, pastel-colored sky with puffy clouds, cute round trees with simple leaf clusters, gentle rolling hills.
Apply a soft pastel color grading to blend the real people naturally into the game world.
The overall scene should feel like a sunny day on a peaceful Animal Crossing island.`,
    preserve: `CRITICAL — The people must remain EXACTLY as they are in the original photo:
- Same real human faces (not cartoon, not villager style)
- Same body, same pose, same clothing, same shoes
- Same skin tone, same hair
- Same facial expression
The only change to people is subtle color grading to match the pastel environment.`,
    typography: `Stats displayed as Animal Crossing UI elements:
- A rounded speech-bubble popup containing "{distance} KM" in the game's friendly rounded font
- Below it: "PACE {pace} | TIME {time}" in smaller matching font
- The bubble should look like an in-game achievement notification or Nook Miles reward popup
- Soft cream/white background with brown text, matching AC's UI aesthetic`,
    constraints: `Do NOT change people into cartoon characters or Animal Crossing villagers.
Do NOT change people's faces, clothing, or poses in any way.
Do NOT use harsh shadows or dramatic lighting — keep everything soft and friendly.
Do NOT add Animal Crossing characters (villagers, Tom Nook) to the scene.`,
  },
  outputFormat: { aspectRatio: '9:16', style: 'illustration' },
},
```

**Step 5: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 4개 스타일이 새 인터페이스에 맞게 변환됨

**Step 6: Commit**

```bash
git add src/lib/gemini.ts
git commit -m "feat: crayon/catface/minecraft/animalcrossing 프롬프트 5-Section 재작성"
```

---

## Task 3: 8개 스타일 프롬프트 재작성 — 파트 2 (gta, pixel, magazine, nike)

**Files:**
- Modify: `src/lib/gemini.ts`

**Step 1: gta 스타일 재작성**

```typescript
gta: {
  id: 'gta',
  name: 'GTA',
  nameEn: 'Grand Theft Auto',
  sections: {
    role: 'You are a Rockstar Games illustrator creating GTA V loading screen artwork.',
    transform: `Transform the entire photo into Grand Theft Auto V loading screen illustration style.
Use angular, stylized illustration with bold outlines and painterly brushstrokes.
Highly saturated colors with strong contrast and dramatic lighting.
Skin tones should have the signature GTA warm orange/brown cast.
The background should be simplified and stylized like a GTA promotional poster.
The overall feel should be a widescreen cinematic movie poster meets comic book illustration.`,
    preserve: `Exact poses and body positioning of all people.
Clothing and accessories translated into the GTA illustration style.
General environment/location recognizable but stylized.
Number of people and their relative positions.`,
    typography: `GTA-style HUD typography:
- "{distance} KM" in large bold condensed sans-serif (like Pricedown or similar GTA font), top area
- "PACE {pace} | TIME {time}" in smaller GTA HUD-style font at bottom
- Style it like a mission completion screen: "MISSION PASSED" aesthetic
- White or yellow text with dark outline for readability
- The text should feel like it belongs in the GTA game UI`,
    constraints: `Do NOT make it look like a generic digital painting — it must specifically reference GTA's angular illustration style.
Do NOT use soft gradients or watercolor effects.
Do NOT change the people's poses or add weapons/violence.
Do NOT make it look like GTA IV or older GTA styles — specifically GTA V's clean modern look.`,
  },
  outputFormat: { aspectRatio: '9:16', style: 'illustration' },
},
```

**Step 2: pixel 스타일 재작성**

```typescript
pixel: {
  id: 'pixel',
  name: '픽셀아트',
  nameEn: 'Pixel Art',
  sections: {
    role: 'You are a retro game pixel artist creating NES/SNES era game screenshots.',
    transform: `Transform the entire scene into authentic 8-bit/16-bit pixel art.
Use a limited color palette (maximum 16-24 colors).
All shapes must be made of clearly visible large square pixels — no anti-aliasing, no smooth edges.
People become pixel art character sprites (like classic RPG/platformer characters) wearing pixelated versions of their real clothing.
Background becomes a retro game environment: pixel clouds, pixel trees, tiled ground.
The composition should look like a screenshot from a side-scrolling platformer or top-down RPG.`,
    preserve: `Number of characters and their general poses.
Clothing colors and patterns translated into pixel-art color blocks.
General scene layout and environment type.
Time of day (use appropriate pixel-art sky colors).`,
    typography: `Retro game HUD text:
- "{distance} KM" in large pixel font (like classic arcade high-score display), upper area
- "PACE {pace} | TIME {time}" in smaller pixel font below
- White or bright yellow pixel text on a semi-transparent dark bar
- Style like a retro game score/status bar or a "STAGE CLEAR" screen
- Each letter should be made of clearly visible pixel blocks`,
    constraints: `Do NOT use any smooth curves or gradients — every edge must be pixelated.
Do NOT use more than 24 colors in the entire image.
Do NOT make it look like modern pixel art with HD resolution — keep it authentically retro and chunky.
Do NOT blend the pixel art style with photorealism.`,
  },
  outputFormat: { aspectRatio: '9:16', style: 'pixel' },
},
```

**Step 3: magazine 스타일 재작성**

```typescript
magazine: {
  id: 'magazine',
  name: '잡지 1면',
  nameEn: 'Magazine Cover',
  sections: {
    role: 'You are an editorial illustrator and magazine art director creating a high-fashion sports magazine cover.',
    transform: `Transform the entire image into a fashion editorial illustration.
Use bold ink strokes combined with fashion illustration technique — NOT a photograph.
People should be rendered with stylized elongated proportions like Vogue fashion sketches.
The illustration style: confident ink lines, selective watercolor washes, high-contrast dramatic lighting.
Background becomes a clean editorial layout — simplified, elegant, with ample negative space.
The overall piece should look like it belongs on the cover of Vogue or Runner's World.`,
    preserve: `The same clothing on each person (translated into fashion illustration style).
General poses recognizable from the original.
The mood and energy of the original moment.
Number of people and their composition.`,
    typography: `Magazine cover typography with mixed font weights:
- "TODAY'S RUN" in elegant widely-spaced uppercase at the very top, with a thin horizontal rule below
- "{distance} KM" in MASSIVE ultra-bold sans-serif font, dominating the center
- "PACE {pace} | TIME {time}" in small refined lightweight text near the bottom
- "{date}" in italic serif, small, lower corner
- All text in white or off-white for elegance
- Use dramatic contrast between ultra-bold headlines and thin body text
- The typography layout must follow real magazine cover design principles`,
    constraints: `Do NOT keep the photo realistic — the entire image must be an editorial illustration.
Do NOT make the text look pasted on top of a photo.
Do NOT use bright saturated colors — keep an elegant limited palette (2-3 accent colors max).
Do NOT add real magazine logos or brand names.
Do NOT make the illustration look like a cartoon or comic — it should feel high-fashion and sophisticated.`,
  },
  outputFormat: { aspectRatio: '9:16', style: 'editorial' },
},
```

**Step 4: nike 스타일 재작성**

```typescript
nike: {
  id: 'nike',
  name: '나이키 셀럽',
  nameEn: 'Nike Victory',
  sections: {
    role: 'You are a Nike campaign photographer and photo compositor creating a "Just Do It" hero moment.',
    transform: `Transform the runner's pose into a dramatic victory celebration:
- Arms spread wide open to both sides, chest lifted up, head tilted slightly back
- Feet firmly planted on the ground in a powerful confident stance
- The body language should scream "I conquered this run!" — triumphant and free
Slightly enhance the background to feel more scenic and cinematic (subtle golden-hour glow, deeper sky, more dramatic clouds).
The overall mood: victorious, free, cinematic — a Nike advertisement hero shot.
Bright vivid colors with cinematic color grading.`,
    preserve: `The runner's EXACT face, hair, skin tone — must be clearly recognizable as the same person.
The runner's exact clothing, shoes, and accessories — every detail identical.
The general background environment (but cinematically enhanced).
The runner's body type and physical characteristics.`,
    typography: `Bold Nike-campaign-style typography:
- "{distance} KM" in MASSIVE ultra-bold clean sans-serif (like Futura Heavy or Helvetica Neue Black)
- Color: warm coral-red (#FF6B5A or similar)
- CRITICAL LAYERING: The text must be placed BEHIND the runner's body — the runner appears IN FRONT of the text, overlapping it
- The text should fill most of the frame width (80%+)
- "PACE {pace} | TIME {time}" in same coral-red, smaller, at the bottom of frame
- Clean typography only — no outlines, no shadows, no effects on the text`,
    constraints: `Do NOT change the runner's face — it must be instantly recognizable.
Do NOT change the runner's clothing or shoes.
Do NOT place the text in front of the runner — the runner must overlap the text.
Do NOT add any Nike logos, swoosh marks, or brand elements.
Do NOT make the pose look unnatural or anatomically impossible.
Do NOT crop or zoom differently from the original — maintain the full figure.`,
  },
  outputFormat: { aspectRatio: '9:16', style: 'photo-overlay' },
},
```

**Step 5: 타입 체크**

Run: `npx tsc --noEmit`
Expected: PASS — 모든 8개 스타일이 새 인터페이스 준수

**Step 6: Commit**

```bash
git add src/lib/gemini.ts
git commit -m "feat: gta/pixel/magazine/nike 프롬프트 5-Section 재작성"
```

---

## Task 4: API 라우트에서 buildPrompt 연동

**Files:**
- Modify: `src/app/api/generate/route.ts`

**Step 1: 기존 string replace 제거하고 buildPrompt 사용**

`route.ts`의 AI 호출 부분을 수정:

```typescript
import { ai, STYLE_CONFIGS, buildPrompt } from '@/lib/gemini';

// 기존 코드 (제거):
//   config.prompt
//     .replace(/5\.2 KM/g, `${distance} KM`)
//     .replace(/5'42"/g, pace)
//     .replace(/28:14/g, time)
//     .replace(/February 2026/g, ...)

// 새 코드:
const prompt = buildPrompt(config, {
  distance,
  pace,
  time,
  date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
});

const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash-image',
  contents: [
    { text: prompt },
    {
      inlineData: { mimeType, data: base64 },
    },
  ],
  config: {
    responseModalities: ['TEXT', 'IMAGE'],
  },
});
```

**Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 3: 개발 서버에서 수동 테스트**

Run: `npm run dev`
사진 업로드 → 스타일 선택 → 생성 확인

**Step 4: Commit**

```bash
git add src/app/api/generate/route.ts
git commit -m "refactor: buildPrompt 함수로 동적 프롬프트 생성 전환"
```

---

## Task 5: 프롬프트 테스트 러너 스크립트 작성

**Files:**
- Create: `scripts/test-prompts.ts`

**Step 1: 체계적 테스트 러너 작성**

테스트 이미지 1장으로 전체 8개 스타일을 순회하며 생성 결과를 저장하는 스크립트:

```typescript
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
  date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
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
          writeFileSync(outPath, Buffer.from(part.inlineData.data, 'base64'));
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
```

**Step 2: 스크립트 실행 테스트**

Run: `npx tsx scripts/test-prompts.ts <테스트이미지경로> nike`
Expected: `test-results/` 폴더에 nike.png + nike-prompt.txt 생성

**Step 3: .gitignore에 테스트 결과 폴더 추가**

```
# 프롬프트 테스트 결과
test-results/
```

**Step 4: Commit**

```bash
git add scripts/test-prompts.ts .gitignore
git commit -m "feat: 체계적 프롬프트 테스트 러너 스크립트 추가"
```

---

## Task 6: A/B 비교 테스트 스크립트 작성

**Files:**
- Create: `scripts/compare-prompts.ts`

**Step 1: 동일 이미지/스타일의 프롬프트 변형 비교 도구 작성**

```typescript
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
          writeFileSync(`${outDir}/run-${i}.png`, Buffer.from(part.inlineData.data, 'base64'));
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
```

**Step 2: 실행 테스트**

Run: `npx tsx scripts/compare-prompts.ts <이미지> nike 2`
Expected: `test-results/compare-nike-*/` 에 run-1.png, run-2.png, prompt.txt 생성

**Step 3: Commit**

```bash
git add scripts/compare-prompts.ts
git commit -m "feat: 프롬프트 A/B 일관성 비교 테스트 스크립트 추가"
```

---

## Task 7: 기존 ad-hoc 테스트 파일 정리

**Files:**
- Delete: `test-prompt-compare.mjs` (API 키 하드코딩 — 보안 위험)
- Delete: `test-overlay-prompts.mjs` (API 키 하드코딩)
- Delete: `test-overlay-v6.mjs` (API 키 하드코딩)
- Delete: `compare-A_simple.png`, `compare-B_detailed.png` (테스트 결과물)

**Step 1: 하드코딩된 API 키가 포함된 파일 삭제**

```bash
rm test-prompt-compare.mjs test-overlay-prompts.mjs test-overlay-v6.mjs
rm -f compare-A_simple.png compare-B_detailed.png overlay-*.png
```

**Step 2: .gitignore에 패턴 추가 확인**

`overlay-*.png`, `compare-*.png` 패턴이 .gitignore에 있는지 확인.

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: 하드코딩 API 키 포함된 ad-hoc 테스트 파일 제거"
```

---

## Task 8: StyleSelector 컴포넌트와 STYLE_CONFIGS 동기화

**Files:**
- Modify: `src/components/create/StyleSelector.tsx`

**Step 1: StyleSelector가 STYLE_CONFIGS에서 동적으로 스타일 목록 생성하도록 수정**

현재 StyleSelector에 하드코딩된 스타일 목록을 STYLE_CONFIGS에서 자동 생성하도록 변경:

```typescript
import { STYLE_CONFIGS } from '@/lib/gemini';

// 스타일 메타데이터 (UI 전용)
const STYLE_UI_META: Record<string, { emoji: string; tag: string; tagClass?: string }> = {
  crayon:         { emoji: '🖍️', tag: '귀여움' },
  catface:        { emoji: '🐱', tag: '인기 1위', tagClass: 'hot' },
  minecraft:      { emoji: '⛏️', tag: 'Fun', tagClass: 'hot' },
  animalcrossing: { emoji: '🏝️', tag: 'NEW', tagClass: 'new' },
  gta:            { emoji: '🔫', tag: 'Cool' },
  pixel:          { emoji: '👾', tag: 'Retro' },
  magazine:       { emoji: '📰', tag: 'Epic' },
  nike:           { emoji: '✨', tag: 'MZ Pick', tagClass: 'hot' },
};

const styles = Object.entries(STYLE_CONFIGS).map(([id, config]) => ({
  id,
  name: config.name,
  ...STYLE_UI_META[id],
}));
```

**Step 2: 빌드 확인**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/create/StyleSelector.tsx
git commit -m "refactor: StyleSelector를 STYLE_CONFIGS 기반 동적 생성으로 전환"
```

---

## 실행 순서 요약

| Task | 내용 | 의존성 |
|------|------|--------|
| 1 | 타입 시스템 + buildPrompt 함수 | 없음 |
| 2 | 프롬프트 재작성 파트 1 (4개) | Task 1 |
| 3 | 프롬프트 재작성 파트 2 (4개) | Task 1 |
| 4 | API 라우트 연동 | Task 1, 2, 3 |
| 5 | 테스트 러너 | Task 1, 2, 3 |
| 6 | A/B 비교 도구 | Task 5 |
| 7 | ad-hoc 파일 정리 | Task 5 |
| 8 | StyleSelector 동기화 | Task 1, 2, 3 |

**병렬 가능:** Task 2 + 3 (독립), Task 5 + 8 (Task 4 이후)
