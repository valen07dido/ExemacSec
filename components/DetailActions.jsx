'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import styles from './DetailActions.module.css';

export default function DetailActions({ product }) {
  const { cart, addToCart, removeFromCart } = useCart();
  const isAdded = cart.some((item) => item.Codigo === product.Codigo);

  const handleCartClick = () => {
    if (isAdded) {
      removeFromCart(product.Codigo);
    } else {
      addToCart(product);
    }
  };

  return (
    <div className={styles.container}>
      <Link href="/productos" className={styles.backBtn}>
        <ArrowLeft size={18} />
        <span>Volver al Catálogo</span>
      </Link>

      <button 
        className={`${styles.actionBtn} ${isAdded ? styles.addedBtn : ''}`}
        onClick={handleCartClick}
      >
        {isAdded ? (
          <>
            <Check size={20} />
            <span>En mi Consulta (Quitar)</span>
          </>
        ) : (
          <>
            <ShoppingCart size={20} />
            <span>Agregar a mi Consulta</span>
          </>
        )}
      </button>

      {isAdded && (
        <Link href="/consulta" className={styles.viewCartBtn}>
          Ver mi Consulta ahora
        </Link>
      )}
    </div>
  );
}
