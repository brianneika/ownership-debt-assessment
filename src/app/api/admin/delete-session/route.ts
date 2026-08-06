import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, verifyToken } from '@/lib/auth';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/admin/login?next=/admin', request.url));
  }

  const session = await verifyToken(token);
  if (!session) {
    return NextResponse.redirect(new URL('/admin/login?next=/admin', request.url));
  }

  const formData = await request.formData();
  const rawSessionId = formData.get('sessionId');
  const sessionId = String(rawSessionId ?? '').trim();

  if (!sessionId) {
    return NextResponse.json({ error: 'A valid session id is required.' }, { status: 400 });
  }

  const supabase = getSupabaseServer();
  const { error } = await supabase.from('assessment_sessions').delete().eq('id', sessionId);

  if (error) {
    return NextResponse.json({ error: `Failed to delete assessment session: ${error.message}` }, { status: 500 });
  }

  revalidatePath('/admin');
  return NextResponse.redirect(new URL('/admin', request.url));
}
