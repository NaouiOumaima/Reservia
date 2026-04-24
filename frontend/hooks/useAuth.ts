'use client';

import { useAuth } from '@/providers/AuthProvider';

export const useAuthHook = () => {
  return useAuth();
};

export { useAuth };
