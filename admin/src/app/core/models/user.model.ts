export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: 'user' | 'admin';
  emailVerified: boolean;
}

