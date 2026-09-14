'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile, ProfileUpdate } from '@/types/database';

interface ProfileContextValue {
  userId: string;
  email: string;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateProfile: (values: ProfileUpdate) => Promise<Profile | null>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({
  userId,
  email,
  initialProfile,
  children,
}: {
  userId: string;
  email: string;
  initialProfile: Profile | null;
  children: ReactNode;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [loading, setLoading] = useState(initialProfile === null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error: queryError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (queryError) {
      setError(queryError.message);
    } else {
      setProfile(data);
      setError(null);
    }
    setLoading(false);
  }, [supabase, userId]);

  useEffect(() => {
    if (initialProfile === null) void refresh();
  }, [initialProfile, refresh]);

  const updateProfile = useCallback(
    async (values: ProfileUpdate) => {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(values)
        .eq('id', userId)
        .select('*')
        .single();

      if (updateError) {
        setError(updateError.message);
        throw new Error(updateError.message);
      }

      setProfile(data);
      return data;
    },
    [supabase, userId],
  );

  const value = useMemo(
    () => ({ userId, email, profile, loading, error, refresh, updateProfile }),
    [userId, email, profile, loading, error, refresh, updateProfile],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfileContext(): ProfileContextValue {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile debe usarse dentro de ProfileProvider');
  }
  return context;
}

/** Id del usuario autenticado, disponible en toda la app privada. */
export function useUserId(): string {
  return useProfileContext().userId;
}
