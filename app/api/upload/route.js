import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');
    const codigosStr = data.get('codigos'); // JSON stringified array of codigos

    if (!file || !codigosStr) {
      return NextResponse.json({ error: 'Faltan datos de archivo o códigos' }, { status: 400 });
    }

    const codigos = JSON.parse(codigosStr);
    
    if (!Array.isArray(codigos) || codigos.length === 0) {
      return NextResponse.json({ error: 'Códigos inválidos' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const targetDir = path.join(process.cwd(), 'public', 'Imagenes.Genesis.Seg');
    
    // Ensure directory exists
    if (!fs.existsSync(targetDir)) {
      await mkdir(targetDir, { recursive: true });
    }
    
    // Write the file for each associated variant so they all have the image locally.
    for (const codigo of codigos) {
      const p = path.join(targetDir, `${codigo}.jpg`);
      await writeFile(p, buffer);
    }

    return NextResponse.json({ success: true, message: 'Imágenes subidas correctamente' });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Error al subir la imagen' }, { status: 500 });
  }
}
