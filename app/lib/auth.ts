import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { User } from '@/app/types';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function createToken(user: User): Promise<string> {
  const token = await new SignJWT({ 
    userId: user.id, 
    username: user.username
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
  
  return token;
}

export async function verifyToken(token: string): Promise<{ userId: number; username: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: number; username: string };
  } catch {
    return null;
  }
}

export async function getUser(): Promise<{ userId: number; username: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token.value);
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 // 24 hours
  });
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}