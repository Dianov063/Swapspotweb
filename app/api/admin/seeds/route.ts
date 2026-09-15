import { NextResponse } from 'next/server';
import { requireAnalyticsAccess } from '@/lib/googleServerApis';
import { supabaseAdminFetch } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  try {
    requireAnalyticsAccess(request);
    const q = new URL(request.url).searchParams;
    const country = q.get('country')?.toUpperCase() || null;
    const category = q.get('category') || null;
    const photo = q.get('photo') || null;
    if ((country && !/^[A-Z]{2}$/.test(country)) || (category && !/^[\da-f]{8}(-[\da-f]{4}){3}-[\da-f]{12}$/i.test(category)) || (photo && !['with', 'without'].includes(photo))) {
      return NextResponse.json({ error: 'Некорректный фильтр' }, { status: 400 });
    }
    const page = Math.min(100000, Math.max(1, Number.parseInt(q.get('page') || '1', 10) || 1));
    const response = await supabaseAdminFetch('rpc/admin_seed_directory', {
      method: 'POST',
      body: JSON.stringify({ country_filter: country, category_filter: category, search_text: q.get('search')?.trim().slice(0, 200) || null, photo_filter: photo, page_number: page, page_size: 25 }),
    });
    if (!response.ok) throw new Error('Не удалось загрузить каталог сидов');
    const data = await response.json();
    return NextResponse.json({ ...data, page, pageSize: 25 }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось загрузить каталог';
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500, headers: { 'Cache-Control': 'private, no-store' } });
  }
}
