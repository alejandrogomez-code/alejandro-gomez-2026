import { NextResponse } from 'next/server';
import type { WeatherInfo } from '@/lib/inicio/types';

export const dynamic = 'force-dynamic';

// Córdoba capital.
const LAT = -31.4201;
const LON = -64.1888;

export async function GET() {
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${LAT}&longitude=${LON}` +
    '&current=temperature_2m,apparent_temperature,weather_code,is_day' +
    '&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
    '&timezone=America%2FArgentina%2FCordoba&forecast_days=1';

  try {
    const res = await fetch(url, { next: { revalidate: 900 } });
    if (!res.ok) throw new Error(`Open-Meteo respondió ${res.status}`);
    const data = await res.json();

    const info: WeatherInfo = {
      place: 'Córdoba',
      temperature: data.current.temperature_2m,
      apparent: data.current.apparent_temperature,
      code: data.current.weather_code,
      isDay: data.current.is_day === 1,
      max: data.daily?.temperature_2m_max?.[0] ?? null,
      min: data.daily?.temperature_2m_min?.[0] ?? null,
      rainChance: data.daily?.precipitation_probability_max?.[0] ?? null,
    };
    return NextResponse.json(info);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No se pudo obtener el clima' },
      { status: 502 },
    );
  }
}
