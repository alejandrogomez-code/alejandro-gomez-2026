'use client';

import { useEffect, useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Moon,
  Sparkles,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { describeWeather, type GospelInfo, type WeatherInfo } from '@/lib/inicio/types';

const WEATHER_ICONS: Record<string, LucideIcon> = {
  sun: Sun,
  'cloud-sun': CloudSun,
  cloud: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
};

type Load<T> = { status: 'loading' } | { status: 'error' } | { status: 'ok'; data: T };

function useJson<T>(url: string): Load<T> {
  const [state, setState] = useState<Load<T>>({ status: 'loading' });
  useEffect(() => {
    let alive = true;
    fetch(url)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: T) => alive && setState({ status: 'ok', data }))
      .catch(() => alive && setState({ status: 'error' }));
    return () => {
      alive = false;
    };
  }, [url]);
  return state;
}

const round = (value: number) => Math.round(value);

function WeatherCard() {
  const state = useJson<WeatherInfo>('/api/inicio/clima');

  return (
    <section
      aria-label="Clima en Córdoba"
      className="flex flex-col gap-3 rounded-3xl bg-ocean-200 p-5 text-ocean-900"
    >
      <span className="text-xs font-extrabold uppercase tracking-wide">Clima · Córdoba</span>

      {state.status === 'loading' ? (
        <div className="h-16 animate-pulse rounded-2xl bg-white/40" />
      ) : state.status === 'error' ? (
        <p className="text-sm font-semibold">No se pudo cargar el clima ahora.</p>
      ) : (
        (() => {
          const w = state.data;
          const { label, icon } = describeWeather(w.code);
          const Icon = !w.isDay && (icon === 'sun' || icon === 'cloud-sun') ? Moon : WEATHER_ICONS[icon] ?? Cloud;
          return (
            <>
              <div className="flex items-center gap-4">
                <Icon className="h-12 w-12 shrink-0" aria-hidden="true" />
                <div>
                  <p className="tabular text-4xl font-extrabold leading-none tracking-tight">
                    {round(w.temperature)}°
                  </p>
                  <p className="mt-1 text-sm font-bold">{label}</p>
                </div>
              </div>
              <p className="tabular flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold">
                <span>Sensación {round(w.apparent)}°</span>
                {w.max !== null && w.min !== null ? (
                  <span>
                    Máx {round(w.max)}° · Mín {round(w.min)}°
                  </span>
                ) : null}
                {w.rainChance !== null ? (
                  <span className="inline-flex items-center gap-1">
                    <Droplets className="h-3.5 w-3.5" aria-hidden="true" />
                    {w.rainChance}% lluvia
                  </span>
                ) : null}
              </p>
            </>
          );
        })()
      )}
    </section>
  );
}

function ToggleButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full bg-white/60 px-3 py-1.5 text-xs font-bold transition hover:bg-white dark:bg-white/10 dark:hover:bg-white/20"
      aria-expanded={open}
    >
      {open ? 'Mostrar menos' : 'Leer completo'}
      <ChevronDown className={cn('h-3.5 w-3.5 transition', open && 'rotate-180')} aria-hidden="true" />
    </button>
  );
}

function GospelCard() {
  const state = useJson<GospelInfo>('/api/inicio/evangelio');
  const [gospelOpen, setGospelOpen] = useState(false);
  const [reflectionOpen, setReflectionOpen] = useState(false);

  return (
    <section
      aria-label="Evangelio del día"
      className="flex flex-col gap-3 rounded-3xl bg-amber-100 p-5 text-amber-900 dark:bg-amber-400/15 dark:text-amber-50"
    >
      <span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide">
        <BookOpen className="h-4 w-4" aria-hidden="true" />
        Evangelio del día
      </span>

      {state.status === 'loading' ? (
        <div className="h-16 animate-pulse rounded-2xl bg-white/40" />
      ) : state.status === 'error' ? (
        <p className="text-sm font-semibold">No se pudo cargar el evangelio ahora.</p>
      ) : (
        <>
          <div>
            {state.data.reference ? (
              <p className="text-base font-extrabold leading-snug">{state.data.reference}</p>
            ) : null}
            {state.data.liturgicalDay ? (
              <p className="mt-0.5 text-xs font-semibold opacity-80">{state.data.liturgicalDay}</p>
            ) : null}
          </div>
          <p className={cn('whitespace-pre-line text-sm leading-relaxed', !gospelOpen && 'line-clamp-3')}>
            {state.data.text}
          </p>
          <div>
            <ToggleButton open={gospelOpen} onClick={() => setGospelOpen((value) => !value)} />
          </div>

          {state.data.reflection ? (
            <div className="mt-1 flex flex-col gap-2 rounded-2xl bg-white/55 p-4 dark:bg-white/5">
              <span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Reflexión
              </span>
              {state.data.reflection.title ? (
                <p className="text-sm font-extrabold leading-snug">{state.data.reflection.title}</p>
              ) : null}
              {state.data.reflection.author || state.data.reflection.source ? (
                <p className="text-xs font-semibold opacity-80">
                  {[state.data.reflection.author, state.data.reflection.source].filter(Boolean).join(' · ')}
                </p>
              ) : null}
              <p
                className={cn(
                  'whitespace-pre-line text-sm leading-relaxed',
                  !reflectionOpen && 'line-clamp-4',
                )}
              >
                {state.data.reflection.text}
              </p>
              <div>
                <ToggleButton
                  open={reflectionOpen}
                  onClick={() => setReflectionOpen((value) => !value)}
                />
              </div>
            </div>
          ) : null}

          <a
            href={state.data.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="self-end text-xs font-bold opacity-70 hover:underline"
          >
            {state.data.translation ? `${state.data.translation} · ` : ''}Fuente: Evangelio del Día
          </a>
        </>
      )}
    </section>
  );
}

/** Franja de inicio del panel: clima de Córdoba, evangelio y reflexión del día. */
export function DailyInfo() {
  return (
    <div className="grid items-start gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-4">
      <WeatherCard />
      <GospelCard />
    </div>
  );
}
