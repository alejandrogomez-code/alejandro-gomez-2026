'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/login');
    router.refresh();
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        disabled={loading}
        aria-label="Cerrar sesión"
        className="rounded-md p-1 text-sand-400 transition-colors hover:bg-sand-100 hover:text-sand-700 disabled:opacity-50 dark:hover:bg-sand-800"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
      </button>
    );
  }

  return (
    <Button variant="secondary" onClick={handleSignOut} loading={loading}>
      <LogOut className="h-4 w-4" aria-hidden="true" />
      Cerrar sesión
    </Button>
  );
}
