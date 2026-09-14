'use client';

import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/ui/States';
import { ChartTooltipBox } from '@/components/health/ChartTooltip';
import {
  addDays,
  formatShortDate,
  formatPercent,
  startOfWeek,
  toDateString,
} from '@/lib/calculations/dates';
import { buildHabitContext, calculateWeeklyCompletion } from '@/lib/calculations/habits';
import type { Habit, HabitRecord, StepRecord } from '@/types/database';

type RangeKey = '4' | '8' | '12' | '26';

const RANGES: { value: RangeKey; label: string }[] = [
  { value: '4', label: '4 semanas' },
  { value: '8', label: '8 semanas' },
  { value: '12', label: '3 meses' },
  { value: '26', label: '6 meses' },
];

interface WeekPoint {
  weekStart: string;
  percentage: number;
  completed: number;
  expected: number;
}

function WeekTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload as WeekPoint;
  return (
    <ChartTooltipBox
      title={`Semana del ${formatShortDate(point.weekStart)}`}
      rows={[
        { label: 'Cumplimiento', value: formatPercent(point.percentage, 0) },
        { label: 'Instancias', value: `${point.completed}/${point.expected}` },
      ]}
    />
  );
}

export interface HabitStatsProps {
  habits: Habit[];
  habitRecords: HabitRecord[];
  stepRecords: StepRecord[];
  onRangeChange?: (weeks: number) => void;
}

/** Histórico de cumplimiento semanal. */
export function HabitStats({
  habits,
  habitRecords,
  stepRecords,
  onRangeChange,
}: HabitStatsProps) {
  const [range, setRange] = useState<RangeKey>('8');

  const data = useMemo<WeekPoint[]>(() => {
    const context = buildHabitContext(habitRecords, stepRecords);
    const weeks = Number(range);
    const currentWeekStart = startOfWeek(new Date());
    const points: WeekPoint[] = [];

    for (let index = weeks - 1; index >= 0; index -= 1) {
      const start = addDays(currentWeekStart, -7 * index);
      const end = addDays(start, 6);
      const result = calculateWeeklyCompletion(
        habits,
        toDateString(start),
        toDateString(end),
        context,
      );
      points.push({
        weekStart: toDateString(start),
        percentage: result.percentage,
        completed: result.completed,
        expected: result.expected,
      });
    }

    return points;
  }, [habits, habitRecords, stepRecords, range]);

  const hasData = data.some((point) => point.expected > 0);

  return (
    <Card>
      <CardHeader
        title="Histórico de cumplimiento"
        description="Porcentaje semanal sobre las instancias previstas."
        action={
          <Tabs
            items={RANGES}
            value={range}
            ariaLabel="Período del histórico"
            onChange={(value) => {
              setRange(value);
              onRangeChange?.(Number(value));
            }}
          />
        }
      />
      <CardContent>
        {!hasData ? (
          <EmptyState title="Todavía no hay suficientes datos" />
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                <XAxis
                  dataKey="weekStart"
                  tickFormatter={(value: string) => formatShortDate(value)}
                  tick={{ fontSize: 11, fill: 'var(--chart-axis)' }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={20}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(value: number) => `${value}%`}
                  tick={{ fontSize: 11, fill: 'var(--chart-axis)' }}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  tickMargin={8}
                />
                <Tooltip content={<WeekTooltip />} />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="var(--chart-habits)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: 'var(--chart-habits)', strokeWidth: 0 }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
