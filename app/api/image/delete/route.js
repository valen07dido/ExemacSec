import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function POST(request) {
  try {
    const { codigos } = await request.json();

    if (!Array.isArray(codigos) || codigos.length === 0) {
      return NextResponse.json({ error: 'Códigos inválidos' }, { status: 400 });
    }

    const targetDir = path.join(process.cwd(), 'public', 'Imagenes.Genesis.Seg');
    
    let deletedCount = 0;

    for (const codigo of codigos) {
      const p = path.join(targetDir, `${codigo}.jpg`);
      if (fs.existsSync(p)) {
        await unlink(p);
        deletedCount++;
      }
    }

    return NextResponse.json({ success: true, deleted: deletedCount });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Error al eliminar la imagen' }, { status: 500 });
  }
}
