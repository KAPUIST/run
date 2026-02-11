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
export const STYLE_CONFIGS: Record<string, StyleConfig> = {
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
    outputFormat: { aspectRatio: '9:16' as const, style: 'illustration' as const },
  },
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
    outputFormat: { aspectRatio: '9:16' as const, style: 'illustration' as const },
  },
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
    outputFormat: { aspectRatio: '9:16' as const, style: 'voxel' as const },
  },
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
    outputFormat: { aspectRatio: '9:16' as const, style: 'illustration' as const },
  },
};
