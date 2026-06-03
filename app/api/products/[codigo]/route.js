import { NextResponse } from 'next/server';
import { getDbConnection, sql } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { codigo } = params;
    const pool = await getDbConnection();
    const result = await pool.request()
      .input('codigo', sql.VarChar, codigo)
      .query('SELECT Codigo, Familia, Rubro, Marca, Linea, Descripcion, Detalles, Url1, Url2 FROM Productos WHERE Codigo = @codigo AND Discontinuado = 0');
    
    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({ product: result.recordset[0] });
  } catch (error) {
    console.error('Error fetching product details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
