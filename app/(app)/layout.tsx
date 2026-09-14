import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProfileProvider } from '@/components/providers/profile-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AppShell } from '@/components/layout/AppShell';
import { OnboardingGate } from '@/components/onboarding/OnboardingGate';

export const dynamic = 'force-dynamic';

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return (
    <ProfileProvider userId={user.id} email={user.email ?? ''} initialProfile={profile ?? null}>
      <ThemeProvider>
        <AppShell email={user.email ?? ''}>{children}</AppShell>
        <OnboardingGate />
      </ThemeProvider>
    </ProfileProvider>
  );
}
