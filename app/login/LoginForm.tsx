'use client';

import { useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorState } from '@/components/ui/States';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(
        signInError.message === 'Invalid login credentials'
          ? 'Email o contraseña incorrectos.'
          : signInError.message,
      );
      setLoading(false);
      return;
    }

    const redirectTo = searchParams.get('redirectTo') ?? '/dashboard';
    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email"
        type="email"
        value={email}
        autoComplete="email"
        required
        onChange={(event) => setEmail(event.target.value)}
      />
      <Input
        label="Contraseña"
        type="password"
        value={password}
        autoComplete="current-password"
        required
        onChange={(event) => setPassword(event.target.value)}
      />
      {error ? <ErrorState message={error} /> : null}
      <Button type="submit" className="w-full" loading={loading}>
        Ingresar
      </Button>
      <p className="text-center text-xs text-mist-400">
        Cuenta personal: el alta se hace desde el panel de Supabase.
      </p>
    </form>
  );
}
