import { NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getDbConnection();
    const result = await pool.request().query(
      'SELECT Familia, Orden, Titulo, Texto, Url FROM SlideShow ORDER BY Orden'
    );
    return NextResponse.json({ slides: result.recordset });
  } catch (error) {
    console.error('Error fetching slideshow:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
