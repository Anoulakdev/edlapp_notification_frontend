import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    // Delete the token cookie
    cookieStore.delete('token');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Logout error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
