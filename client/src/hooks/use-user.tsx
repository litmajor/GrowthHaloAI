import { useQuery } from '@tanstack/react-query';
import type { User } from '@shared/schema';

async function fetchMe(): Promise<User | null> {
  try {
    const res = await fetch('/api/me', { credentials: 'include' });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.user ?? null;
  } catch (e) {
    return null;
  }
}

export function useUser() {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ['me'],
    queryFn: fetchMe,
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    user: user ?? null,
    isLoading,
  };
}
