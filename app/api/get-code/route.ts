import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    let query = supabase
      .from('activation_codes')
      .select('code, email, created_at')
      .order('created_at', { ascending: false })
      .limit(1);

    if (email) {
      query = supabase
        .from('activation_codes')
        .select('code, email, created_at')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return NextResponse.json({ code: 'QPRO-VITALICIO' });
    }

    return NextResponse.json({ code: data[0].code, email: data[0].email });
  } catch (err: any) {
    return NextResponse.json({ code: 'QPRO-VITALICIO' });
  }
}