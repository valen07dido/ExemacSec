'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Check, Tag } from 'lucide-react';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const router = useRouter();
  const { cart, addToCart, removeFromCart } = useCart();
  const [imgError, setImgError] = useState(false);
  
  // Use the first variant as default if variants exist, otherwise fallback to the product itself
  const hasVariants = product.variants && product.variants.length > 0;
  const initialVariant = hasVariants ? product.variants[0] : { Codigo: product.Codigo, Descripcion: product.Descripcion, size: 'Único' };
  
  const [selectedVariant, setSelectedVariant] = useState(initialVariant);

  const isAdded = cart.some((item) => item.Codigo === selectedVariant.Codigo);

  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdded) {
      removeFromCart(selectedVariant.Codigo);
    } else {
      addToCart({
        ...product, // base data (Familia, Marca, Rubro)
        Codigo: selectedVariant.Codigo,
        Descripcion: selectedVariant.Descripcion,
        size: selectedVariant.size
      });
    }
  };

  const handleVariantChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const vCode = e.target.value;
    const v = product.variants.find(v => v.Codigo === vCode);
    if (v) setSelectedVariant(v);
  };

  // Determine image source - we try local generic image first, then fallback to exemac if needed
  // Note: if Admin uploads to public/Imagenes.Genesis.Seg/, it will be available locally.
  let imgSrc = '';
  if (product.Url1 && product.Url1.startsWith('http')) {
    imgSrc = product.Url1;
  } else {
    imgSrc = `/Imagenes.Genesis.Seg/${selectedVariant.Codigo}.jpg`;
  }

  // Initials for SVG placeholder
  const getInitials = (text) => {
    if (!text) return 'G';
    return text.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  };

  const displayName = product.baseName || product.Descripcion;

  return (
    <div className={`glass-panel glass-panel-hover ${styles.card}`}>
      {/* We can still link to a detail page if needed, but we prevent bubbling from dropdown/button */}
      <div 
        className={styles.linkContainer} 
        onClick={() => router.push(`/producto/${selectedVariant.Codigo}`)}
        role="button"
        tabIndex={0}
      >
        {/* Image / Placeholder */}
        <div className={styles.imageContainer}>
          {!imgError && imgSrc ? (
            <img 
              src={imgSrc} 
              alt={displayName} 
              className={styles.image}
              onError={(e) => {
                // If local image fails, fallback to remote exemac URL
                if (imgSrc.startsWith('/')) {
                   e.target.src = `https://exemac.com.ar/Imagenes.Genesis.Seg/${selectedVariant.Codigo}.jpg`;
                   e.target.onerror = () => setImgError(true);
                } else {
                   setImgError(true);
                }
              }}
              loading="lazy"
            />
          ) : (
            <div className={styles.placeholder}>
              <div className={styles.placeholderGlow}></div>
              <span className={styles.placeholderText}>{getInitials(displayName)}</span>
              <span className={styles.placeholderSub}>{product.Familia}</span>
            </div>
          )}
          {product.Marca && (
            <span className={styles.brandBadge}>{product.Marca}</span>
          )}
        </div>

        {/* Info */}
        <div className={styles.info}>
          <span className={styles.category}>{product.Familia} • {product.Rubro}</span>
          <h3 className={styles.title} title={displayName}>{displayName}</h3>
          
          {hasVariants && product.variants.length > 1 ? (
            <div className={styles.variantSelector}>
              <label htmlFor={`size-${product.baseName}`}>Talle/Medida:</label>
              <select 
                id={`size-${product.baseName}`}
                value={selectedVariant.Codigo} 
                onChange={handleVariantChange}
                className={styles.select}
                onClick={e => e.stopPropagation()}
              >
                {product.variants.map(v => (
                  <option key={v.Codigo} value={v.Codigo}>{v.size}</option>
                ))}
              </select>
            </div>
          ) : (
            <span className={styles.code}>Cod: {selectedVariant.Codigo}</span>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className={styles.actionContainer}>
        <button 
          className={`${styles.actionBtn} ${isAdded ? styles.addedBtn : ''}`}
          onClick={handleCartClick}
        >
          {isAdded ? (
            <>
              <Check size={16} />
              <span>Consultando</span>
            </>
          ) : (
            <>
              <ShoppingCart size={16} />
              <span>Consultar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
