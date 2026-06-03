'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Menu, X, Shield } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { cart } = useCart();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.navbar}`}>
        <Link href="/" className={styles.logo}>
          <Shield className={styles.logoIcon} size={28} />
          <span>EXE<span>MAC</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.desktopNav}>
          <Link href="/" className={pathname === '/' ? styles.activeLink : styles.link}>
            Inicio
          </Link>
          <Link href="/productos" className={pathname === '/productos' ? styles.activeLink : styles.link}>
            Catálogo
          </Link>
          <Link href="/consulta" className={`${styles.cartBtn} ${pathname === '/consulta' ? styles.activeCart : ''}`}>
            <ShoppingCart size={20} />
            <span>Mis Consultas</span>
            {cart.length > 0 && <span className={styles.badge}>{cart.length}</span>}
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button className={styles.mobileToggle} onClick={toggleMenu} aria-label="Menu">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className={styles.mobileDrawer}>
          <nav className={styles.mobileNav}>
            <Link href="/" className={pathname === '/' ? styles.mobileActiveLink : styles.mobileLink} onClick={toggleMenu}>
              Inicio
            </Link>
            <Link href="/productos" className={pathname === '/productos' ? styles.mobileActiveLink : styles.mobileLink} onClick={toggleMenu}>
              Catálogo
            </Link>
            <Link href="/consulta" className={styles.mobileCartBtn} onClick={toggleMenu}>
              <ShoppingCart size={22} />
              <span>Mis Consultas</span>
              {cart.length > 0 && <span className={styles.mobileBadge}>{cart.length}</span>}
            </Link>
          </nav>
        </div>
      )}

      {/* Hidden Admin Link */}
      <Link 
        href="/admin/login" 
        style={{ position: 'fixed', bottom: 0, right: 0, width: '40px', height: '40px', opacity: 0, zIndex: 9999 }}
        aria-label="Admin Login"
        title="Admin"
      />
    </header>
  );
}
