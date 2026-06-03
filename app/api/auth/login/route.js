import { NextResponse } from 'next/server';
import { getDbConnection, sql } from '@/lib/db';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'genesis_secret_key_12345');

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Faltan credenciales' }, { status: 400 });
    }

    const pool = await getDbConnection();
    const result = await pool.request()
      .input('username', sql.VarChar, username)
      .input('password', sql.VarChar, password)
      .query(`SELECT Id, Nombre, Calificacion FROM Usuarios WHERE Nombre = @username AND Clave = @password`);

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const user = result.recordset[0];

    // Create JWT token
    const token = await new SignJWT({ sub: user.Id, nombre: user.Nombre, role: user.Calificacion })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('8h')
      .sign(JWT_SECRET);

    // Set cookie
    const response = NextResponse.json({ success: true, user: { nombre: user.Nombre, role: user.Calificacion } });
    response.cookies.set({
      name: 'genesis_admin_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8 // 8 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
