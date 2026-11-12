import { NextResponse } from 'next/server';
import { argentinaToday, type SaintInfo } from '@/lib/inicio/types';

export const dynamic = 'force-dynamic';

const BASE = 'https://feed.evangelizo.org/v2/reader.php';

function cleanText(raw: string): string {
  return raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}

export async function GET() {
  const today = argentinaToday();
  const date = today.replaceAll('-', '');
  const query = new URLSearchParams({ lang: 'SP', date, type: 'saint' });

  try {
    // El santoral no cambia durante el día: se cachea 6 horas.
    const res = await fetch(`${BASE}?${query}`, { next: { revalidate: 21600 } });
    if (!res.ok) throw new Error(`Evangelizo respondió ${res.status}`);
    const text = cleanText(await res.text());
    if (!text || text.toLowerCase().startsWith('error')) throw new Error(text || 'Sin santo');

    const names = text
      .split('\n')
      .map((line) => line.trim().replace(/[.;,]+$/, ''))
      .filter((line) => line && !/^para recibir cada mañana/i.test(line));
    // Sin duplicados, conservando el orden.
    const unique = Array.from(new Set(names));
    if (unique.length === 0) throw new Error('Sin santo');

    const info: SaintInfo = {
      date: today,
      name: unique[0],
      others: unique.slice(1),
      sourceUrl: 'https://evangeliodeldia.org/SP/saints',
    };
    return NextResponse.json(info);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No se pudo obtener el santo del día' },
      { status: 502 },
    );
  }
}
