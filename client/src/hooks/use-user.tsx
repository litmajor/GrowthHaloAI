import { useQuery } from '@tanstack/react-query';
import type { User } from '@shared/schema';

export function useUser() {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ['/api/user'],
  });

  return {
    user: user ?? null,
    isLoading,
  };
}
