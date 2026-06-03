import React from 'react';
import Navbar from '@/components/Navbar';
import DetailActions from '@/components/DetailActions';
import { getDbConnection, sql } from '@/lib/db';
import { Tag, Shield, Compass, Landmark } from 'lucide-react';
import styles from './page.module.css';

// Server Component data fetching
async function getProductDetails(codigo) {
  try {
    const pool = await getDbConnection();
    const result = await pool.request()
      .input('codigo', sql.VarChar, codigo)
      .query('SELECT Codigo, Familia, Rubro, Marca, Linea, Descripcion, Detalles, Url1, Url2 FROM Productos WHERE Codigo = @codigo AND Discontinuado = 0');
    
    return result.recordset[0] || null;
  } catch (error) {
    console.error(`Error fetching product details for ${codigo}:`, error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const codigo = decodeURIComponent(resolvedParams.codigo);
  const product = await getProductDetails(codigo);
  
  if (!product) {
    return {
      title: "Producto no encontrado | Genesis Seguridad",
    };
  }

  return {
    title: `${product.Descripcion} | Catálogo Genesis`,
    description: `Detalles técnicos del producto ${product.Descripcion} (${product.Marca}). Solicite cotización rápida de este artículo por WhatsApp.`,
  };
}

export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params;
  const codigo = decodeURIComponent(resolvedParams.codigo);
  const product = await getProductDetails(codigo);

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <h2>Producto No Encontrado</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            El producto con código <strong>{codigo}</strong> no existe o ha sido discontinuado.
          </p>
        </div>
      </>
    );
  }

  // Determine image source
  let imgSrc = '';
  if (product.Url1 && product.Url1.startsWith('http')) {
    imgSrc = product.Url1;
  } else {
    imgSrc = `https://exemac.com.ar/Imagenes.Genesis.Seg/${product.Codigo}.jpg`;
  }

  const getInitials = (text) => {
    if (!text) return 'G';
    return text.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  };

  return (
    <>
      <Navbar />

      <main className="container animate-fade-in" style={{ padding: '60px 20px' }}>
        <div className={styles.layout}>
          {/* Visual Column */}
          <div className={styles.imageColumn}>
            <div className={`glass-panel ${styles.imageCard}`}>
              {imgSrc ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img 
                  src={imgSrc} 
                  alt={product.Descripcion} 
                  className={styles.image}
                  // Allow browser-native fallback to SVG placeholder on error
                  style={{ display: 'block' }}
                />
              ) : (
                <div className={styles.placeholder}>
                  <div className={styles.placeholderGlow}></div>
                  <span className={styles.placeholderText}>{getInitials(product.Descripcion)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Info Column */}
          <div className={styles.infoColumn}>
            <div className={styles.header}>
              <div className={styles.categoryRow}>
                <span className={styles.categoryBadge}>{product.Familia}</span>
                <span className={styles.categoryBadge}>{product.Rubro}</span>
              </div>
              <h1 className={styles.title}>{product.Descripcion}</h1>
              <span className={styles.code}>Código de Artículo: <strong>{product.Codigo}</strong></span>
            </div>

            {/* Technical Specifications list */}
            <div className={`glass-panel ${styles.specsCard}`}>
              <div className={styles.specItem}>
                <Tag size={18} className={styles.specIcon} />
                <div className={styles.specText}>
                  <span>Marca:</span>
                  <strong>{product.Marca || 'No Especificada'}</strong>
                </div>
              </div>
              <div className={styles.specItem}>
                <Compass size={18} className={styles.specIcon} />
                <div className={styles.specText}>
                  <span>Línea:</span>
                  <strong>{product.Linea || 'General'}</strong>
                </div>
              </div>
              <div className={styles.specItem}>
                <Shield size={18} className={styles.specIcon} />
                <div className={styles.specText}>
                  <span>Estado:</span>
                  <strong style={{ color: 'var(--accent-success)' }}>Disponible para Cotización</strong>
                </div>
              </div>
            </div>

            {/* Product Details (Detalles) */}
            <div className={styles.detailsSection}>
              <h3>Descripción Detallada</h3>
              {product.Detalles ? (
                <p className={styles.detailsText}>{product.Detalles}</p>
              ) : (
                <p className={styles.noDetails}>No hay detalles técnicos adicionales disponibles para este artículo.</p>
              )}
            </div>

            {/* Interactive Client Buttons */}
            <DetailActions product={product} />
          </div>
        </div>
      </main>
    </>
  );
}
