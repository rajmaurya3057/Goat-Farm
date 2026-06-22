import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { tokenStorage } from '../utils/tokenStorage';
import { AuthContext } from './authContext';

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [sessionActive, setSessionActive] = useState(() => Boolean(tokenStorage.get()));

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const { data } = await authApi.getMe();
        return data.data;
      } catch (error) {
        tokenStorage.clear();
        throw error;
      }
    },
    enabled: sessionActive,
    retry: false,
    staleTime: Infinity,
  });

  const login = useCallback(
    async (credentials) => {
      const { data } = await authApi.login(credentials);
      const { token, user: loggedInUser } = data.data;
      tokenStorage.set(token);
      setSessionActive(true);
      queryClient.setQueryData(['auth', 'me'], loggedInUser);
      return loggedInUser;
    },
    [queryClient]
  );

  const logout = useCallback(() => {
    tokenStorage.clear();
    setSessionActive(false);
    queryClient.removeQueries({ queryKey: ['auth', 'me'] });
  }, [queryClient]);

  const user = meQuery.isError ? null : meQuery.data ?? null;
  const loading = sessionActive && meQuery.isLoading;

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
