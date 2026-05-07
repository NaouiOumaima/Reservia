import { apiClient } from '../config';
import { setUser } from '../../helpers/storage';
import type { User } from './type';

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<{ user: User }>('/auth/me');
  const { user } = response.data;
  setUser(user);
  return user;
};