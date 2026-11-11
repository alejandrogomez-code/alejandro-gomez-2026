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
    .replace(/\n\s*\n/g, '\n')
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

    // El feed agrega al final el crédito de la traducción y un aviso de suscripción.
    const lines = text.split('\n').filter((line) => !/^para recibir cada mañana/i.test(line));
    const creditIndex = lines.findIndex((line) => /^extraído de la biblia/i.test(line));
    const translation =
      creditIndex >= 0 ? lines.splice(creditIndex, 1)[0].replace(/^extraído de la biblia:?\s*/i, '').replace(/\.$/, '') : null;

    const info: GospelInfo = {
      date: today,
      liturgicalDay: liturgicalDay || null,
      reference: reference || null,
      text: lines.join('\n').trim(),
      translation,
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
