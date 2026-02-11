import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { vote_type } = await request.json();

    if (!vote_type) {
      return NextResponse.json({ error: '투표 타입을 지정해주세요.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('votes')
      .insert({ vote_type });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vote API error:', error);
    return NextResponse.json({ error: '투표 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { count, error } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ count: count ?? 0 });
  } catch (error) {
    console.error('Vote count error:', error);
    return NextResponse.json({ error: '투표 수 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
