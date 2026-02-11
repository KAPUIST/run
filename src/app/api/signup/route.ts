import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: '이름과 이메일은 필수입니다.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('emails')
      .insert({ name, email, phone });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Signup API error:', error);
    return NextResponse.json({ error: '등록 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
