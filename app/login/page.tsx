import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LoginForm } from './LoginForm';

export const metadata = { title: 'Ingresar · Vida' };

export default async function LoginPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect('/dashboard');

  return (
    <main className="flex min-h-screen items-center justify-center bg-sand-50 px-4 dark:bg-sand-950">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-base font-medium text-white">
            V
          </span>
          <h1 className="text-xl font-medium tracking-tight text-sand-900 dark:text-sand-100">
            Vida
          </h1>
        </div>
        <p className="mt-1 text-sm text-sand-500 dark:text-sand-400">
          Ingresá con tu cuenta para ver tu panel.
        </p>
        <div className="mt-8 rounded-xl border border-sand-200 bg-white p-6 dark:border-sand-800 dark:bg-sand-900">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
