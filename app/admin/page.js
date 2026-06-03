'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, ImagePlus, Search, CheckCircle, Loader2, Trash2 } from 'lucide-react';
import styles from './page.module.css';

function UploadRow({ product }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [timestamp, setTimestamp] = useState(Date.now());
  const [hasLocalImage, setHasLocalImage] = useState(true);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSuccess(false);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      // We send all codigos for this base product so they all get the image
      formData.append('codigos', JSON.stringify(product.variants.map(v => v.Codigo)));

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setFile(null);
        setTimestamp(Date.now());
        setHasLocalImage(true);
        // Reset file input
        const fileInput = document.getElementById(`file-${product.baseName}`);
        if (fileInput) fileInput.value = '';
      } else {
        setError(data.error || 'Error al subir');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Seguro que desea eliminar esta imagen para todos los talles?')) return;
    
    setUploading(true);
    setError('');
    
    try {
      const res = await fetch('/api/image/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigos: product.variants.map(v => v.Codigo) })
      });
      
      if (res.ok) {
        setHasLocalImage(false);
      } else {
        const data = await res.json();
        setError(data.error || 'Error al eliminar');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`glass-panel ${styles.row}`}>
      <div className={styles.imagePreview}>
        {hasLocalImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img 
            src={`/Imagenes.Genesis.Seg/${product.variants[0].Codigo}.jpg?t=${timestamp}`} 
            alt="Preview" 
            onError={() => setHasLocalImage(false)}
            onLoad={() => setHasLocalImage(true)}
            className={styles.previewImg}
          />
        ) : (
          <div className={styles.noImage}>Sin foto</div>
        )}
      </div>

      <div className={styles.rowInfo}>
        <span className={styles.category}>{product.Familia}</span>
        <h3 className={styles.title}>{product.baseName || product.Descripcion}</h3>
        <span className={styles.variants}>
          Variantes: {product.variants.map(v => v.size).join(', ')} ({product.variants.length})
        </span>
      </div>

      <div className={styles.uploadArea}>
        <label htmlFor={`file-${product.baseName}`} className={styles.fileLabel}>
          <ImagePlus size={18} />
          {file ? file.name : 'Seleccionar Imagen'}
          <input 
            type="file" 
            id={`file-${product.baseName}`} 
            className={styles.fileInput}
            accept="image/jpeg, image/png, image/webp"
            onChange={handleFileChange}
          />
        </label>

        <button 
          onClick={handleUpload} 
          disabled={!file || uploading} 
          className={`btn-primary ${styles.uploadBtn}`}
        >
          {uploading ? <Loader2 className="spinner" size={16} /> : 'Subir'}
        </button>

        {hasLocalImage && (
          <button 
            onClick={handleDelete}
            disabled={uploading}
            className={styles.deleteBtn}
            title="Eliminar imagen"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {success && <div className={styles.successBadge}><CheckCircle size={14} /> OK</div>}
      {error && <div className={styles.errorText}>{error}</div>}
    </div>
  );
}

export default function AdminPanel() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [searchVal, setSearchVal] = useState('');
  const [loading, setLoading] = useState(true);

  // Use a simple fetch to get products. 
  // We don't implement full pagination here for simplicity, but we search via API
  const fetchProducts = async (search) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(search)}&limit=50`);
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts(searchVal);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchVal]);

  const handleLogout = async () => {
    // Delete the cookie manually by setting expiration
    document.cookie = 'genesis_admin_token=; Max-Age=0; path=/;';
    router.push('/admin/login');
  };

  return (
    <div className={styles.adminLayout}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <h2>Admin <span>Panel</span></h2>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <LogOut size={18} /> Salir
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.topBar}>
          <h1>Gestor de Imágenes</h1>
          <p>Busca un producto y súbele una foto. Se aplicará a todos sus talles/variantes.</p>
        </div>

        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} size={20} />
          <input 
            type="text" 
            placeholder="Buscar producto por nombre o código..." 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {loading ? (
          <div className={styles.loader}>
            <Loader2 className="spinner" size={32} />
            <p>Cargando productos...</p>
          </div>
        ) : (
          <div className={styles.productsList}>
            {products.map((product) => (
              <UploadRow key={product.variants[0].Codigo} product={product} />
            ))}
            
            {products.length === 0 && (
              <div className={styles.empty}>
                <p>No se encontraron productos.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
