import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByUsername, hashPassword } from '@/app/lib/db';
import { createToken, setAuthCookie } from '@/app/lib/auth';

interface UserData {
  id: number;
  username: string;
  password: string;
  is_admin: number;
  created_at: string;
  updated_at: string;
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = getUserByUsername.get(username);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    createUser.run({
      username,
      password: hashedPassword,
      is_admin: 0
    });

    // Get the created user
    const user = getUserByUsername.get(username) as UserData;
    if (!user) {
      throw new Error('Failed to create user');
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    // Create token and set cookie
    const token = await createToken(user);
    await setAuthCookie(token);

    return NextResponse.json({
      user: userWithoutPassword,
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}