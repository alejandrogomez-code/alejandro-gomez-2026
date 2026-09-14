'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

export function SignOutButton({ full = true }: { full?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/login');
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      onClick={handleSignOut}
      loading={loading}
      className={full ? 'w-full justify-start' : ''}
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      Cerrar sesión
    </Button>
  );
}
