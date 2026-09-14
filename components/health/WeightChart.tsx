'use client';

import { useMemo } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { EmptyState } from '@/components/ui/States';
import { ChartTooltipBox } from './ChartTooltip';
import { formatDate, formatNumber, formatShortDate } from '@/lib/calculations/dates';
import type { WeightRecord } from '@/types/database';

export interface WeightChartProps {
  records: WeightRecord[];
  /** Línea horizontal opcional con el peso objetivo. */
  targetWeight?: number | null;
}

interface WeightPoint {
  date: string;
  weight: number;
}

function WeightTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload as WeightPoint;
  return (
    <ChartTooltipBox
      title={formatDate(point.date)}
      rows={[{ label: 'Peso', value: `${formatNumber(point.weight, 1)} kg` }]}
    />
  );
}

export function WeightChart({ records, targetWeight = null }: WeightChartProps) {
  const data = useMemo<WeightPoint[]>(
    () => records.map((record) => ({ date: record.date, weight: Number(record.weight_kg) })),
    [records],
  );

  if (data.length === 0) {
    return <EmptyState title="No hay registros de peso en este período" />;
  }

  const weights = data.map((point) => point.weight);
  const candidates = targetWeight !== null ? [...weights, targetWeight] : weights;
  // Dominio en kilos enteros: las marcas del eje quedan redondas y legibles.
  const min = Math.floor(Math.min(...candidates)) - 1;
  const max = Math.ceil(Math.max(...candidates)) + 1;

  return (
    <div className="h-64 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-weight)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="var(--chart-weight)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => formatShortDate(value)}
            tick={{ fontSize: 11, fill: 'var(--chart-axis)' }}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
            padding={{ left: 12, right: 12 }}
          />
          <YAxis
            domain={[min, max]}
            allowDecimals={false}
            tickFormatter={(value: number) => `${formatNumber(value)} kg`}
            tick={{ fontSize: 11, fill: 'var(--chart-axis)' }}
            tickLine={false}
            axisLine={false}
            width={62}
            tickMargin={8}
          />
          <Tooltip content={<WeightTooltip />} />
          {targetWeight !== null ? (
            <ReferenceLine
              y={targetWeight}
              stroke="var(--chart-reference)"
              strokeDasharray="4 4"
              label={{
                value: `Objetivo ${formatNumber(targetWeight, 1)} kg`,
                position: 'insideTopRight',
                fontSize: 11,
                fill: 'var(--chart-reference)',
              }}
            />
          ) : null}
          <Area
            type="monotone"
            dataKey="weight"
            stroke="none"
            fill="url(#weightFill)"
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="var(--chart-weight)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: 'var(--chart-weight)', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
