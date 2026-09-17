import { cn } from '@/lib/utils';

/**
 * Marca de Vida: un segmento por cada área de la app, en su color.
 * Se usa como logo y como franja en el encabezado del panel.
 */
const SEGMENTS = [
  'bg-ocean-500',
  'bg-plum-500',
  'bg-coral-500',
  'bg-sage-500',
  'bg-honey-500',
];

export function VidaMark({ className, segmentClassName }: { className?: string; segmentClassName?: string }) {
  return (
    <span className={cn('flex gap-1', className)} aria-hidden="true">
      {SEGMENTS.map((color) => (
        <span key={color} className={cn('h-1.5 flex-1 rounded-full', color, segmentClassName)} />
      ))}
    </span>
  );
}
