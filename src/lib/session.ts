import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUserId() {
  const session = await getSession();
  return session?.user?.id;
}
