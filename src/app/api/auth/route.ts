import { NextResponse } from 'next/server';

const VALID_LOGINS = [
  'test'
];
const SHARED_PASSWORD = 'testpass';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    if (VALID_LOGINS.includes(email.toLowerCase().trim()) && password === SHARED_PASSWORD) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });
      return response;
    }
    
    return NextResponse.json({ error: 'Неверный логин или пароль' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('auth');
  return response;
}
