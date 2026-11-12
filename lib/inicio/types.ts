export interface WeatherInfo {
  place: string;
  temperature: number;
  apparent: number;
  code: number;
  isDay: boolean;
  max: number | null;
  min: number | null;
  rainChance: number | null;
}

export interface ReflectionInfo {
  title: string | null;
  author: string | null;
  source: string | null;
  text: string;
}

export interface GospelInfo {
  date: string; // YYYY-MM-DD (hora de Argentina)
  liturgicalDay: string | null;
  reference: string | null;
  text: string;
  translation: string | null;
  reflection: ReflectionInfo | null;
  sourceUrl: string;
}

export interface SaintInfo {
  date: string; // YYYY-MM-DD (hora de Argentina)
  /** Santo principal del día. */
  name: string;
  /** Otros santos y beatos que se recuerdan ese día. */
  others: string[];
  sourceUrl: string;
}

/** Fecha de hoy en Argentina, sin importar el huso horario del servidor. */
export function argentinaToday(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Cordoba',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** Descripción e ícono (nombre lucide) para los códigos WMO de Open-Meteo. */
export function describeWeather(code: number): { label: string; icon: string } {
  if (code === 0) return { label: 'Despejado', icon: 'sun' };
  if (code <= 2) return { label: 'Parcialmente nublado', icon: 'cloud-sun' };
  if (code === 3) return { label: 'Nublado', icon: 'cloud' };
  if (code === 45 || code === 48) return { label: 'Niebla', icon: 'fog' };
  if (code >= 51 && code <= 57) return { label: 'Llovizna', icon: 'drizzle' };
  if (code >= 61 && code <= 67) return { label: 'Lluvia', icon: 'rain' };
  if (code >= 71 && code <= 77) return { label: 'Nieve', icon: 'snow' };
  if (code >= 80 && code <= 82) return { label: 'Chaparrones', icon: 'rain' };
  if (code >= 85 && code <= 86) return { label: 'Nevadas', icon: 'snow' };
  if (code >= 95) return { label: 'Tormenta', icon: 'storm' };
  return { label: '—', icon: 'cloud' };
}
