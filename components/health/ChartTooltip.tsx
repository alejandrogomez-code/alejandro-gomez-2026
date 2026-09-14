'use client';

import type { ReactNode } from 'react';

export interface TooltipRow {
  label: string;
  value: ReactNode;
}

/** Tooltip común a todos los gráficos, con los colores del tema activo. */
export function ChartTooltipBox({ title, rows }: { title: string; rows: TooltipRow[] }) {
  return (
    <div
      className="rounded-lg border px-3 py-2 text-xs shadow-float"
      style={{
        background: 'var(--chart-tooltip-bg)',
        borderColor: 'var(--chart-tooltip-border)',
        color: 'var(--chart-tooltip-text)',
      }}
    >
      <p className="font-medium">{title}</p>
      {rows.map((row) => (
        <p key={row.label} className="tabular mt-1 opacity-80">
          {row.label}: {row.value}
        </p>
      ))}
    </div>
  );
}
