import { NextResponse } from 'next/server';
import { removeAuthCookie } from '@/app/lib/auth';

export async function POST() {
  await removeAuthCookie();
  
  return NextResponse.json({
    message: 'Logout successful'
  });
}