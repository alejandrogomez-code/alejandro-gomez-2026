import { NextResponse } from 'next/server';
import { argentinaToday, type GospelInfo } from '@/lib/inicio/types';

export const dynamic = 'force-dynamic';

const BASE = 'https://feed.evangelizo.org/v2/reader.php';

function cleanText(raw: string): string {
  return raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function read(params: Record<string, string>): Promise<string> {
  const query = new URLSearchParams({ lang: 'SP', ...params });
  // El evangelio no cambia durante el día: se cachea 6 horas.
  const res = await fetch(`${BASE}?${query}`, { next: { revalidate: 21600 } });
  if (!res.ok) throw new Error(`Evangelizo respondió ${res.status}`);
  const text = cleanText(await res.text());
  if (text.toLowerCase().startsWith('error')) throw new Error(text);
  return text;
}

export async function GET() {
  const today = argentinaToday();
  const date = today.replaceAll('-', '');

  try {
    const [liturgicalDay, reference, text] = await Promise.all([
      read({ date, type: 'liturgic_t' }).catch(() => ''),
      read({ date, type: 'reading_lt', content: 'GSP' }).catch(() => ''),
      read({ date, type: 'reading', content: 'GSP' }),
    ]);

    const info: GospelInfo = {
      date: today,
      liturgicalDay: liturgicalDay || null,
      reference: reference || null,
      text,
      sourceUrl: 'https://evangeliodeldia.org/SP/gospel',
    };
    return NextResponse.json(info);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No se pudo obtener el evangelio' },
      { status: 502 },
    );
  }
}
