import { NextRequest, NextResponse } from 'next/server';
import { track } from '@vercel/analytics/server';
import { ai, STYLE_CONFIGS, buildPrompt } from '@/lib/gemini';

// Gemini image generation can take 10-30s
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    const style = formData.get('style') as string | null;
    const distance = (formData.get('distance') as string) || '5.0';
    const pace = (formData.get('pace') as string) || "5'30\"";
    const time = (formData.get('time') as string) || '27:30';

    if (!image || !style) {
      return NextResponse.json(
        { error: '이미지와 스타일을 모두 선택해주세요.' },
        { status: 400 }
      );
    }

    const config = STYLE_CONFIGS[style];
    if (!config) {
      return NextResponse.json(
        { error: '지원하지 않는 스타일입니다.' },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: 'Google AI API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // Convert file to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = image.type || 'image/jpeg';

    const prompt = buildPrompt(config, {
      distance,
      pace,
      time,
      date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }),
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [
        { text: prompt },
        {
          inlineData: {
            mimeType,
            data: base64,
          },
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    // Extract image from response
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      return NextResponse.json(
        { error: 'AI 응답이 비어있습니다.' },
        { status: 500 }
      );
    }

    const imagePart = parts.find((p: { inlineData?: unknown }) => p.inlineData);
    if (!imagePart || !('inlineData' in imagePart)) {
      return NextResponse.json(
        { error: 'AI가 이미지를 생성하지 못했습니다. 다시 시도해주세요.' },
        { status: 500 }
      );
    }

    // Return base64 image as data URI
    const resultData = (imagePart as { inlineData: { mimeType: string; data: string } }).inlineData;
    const dataUri = `data:${resultData.mimeType};base64,${resultData.data}`;

    await track('image_generated', { style: style! }, { request });

    return NextResponse.json({ url: dataUri });
  } catch (error) {
    console.error('Generate API error:', error);
    return NextResponse.json(
      { error: 'AI 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
