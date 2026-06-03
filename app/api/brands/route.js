import { NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getDbConnection();
    const result = await pool.request().query(
      "SELECT DISTINCT Marca FROM Productos WHERE Discontinuado = 0 AND Marca <> '' AND Marca IS NOT NULL ORDER BY Marca"
    );
    const brands = result.recordset.map(row => row.Marca);
    return NextResponse.json({ brands });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
