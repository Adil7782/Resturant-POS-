import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export type User = {
  id: number;
  username: string;
  role: 'cashier' | 'admin';
  name: string;
};

export type Session = {
  user: User;
  token: string;
};

// Mock authentication - in production this would use proper session management
const MOCK_USERS: Record<string, { id: number; username: string; role: 'cashier' | 'admin'; name: string; password: string }> = {
  cashier: {
    id: 1,
    username: 'cashier',
    role: 'cashier',
    name: 'Cashier User',
    password: 'cashier123'
  },
  admin: {
    id: 2,
    username: 'admin',
    role: 'admin',
    name: 'Admin User',
    password: 'admin123'
  }
};

export async function verifyCredentials(username: string, password: string): Promise<User | null> {
  const user = MOCK_USERS[username];
  if (user && user.password === password) {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
}

export function getMockUsers() {
  return Object.values(MOCK_USERS).map(u => {
    const { password: _, ...userWithoutPassword } = u;
    return userWithoutPassword;
  });
}

export async function getUserById(id: number): Promise<User | null> {
  const user = Object.values(MOCK_USERS).find(u => u.id === id);
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
}
