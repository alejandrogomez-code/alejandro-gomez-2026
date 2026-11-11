'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Trash2, Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { TaskList } from '@/components/agenda/TaskList';
import { useRows } from '@/hooks/useRows';
import { formatLongDate, formatShortDate, todayString } from '@/lib/calculations/dates';
import { cn } from '@/lib/utils';
import type { Meeting } from '@/types/database';

export default function ReunionesPage() {
  const { toast } = useToast();
  const { rows: meetings, loading, error, create, update, remove } = useRows('meetings', {
    order: [{ column: 'date', ascending: false }, { column: 'created_at', ascending: false }],
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState({ title: '', date: todayString(), attendees: '' });
  const [pendingDelete, setPendingDelete] = useState<Meeting | null>(null);

  const selected = meetings.find((meeting) => meeting.id === selectedId) ?? meetings[0] ?? null;

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!draft.title.trim()) return;
    const meeting = await create({
      title: draft.title.trim(),
      date: draft.date || todayString(),
      attendees: draft.attendees.trim() || null,
    });
    setSelectedId(meeting.id);
    setDraft({ title: '', date: todayString(), attendees: '' });
    setFormOpen(false);
    toast('Reunión creada');
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reuniones"
        description="Temas, decisiones y compromisos. Cada compromiso queda como pendiente de Trabajo."
        icon={Users}
        accent="plum"
        action={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nueva reunión
          </Button>
        }
      />

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState /> : null}

      {!loading && meetings.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users className="h-8 w-8" aria-hidden="true" />}
            title="Todavía no registraste reuniones"
            description="Anotá de qué se habló, qué se decidió y quién se comprometió a qué."
            action={<Button onClick={() => setFormOpen(true)}>Registrar la primera</Button>}
          />
        </Card>
      ) : null}

      {selected ? (
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <Card>
            <CardHeader title="Historial" />
            <ul className="space-y-1 px-3 pb-4">
              {meetings.map((meeting) => (
                <li key={meeting.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(meeting.id)}
                    aria-current={meeting.id === selected.id ? 'true' : undefined}
                    className={cn(
                      'flex min-h-[44px] w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition-colors',
                      meeting.id === selected.id
                        ? 'bg-plum-50 dark:bg-plum-500/10'
                        : 'hover:bg-sand-50 dark:hover:bg-sand-800/60',
                    )}
                  >
                    <span className="tabular w-12 shrink-0 text-xs font-bold text-plum-600 dark:text-plum-200">
                      {formatShortDate(meeting.date)}
                    </span>
                    <span className="truncate text-sm font-bold text-sand-900 dark:text-sand-100">
                      {meeting.title}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <MeetingDetail
            key={selected.id}
            meeting={selected}
            onSave={async (values) => {
              await update(selected.id, values);
              toast('Guardado');
            }}
            onDelete={() => setPendingDelete(selected)}
          />
        </div>
      ) : null}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Nueva reunión">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Tema"
            placeholder="Ej.: Comité de calidad"
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Fecha"
              type="date"
              value={draft.date}
              onChange={(event) => setDraft({ ...draft, date: event.target.value })}
            />
            <Input
              label="Participantes"
              placeholder="Opcional"
              value={draft.attendees}
              onChange={(event) => setDraft({ ...draft, attendees: event.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Crear</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Eliminar reunión"
        description={`Se va a eliminar "${pendingDelete?.title ?? ''}". Sus compromisos quedan como pendientes sueltos.`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await remove(pendingDelete.id);
          setPendingDelete(null);
          setSelectedId(null);
          toast('Reunión eliminada');
        }}
      />
    </div>
  );
}

function MeetingDetail({
  meeting,
  onSave,
  onDelete,
}: {
  meeting: Meeting;
  onSave: (values: { notes: string | null; decisions: string | null; attendees: string | null }) => Promise<void>;
  onDelete: () => void;
}) {
  const [notes, setNotes] = useState(meeting.notes ?? '');
  const [decisions, setDecisions] = useState(meeting.decisions ?? '');
  const [attendees, setAttendees] = useState(meeting.attendees ?? '');
  const [saving, setSaving] = useState(false);
  const dirty =
    notes !== (meeting.notes ?? '') ||
    decisions !== (meeting.decisions ?? '') ||
    attendees !== (meeting.attendees ?? '');

  useEffect(() => {
    setNotes(meeting.notes ?? '');
    setDecisions(meeting.decisions ?? '');
    setAttendees(meeting.attendees ?? '');
  }, [meeting]);

  async function save() {
    setSaving(true);
    try {
      await onSave({
        notes: notes.trim() || null,
        decisions: decisions.trim() || null,
        attendees: attendees.trim() || null,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
          <div className="min-w-0">
            <p className="text-xs font-bold capitalize text-plum-600 dark:text-plum-200">
              {formatLongDate(meeting.date)}
            </p>
            <h2 className="text-xl font-extrabold text-sand-900 dark:text-sand-100">{meeting.title}</h2>
          </div>
          <Button variant="ghost" size="icon" aria-label="Eliminar reunión" onClick={onDelete}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <CardContent className="space-y-4">
          <Input label="Participantes" value={attendees} onChange={(event) => setAttendees(event.target.value)} />
          <Textarea
            label="Temas tratados"
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
          <Textarea
            label="Decisiones"
            rows={3}
            value={decisions}
            onChange={(event) => setDecisions(event.target.value)}
          />
          <div className="flex justify-end">
            <Button onClick={() => void save()} loading={saving} disabled={!dirty}>
              Guardar cambios
            </Button>
          </div>
        </CardContent>
      </Card>

      <TaskList
        area="trabajo"
        meetingId={meeting.id}
        title="Compromisos"
        description="También aparecen en tus pendientes de Trabajo."
        placeholder="Ej.: Enviar minuta a los socios"
        emptyTitle="Sin compromisos cargados"
      />
    </div>
  );
}
