'use client';

import { useState, type FormEvent } from 'react';
import { NotebookPen, Pin, PinOff, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { useRows } from '@/hooks/useRows';
import { AREAS, AREA_OPTIONS } from '@/lib/areas';
import { ACCENTS } from '@/lib/accents';
import { formatShortDate } from '@/lib/calculations/dates';
import { cn } from '@/lib/utils';
import type { Area } from '@/types/database';

type Filter = Area | 'todas';

export default function NotasPage() {
  const { toast } = useToast();
  const { rows: notes, loading, error, create, update, remove } = useRows('notes', {
    order: [
      { column: 'pinned', ascending: false },
      { column: 'created_at', ascending: false },
    ],
  });
  const [filter, setFilter] = useState<Filter>('todas');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [area, setArea] = useState<Area>('personal');
  const [saving, setSaving] = useState(false);

  const visible = notes
    .filter((note) => filter === 'todas' || note.area === filter)
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;
    setSaving(true);
    try {
      await create({ title: title.trim() || null, body: body.trim(), area });
      setTitle('');
      setBody('');
      toast('Nota guardada');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notas"
        description="Ideas, apuntes y lo que no querés olvidarte."
        icon={NotebookPen}
        accent="clay"
      />

      <Card>
        <CardContent className="pt-5">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <Input placeholder="Título (opcional)" aria-label="Título" value={title} onChange={(event) => setTitle(event.target.value)} />
              <Select aria-label="Área" options={AREA_OPTIONS} value={area} onChange={(event) => setArea(event.target.value as Area)} />
            </div>
            <Textarea
              aria-label="Nota"
              placeholder="Escribí tu nota…"
              rows={3}
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
            <div className="flex justify-end">
              <Button type="submit" loading={saving} disabled={!body.trim()}>
                Guardar nota
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="overflow-x-auto">
        <Tabs
          items={[{ value: 'todas', label: 'Todas' }, ...AREA_OPTIONS]}
          value={filter}
          onChange={setFilter}
          ariaLabel="Filtrar notas por área"
        />
      </div>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState /> : null}

      {!loading && visible.length === 0 ? (
        <EmptyState icon={<NotebookPen className="h-8 w-8" aria-hidden="true" />} title="No hay notas acá" />
      ) : (
        <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((note) => {
            const meta = AREAS[note.area];
            return (
              <article
                key={note.id}
                className={cn('rounded-3xl p-5', ACCENTS[meta.accent].soft, note.pinned ? 'ring-2 ring-brand-800 dark:ring-brand-300' : '')}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase', ACCENTS[meta.accent].chip)}>
                    {meta.label}
                  </span>
                  <div className="flex gap-0.5">
                    <button
                      type="button"
                      onClick={() => void update(note.id, { pinned: !note.pinned })}
                      aria-label={note.pinned ? 'Desfijar nota' : 'Fijar nota'}
                      className="rounded-full p-1.5 text-sand-500 hover:bg-white dark:hover:bg-sand-800"
                    >
                      {note.pinned ? <PinOff className="h-4 w-4" aria-hidden="true" /> : <Pin className="h-4 w-4" aria-hidden="true" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(note.id)}
                      aria-label="Eliminar nota"
                      className="rounded-full p-1.5 text-sand-500 hover:bg-white hover:text-clay-500 dark:hover:bg-sand-800"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                {note.title ? (
                  <h2 className="mt-3 text-base font-extrabold text-sand-900 dark:text-sand-100">{note.title}</h2>
                ) : null}
                <p className="mt-2 whitespace-pre-line text-sm text-sand-700 dark:text-sand-300">{note.body}</p>
                <p className="mt-3 text-xs text-sand-500">{formatShortDate(note.created_at.slice(0, 10))}</p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
