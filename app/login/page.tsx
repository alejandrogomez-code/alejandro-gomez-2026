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
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
          Vida
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Ingresá con tu cuenta para ver tu panel.
        </p>
        <div className="mt-8 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-card dark:border-neutral-800 dark:bg-neutral-900">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
