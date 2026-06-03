'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { Search, SlidersHorizontal, Loader2, ArrowLeft, ArrowRight, X } from 'lucide-react';
import styles from './page.module.css';

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // States
  const [products, setProducts] = useState([]);
  const [families, setFamilies] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Search & Filter States
  const [searchVal, setSearchVal] = useState(searchParams.get('search') || '');
  const [selectedFamily, setSelectedFamily] = useState(searchParams.get('family') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync URL search parameters on load/change
  useEffect(() => {
    setSearchVal(searchParams.get('search') || '');
    setSelectedFamily(searchParams.get('family') || '');
    setSelectedBrand(searchParams.get('brand') || '');
    setCurrentPage(parseInt(searchParams.get('page') || '1'));
  }, [searchParams]);

  // Fetch filter options (families and brands) once
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [famRes, brandRes] = await Promise.all([
          fetch('/api/families'),
          fetch('/api/brands')
        ]);
        const famData = await famRes.json();
        const brandData = await brandRes.json();
        
        if (famData.families) setFamilies(famData.families);
        if (brandData.brands) setBrands(brandData.brands);
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };
    fetchFilters();
  }, []);

  // Fetch products when search, filters, or page changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchVal) params.append('search', searchVal);
        if (selectedFamily) params.append('family', selectedFamily);
        if (selectedBrand) params.append('brand', selectedBrand);
        params.append('page', currentPage.toString());
        params.append('limit', '12');

        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();

        if (data.products) {
          setProducts(data.products);
          setTotalProducts(data.pagination.total);
          setTotalPages(data.pagination.totalPages);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce product fetching slightly for search value to prevent spamming queries
    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [searchVal, selectedFamily, selectedBrand, currentPage]);

  // Update URL parameters
  const updateUrl = (newSearch, newFamily, newBrand, newPage) => {
    const params = new URLSearchParams();
    if (newSearch) params.append('search', newSearch);
    if (newFamily) params.append('family', newFamily);
    if (newBrand) params.append('brand', newBrand);
    if (newPage > 1) params.append('page', newPage.toString());

    router.push(`/productos?${params.toString()}`, { scroll: false });
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchVal(val);
    setCurrentPage(1);
    updateUrl(val, selectedFamily, selectedBrand, 1);
  };

  const handleFamilySelect = (family) => {
    const val = selectedFamily === family ? '' : family; // toggle filter
    setSelectedFamily(val);
    setCurrentPage(1);
    updateUrl(searchVal, val, selectedBrand, 1);
    setShowMobileFilters(false);
  };

  const handleBrandSelect = (brand) => {
    const val = selectedBrand === brand ? '' : brand; // toggle filter
    setSelectedBrand(val);
    setCurrentPage(1);
    updateUrl(searchVal, selectedFamily, val, 1);
    setShowMobileFilters(false);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      updateUrl(searchVal, selectedFamily, selectedBrand, page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const clearAllFilters = () => {
    setSearchVal('');
    setSelectedFamily('');
    setSelectedBrand('');
    setCurrentPage(1);
    updateUrl('', '', '', 1);
    setShowMobileFilters(false);
  };

  return (
    <>
      <Navbar />

      <main className="container animate-fade-in" style={{ padding: '40px 20px' }}>
        {/* Title */}
        <div className={styles.headerArea}>
          <div>
            <h1 className={styles.title}>Catálogo de Productos</h1>
            <p className={styles.subtitle}>
              Filtrá y seleccioná los artículos para tu presupuesto. Encontrados: <strong>{totalProducts}</strong>
            </p>
          </div>
          {/* Mobile Filter Toggle */}
          <button 
            className={styles.mobileFilterBtn}
            onClick={() => setShowMobileFilters(true)}
          >
            <SlidersHorizontal size={18} />
            <span>Filtros</span>
          </button>
        </div>

        {/* Catalog Main Layout */}
        <div className={styles.layout}>
          {/* Filters Sidebar (Desktop) */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarSticky}>
              <div className={styles.filterSectionHeader}>
                <h3>Filtros</h3>
                {(selectedFamily || selectedBrand || searchVal) && (
                  <button onClick={clearAllFilters} className={styles.clearBtn}>
                    Limpiar
                  </button>
                )}
              </div>

              {/* Families Filter */}
              <div className={styles.filterGroup}>
                <h4>Familia</h4>
                <div className={styles.filterList}>
                  {families.map((family) => (
                    <button
                      key={family}
                      onClick={() => handleFamilySelect(family)}
                      className={`${styles.filterItem} ${selectedFamily === family ? styles.filterItemActive : ''}`}
                    >
                      {family}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands Filter */}
              <div className={styles.filterGroup}>
                <h4>Marcas</h4>
                <div className={styles.filterList}>
                  {brands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => handleBrandSelect(brand)}
                      className={`${styles.filterItem} ${selectedBrand === brand ? styles.filterItemActive : ''}`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Catalog Content Area */}
          <div className={styles.content}>
            {/* Search Bar */}
            <div className={styles.searchBarWrapper}>
              <Search className={styles.searchIcon} size={20} />
              <input
                type="text"
                value={searchVal}
                onChange={handleSearchChange}
                placeholder="Buscar por descripción, marca o código de producto..."
                className={styles.searchInput}
              />
              {searchVal && (
                <button 
                  onClick={() => { setSearchVal(''); updateUrl('', selectedFamily, selectedBrand, 1); }}
                  className={styles.searchClearBtn}
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Selected Badges */}
            {(selectedFamily || selectedBrand) && (
              <div className={styles.badgeRow}>
                {selectedFamily && (
                  <span className={styles.filterBadge}>
                    Familia: {selectedFamily}
                    <button onClick={() => handleFamilySelect(selectedFamily)}><X size={12} /></button>
                  </span>
                )}
                {selectedBrand && (
                  <span className={styles.filterBadge}>
                    Marca: {selectedBrand}
                    <button onClick={() => handleBrandSelect(selectedBrand)}><X size={12} /></button>
                  </span>
                )}
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className={styles.loadingWrapper}>
                <Loader2 className={styles.spinner} size={48} />
                <p>Cargando productos...</p>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="product-grid">
                  {products.map((product) => (
                    <ProductCard key={product.Codigo} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={styles.pageBtn}
                    >
                      <ArrowLeft size={18} />
                      <span>Anterior</span>
                    </button>

                    <div className={styles.pagesList}>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                        // Display logic for pagination (show current, neighbors, and ends if large)
                        if (
                          p === 1 || 
                          p === totalPages || 
                          (p >= currentPage - 1 && p <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={p}
                              onClick={() => handlePageChange(p)}
                              className={`${styles.pageNum} ${currentPage === p ? styles.pageNumActive : ''}`}
                            >
                              {p}
                            </button>
                          );
                        } else if (p === 2 || p === totalPages - 1) {
                          return <span key={p} className={styles.pageEllipsis}>...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={styles.pageBtn}
                    >
                      <span>Siguiente</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.emptyWrapper}>
                <h3>No se encontraron productos</h3>
                <p>Intentá cambiando los filtros o la búsqueda.</p>
                <button onClick={clearAllFilters} className="btn-primary" style={{ marginTop: '16px' }}>
                  Limpiar Búsqueda y Filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <div className={styles.drawerOverlay} onClick={() => setShowMobileFilters(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h3>Filtros</h3>
              <button className={styles.drawerCloseBtn} onClick={() => setShowMobileFilters(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className={styles.drawerContent}>
              {/* Mobile Families */}
              <div className={styles.filterGroup}>
                <h4>Familia</h4>
                <div className={styles.filterList}>
                  {families.map((family) => (
                    <button
                      key={family}
                      onClick={() => handleFamilySelect(family)}
                      className={`${styles.filterItem} ${selectedFamily === family ? styles.filterItemActive : ''}`}
                    >
                      {family}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Brands */}
              <div className={styles.filterGroup}>
                <h4>Marcas</h4>
                <div className={styles.filterList}>
                  {brands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => handleBrandSelect(brand)}
                      className={`${styles.filterItem} ${selectedBrand === brand ? styles.filterItemActive : ''}`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.drawerFooter}>
              <button className="btn-primary" style={{ width: '100%' }} onClick={() => setShowMobileFilters(false)}>
                Aplicar Filtros ({totalProducts})
              </button>
              {(selectedFamily || selectedBrand || searchVal) && (
                <button className="btn-secondary" style={{ width: '100%', marginTop: '10px' }} onClick={clearAllFilters}>
                  Limpiar Todos
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Catalog() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0a0e17', color: '#fff' }}>
        <Loader2 className="spinner" size={48} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
