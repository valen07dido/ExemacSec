import { NextResponse } from 'next/server';
import { getDbConnection, sql } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const family = searchParams.get('family') || '';
    const brand = searchParams.get('brand') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Safety check on pagination values
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const offset = (safePage - 1) * safeLimit;

    const pool = await getDbConnection();
    
    // Create separate request instances for separate queries to avoid parallel execution issues on the same request object
    const countRequest = pool.request();
    const selectRequest = pool.request();

    let queryConditions = ['Discontinuado = 0'];

    if (search) {
      countRequest.input('search', sql.VarChar, `%${search}%`);
      selectRequest.input('search', sql.VarChar, `%${search}%`);
      queryConditions.push('(Descripcion LIKE @search OR Marca LIKE @search OR Codigo LIKE @search OR Detalles LIKE @search)');
    }

    if (family) {
      countRequest.input('family', sql.VarChar, family);
      selectRequest.input('family', sql.VarChar, family);
      queryConditions.push('Familia = @family');
    }

    if (brand) {
      countRequest.input('brand', sql.VarChar, brand);
      selectRequest.input('brand', sql.VarChar, brand);
      queryConditions.push('Marca = @brand');
    }

    const whereClause = queryConditions.length > 0 ? `WHERE ${queryConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM Productos ${whereClause}`;
    const countResult = await countRequest.query(countQuery);
    const total = countResult.recordset[0].total;

    // Get paginated results
    selectRequest.input('offset', sql.Int, offset);
    selectRequest.input('limit', sql.Int, safeLimit);
    const selectQuery = `
      SELECT Codigo, Familia, Rubro, Marca, Descripcion, Detalles, Url1, Url2 
      FROM Productos 
      ${whereClause} 
      ORDER BY Descripcion ASC 
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;
    const result = await selectRequest.query(selectQuery);

    const grouped = [];
    const groupMap = new Map();

    const extractBaseAndSize = (descripcion) => {
      // Matches " T8", " Talle XL", " XL", " S", etc. at the end of the string
      const match = descripcion.match(/^(.*?)(?:\s+(T\d+|Talle\s+.*|XXL|XL|L|M|S))$/i);
      if (match) {
        return { baseName: match[1].trim(), size: match[2].trim() };
      }
      return { baseName: descripcion.trim(), size: null };
    };

    result.recordset.forEach(p => {
      const { baseName, size } = extractBaseAndSize(p.Descripcion);
      
      if (!groupMap.has(baseName)) {
        const newGroup = {
          baseName,
          Familia: p.Familia,
          Rubro: p.Rubro,
          Marca: p.Marca,
          Detalles: p.Detalles,
          Url1: p.Url1,
          Url2: p.Url2,
          variants: []
        };
        grouped.push(newGroup);
        groupMap.set(baseName, newGroup);
      }
      
      groupMap.get(baseName).variants.push({
        Codigo: p.Codigo,
        size: size || 'Único',
        Descripcion: p.Descripcion
      });
    });

    return NextResponse.json({
      products: grouped,
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
