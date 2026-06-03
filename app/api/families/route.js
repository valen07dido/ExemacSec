import { NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getDbConnection();
    const result = await pool.request().query(
      'SELECT Descripcion FROM FamiliasWeb WHERE Mostrar = 1 ORDER BY Descripcion'
    );
    const families = result.recordset.map(row => row.Descripcion);
    return NextResponse.json({ families });
  } catch (error) {
    console.error('Error fetching families:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
