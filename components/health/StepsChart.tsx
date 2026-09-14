'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { EmptyState } from '@/components/ui/States';
import { ChartTooltipBox } from './ChartTooltip';
import { formatDate, formatNumber, formatPercent, formatShortDate } from '@/lib/calculations/dates';
import { buildStepSeries, calculateStepCompletion } from '@/lib/calculations/steps';
import type { StepRecord } from '@/types/database';

export interface StepsChartProps {
  records: StepRecord[];
  dailyGoal: number;
  days: number;
}

interface StepPoint {
  date: string;
  steps: number;
}

function StepsTooltip({ active, payload, goal }: TooltipProps<number, string> & { goal: number }) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload as StepPoint;
  return (
    <ChartTooltipBox
      title={formatDate(point.date)}
      rows={[
        { label: 'Pasos', value: formatNumber(point.steps) },
        { label: 'Objetivo', value: formatPercent(calculateStepCompletion(point.steps, goal)) },
      ]}
    />
  );
}

export function StepsChart({ records, dailyGoal, days }: StepsChartProps) {
  const data = useMemo(() => buildStepSeries(records, days), [records, days]);
  const hasData = data.some((point) => point.steps > 0);

  if (!hasData) {
    return <EmptyState title="No hay registros de pasos en este período" />;
  }

  return (
    <div className="h-64 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => formatShortDate(value)}
            tick={{ fontSize: 11, fill: 'var(--chart-axis)' }}
            tickLine={false}
            axisLine={false}
            minTickGap={16}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--chart-axis)' }}
            tickFormatter={(value: number) => (value >= 1000 ? `${value / 1000}k` : String(value))}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            cursor={{ fill: 'var(--chart-grid)', opacity: 0.4 }}
            content={<StepsTooltip goal={dailyGoal} />}
          />
          <ReferenceLine
            y={dailyGoal}
            stroke="var(--chart-reference)"
            strokeDasharray="4 4"
            label={{
              value: `Objetivo ${formatNumber(dailyGoal)}`,
              position: 'insideTopRight',
              fontSize: 11,
              fill: 'var(--chart-reference)',
            }}
          />
          <Bar dataKey="steps" radius={[4, 4, 0, 0]} maxBarSize={28}>
            {data.map((point) => (
              <Cell
                key={point.date}
                fill={point.steps >= dailyGoal ? 'var(--chart-bar-active)' : 'var(--chart-bar)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
