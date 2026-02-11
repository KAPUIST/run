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
    aspectRatio: "9:16" | "1:1" | "4:5";
    style: "illustration" | "pixel" | "voxel" | "photo-overlay" | "editorial";
  };
}

export interface RunStats {
  distance: string;
  pace: string;
  time: string;
  date?: string;
}

export function buildPrompt(config: StyleConfig, stats: RunStats): string {
  const { role, transform, preserve, typography, constraints } =
    config.sections;

  const typographyWithStats = typography
    .replace(/\{distance\}/g, stats.distance)
    .replace(/\{pace\}/g, stats.pace)
    .replace(/\{time\}/g, stats.time)
    .replace(
      /\{date\}/g,
      stats.date ||
        new Date().toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
    );

  return [
    role,
    "",
    transform,
    "",
    preserve,
    "",
    typographyWithStats,
    "",
    constraints,
  ].join("\n");
}

// Task 2, 3에서 새 형식으로 채워넣을 예정
export const STYLE_CONFIGS: Record<string, StyleConfig> = {
  crayon: {
    id: "crayon",
    name: "유치원 느낌",
    nameEn: "Crayon Drawing",
    sections: {
      role: "You are a talented children's book illustrator who draws in a charming crayon and colored pencil style.",
      transform: `Transform the entire scene into a beautiful crayon and colored pencil illustration on textured white paper.
The style should be like a skilled illustrator drawing with crayons — charming and warm, but with good proportions and recognizable details.
Use rich layered crayon strokes with visible texture. Warm, vibrant colors with intentional shading and depth.
People should be drawn with correct body proportions (not stick figures) — detailed enough to clearly recognize their clothing, pose, and appearance.
Background should be lovingly illustrated with crayon — sky with layered blue strokes, ground with warm tones, buildings/objects clearly depicted.
Add a small crayon-drawn sun with a smiley face in one corner and a gold star sticker in another corner.`,
      preserve: `The number of people and their exact poses from the original photo must be clearly recognizable.
Clothing details, colors, and patterns should be faithfully translated into crayon style.
Facial features and expressions should be recognizable (not blank circles).
The full scene composition including background architecture and objects.`,
      typography: `Write in neat but playful crayon lettering:
- "{distance} KM" in large bold colorful crayon letters, centered upper area
- "PACE {pace} | TIME {time}" in smaller crayon writing below
The text should look hand-lettered with crayons — warm and playful but clearly legible.`,
      constraints: `Do NOT make it look digitally drawn or clean vector art.
Do NOT preserve photographic realism — everything must be crayon/colored pencil style.
Do NOT draw people as stick figures or overly simplified — maintain good proportions and detail.
Do NOT make it look messy or scribbled — it should feel like a talented artist's crayon illustration.`,
    },
    outputFormat: {
      aspectRatio: "9:16" as const,
      style: "illustration" as const,
    },
  },
  catface: {
    id: "catface",
    name: "고양이 변신",
    nameEn: "Cat Transformation",
    sections: {
      role: "You are a creative photo artist making fun, high-quality anthropomorphic cat portraits.",
      transform: `Transform the people in this photo into cats.
Anthropomorphic cats in same exact poses, same exact clothing.
Cat faces with human-like expressions. Realistic cat fur.
Keep background unchanged.`,
      preserve: `Same exact poses and body positioning.
Same exact clothing, shoes, and accessories.
Background environment stays unchanged.`,
      typography: `Add running stats:
- "{distance} KM" in large bold white text, upper area
- "PACE {pace} | TIME {time}" in smaller text at bottom
Clean and readable against the scene.`,
      constraints: `Keep the original photo quality and sharpness.
The cats should look realistic, not cartoonish.`,
    },
    outputFormat: {
      aspectRatio: "9:16" as const,
      style: "illustration" as const,
    },
  },
  gta: {
    id: "gta",
    name: "GTA",
    nameEn: "Grand Theft Auto",
    sections: {
      role: "You are a Rockstar Games illustrator creating GTA V loading screen artwork.",
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
    outputFormat: {
      aspectRatio: "9:16" as const,
      style: "illustration" as const,
    },
  },
  pixel: {
    id: "pixel",
    name: "픽셀아트",
    nameEn: "Pixel Art",
    sections: {
      role: "You are a 1980s NES game developer. You ONLY output pixel art. You cannot output photographs.",
      transform: `DO NOT MODIFY THE PHOTO. Instead, use the photo as inspiration and draw a completely new pixel art image from scratch.

Create a retro 8-bit running game screenshot:
- The entire image is pixel art drawn on a chunky pixel grid. Every element is made of large, visible square pixels.
- The person becomes a small pixel character sprite wearing the same colored outfit.
- The location becomes a pixel game level background.
- 16-color NES palette. No gradients. No smooth edges. No anti-aliasing.
- It must look EXACTLY like a screenshot from Super Mario Bros or Mega Man — that level of chunky retro pixels.`,
      preserve: `Use the photo to know: the person's outfit colors and the location/scenery. Draw everything as pixel art from scratch.`,
      typography: `Top of screen — retro game HUD:
"{distance} KM" in large blocky pixel font, like an arcade score.
"PACE {pace} | TIME {time}" in smaller pixel font.
Classic game UI style — score counter with pixelated numbers.`,
      constraints: `OUTPUT MUST BE 100% PIXEL ART. If any part looks like a real photograph, you have failed.
This is NOT photo editing. This is drawing a new pixel art game scene from scratch.
Think of it this way: if someone showed you this photo and said "make a NES game level based on this" — draw THAT.`,
    },
    outputFormat: { aspectRatio: "9:16" as const, style: "pixel" as const },
  },
  magazine: {
    id: "magazine",
    name: "잡지",
    nameEn: "Magazine Cover",
    sections: {
      role: "You are an editorial illustrator and magazine art director creating a high-fashion sports magazine cover.",
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
    outputFormat: { aspectRatio: "9:16" as const, style: "editorial" as const },
  },
  manhwa: {
    id: "manhwa",
    name: "한국 만화",
    nameEn: "Korean Manhwa",
    sections: {
      role: "You are a top Korean webtoon illustrator. You ONLY draw illustrations. You cannot output photographs.",
      transform: `DO NOT MODIFY THE PHOTO. Instead, use the photo as reference and DRAW a completely new Korean webtoon illustration from scratch.

You are illustrating a webtoon panel:
- Draw the person as a webtoon character with clean bold outlines, smooth cel-shading, and expressive features.
- Draw the background as a fully illustrated webtoon scene — sky with fluffy clouds, buildings, scenery all in clean digital illustration style.
- Style: premium Korean webtoon like True Beauty, Solo Leveling, Lookism — realistic proportions, detailed clothing, professional digital coloring.
- Every element must have visible ink outlines and cel-shaded coloring. Zero photographic elements allowed.
- Clothing details must be faithfully drawn — brand logos, shoe designs, patterns, wrinkles.
- The result must look like a panel from a Naver webtoon — if it looks like a photo, you have failed.`,
      preserve: `The same number of people and their EXACT poses — do not change what they're doing.
Every clothing detail: brand logos, text on shirts, shoe brands (Nike, Adidas, etc.), accessories.
Facial features and expressions must be clearly recognizable.
The full background scene composition.`,
      typography: `"{distance} KM" — render these numbers HUGE in the background sky area, like they're part of the scene itself. Soft white or cream color, slightly transparent, behind the characters. The numbers should be massive — taking up a large portion of the upper area. "KM" in smaller text next to the number.

"PACE {pace} | TIME {time}" in clean, minimal sans-serif text at the very bottom of the image. White or light gray, elegant and readable.

The distance number in the sky should feel like a natural part of the illustration — not a text overlay, but like it's painted into the background.`,
      constraints: `Do NOT make it look like Japanese manga or anime — this is KOREAN webtoon style (full color, digital, realistic proportions).
Do NOT simplify clothing details — if they're wearing Adidas, draw the three stripes.
Do NOT make the background plain or empty — illustrate the full scene.`,
    },
    outputFormat: {
      aspectRatio: "9:16" as const,
      style: "illustration" as const,
    },
  },
  receipt: {
    id: "receipt",
    name: "영수증",
    nameEn: "Running Receipt",
    sections: {
      role: "You are a graphic designer creating fun receipt-style layouts.",
      transform: `Transform the entire image into a long receipt / menu-style layout.

The background should be white or off-white paper with subtle paper texture.
The runner's photo from the original image should appear in the middle of the receipt as a small photo — like a food photo on a restaurant menu or a polaroid taped to a receipt.
The photo should have a slight border or tape effect as if it's attached to the paper.`,
      preserve: `The runner's faces and expressions should be recognizable in the embedded photo.
The photo should maintain its original composition, just smaller within the receipt layout.`,
      typography: `Layout the receipt in monospace typewriter font, dark text on paper:

Top area:
"================================"
"     ★ RUNNING RECEIPT ★"
"================================"
"  {date}"
"--------------------------------"

Middle: the runner's photo embedded here like a menu item photo.

Below the photo:
"--------------------------------"
"  TODAY'S RUN"
"  DISTANCE .......... {distance} km"
"  PACE .............. {pace}/km"
"  TIME .............. {time}"
"--------------------------------"
"  SUBTOTAL:        COMPLETED ✓"
"  CALORIES:           BURNED"
"================================"
"    THANK YOU FOR RUNNING!"
"       SEE YOU NEXT TIME"
"================================"

Slightly tilted 1-2 degrees for a casual feel.
Optional: faint coffee stain or crumple on the paper.`,
      constraints: `The overall image should look like a real paper receipt with the runner's photo embedded as a menu item.`,
    },
    outputFormat: {
      aspectRatio: "9:16" as const,
      style: "editorial" as const,
    },
  },
  film: {
    id: "film",
    name: "필름카메라",
    nameEn: "Film Camera",
    sections: {
      role: "You are a nostalgic film photographer from the 80s-90s era.",
      transform: `Make this photo look like it was shot on a cheap disposable film camera from the late 80s or 90s (like Kodak FunSaver or Fuji QuickSnap).

Apply heavy nostalgic film characteristics:
- Strong warm golden/amber color cast — everything looks sun-kissed and warm
- Heavy visible film grain throughout the entire image
- Raised, hazy blacks — shadows should feel foggy and soft, not deep
- Oversaturated reds and yellows, slightly faded blues and greens
- Prominent light leak — a big warm orange or pink light leak bleeding in from one side or corner
- Soft focus overall, slightly blurry edges like a cheap plastic lens
- Strong vignetting darkening the corners
- The overall mood should feel dreamy, warm, and deeply nostalgic — like a photo found in your parents' old photo album`,
      preserve: `The people's faces and poses must remain recognizable.
The general scene composition stays the same.`,
      typography: `Add the iconic 80s-90s film camera date stamp in the bottom-right corner:
Bright orange/red digital date stamp reading "{date}" in that classic blocky LCD date format.

In the bottom-left, add running stats in the same orange date stamp style:
"{distance}km  {pace}  {time}"

The date stamp should glow slightly, just like real film date stamps that burned into the film.
Make the text clearly visible and bold — this is a key visual element, not a subtle detail.`,
      constraints: `Make it look like a real old disposable camera photo, not a modern photo with a filter.
The light leaks, grain, and color cast should be heavy and obvious — this is about maximum nostalgia.`,
    },
    outputFormat: {
      aspectRatio: "9:16" as const,
      style: "photo-overlay" as const,
    },
  },
};
