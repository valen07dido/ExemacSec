import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { getDbConnection } from '@/lib/db';
import { Search, ShieldAlert, ArrowRight, ShieldCheck, HelpCircle, PhoneCall } from 'lucide-react';
import styles from './page.module.css';

// Server Component fetching data directly
async function getHomeData() {
  try {
    const pool = await getDbConnection();
    
    // 1. Get active web families
    const familiesResult = await pool.request().query(
      'SELECT Descripcion FROM FamiliasWeb WHERE Mostrar = 1 ORDER BY Descripcion'
    );
    const families = familiesResult.recordset.map(row => row.Descripcion);
    
    // 2. Get featured products from WebHome
    const featuredResult = await pool.request().query(
      `SELECT p.Codigo, p.Familia, p.Rubro, p.Marca, p.Descripcion, p.Detalles, p.Url1, p.Url2 
       FROM WebHome w 
       INNER JOIN Productos p ON w.Codigo = p.Codigo 
       WHERE p.Discontinuado = 0 
       ORDER BY w.Orden ASC`
    );
    const featuredProducts = featuredResult.recordset;

    // 3. Get SlideShow slides
    const slideshowResult = await pool.request().query(
      'SELECT Familia, Orden, Titulo, Texto, Url FROM SlideShow ORDER BY Orden ASC'
    );
    const slides = slideshowResult.recordset;

    return { families, featuredProducts, slides };
  } catch (error) {
    console.error('Error fetching home data directly from DB:', error);
    return { families: [], featuredProducts: [], slides: [] };
  }
}

export default async function Home() {
  const { families, featuredProducts, slides } = await getHomeData();

  // Curated fallback slides if titles/texts are empty in database
  const getSlideContent = (slide, index) => {
    const fallbacks = [
      {
        title: "Protección a tu Medida",
        text: "Elementos de protección personal certificados para todo tipo de industrias.",
        gradient: "linear-gradient(135deg, #1e3a8a, #0d9488)"
      },
      {
        title: "Calzado de Seguridad Premium",
        text: "Durabilidad, tracción y confort para jornadas de trabajo exigentes.",
        gradient: "linear-gradient(135deg, #581c87, #4f46e5)"
      },
      {
        title: "Indumentaria Técnica Profesional",
        text: "Ropa de trabajo diseñada para resistir el desgaste y proteger al operario.",
        gradient: "linear-gradient(135deg, #7c2d12, #ea580c)"
      }
    ];

    const fallback = fallbacks[index % fallbacks.length];
    return {
      title: slide.Titulo || fallback.title,
      text: slide.Texto || fallback.text,
      gradient: fallback.gradient,
      familia: slide.Familia || "EPP"
    };
  };

  return (
    <>
      <Navbar />
      
      {/* Hero / Presentation */}
      <section className={styles.heroSection}>
        <div className={styles.heroGlow}></div>
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroText}>
            <span className={styles.tagline}>SEGURIDAD INDUSTRIAL INDUSTRIAL</span>
            <h1 className={styles.heroTitle}>
              Catálogo de Equipamiento Profesional
            </h1>
            <p className={styles.heroSubtitle}>
              Explore y seleccione los productos de protección personal (EPP), calzado y ropa técnica que necesita, y consulte presupuesto al instante por WhatsApp.
            </p>

            {/* Quick Search Form */}
            <form action="/productos" method="GET" className={styles.searchForm}>
              <div className={styles.searchInputWrapper}>
                <Search className={styles.searchIcon} size={20} />
                <input 
                  type="text" 
                  name="search" 
                  placeholder="Buscar guantes, calzado, arneses..." 
                  className={styles.searchInput}
                  required
                />
              </div>
              <button type="submit" className="btn-primary">
                Buscar
              </button>
            </form>
          </div>

          {/* Quick Stats Grid */}
          <div className={styles.heroStats}>
            <div className="glass-panel glass-panel-hover styles.statCard">
              <ShieldCheck className={styles.statIcon} size={36} />
              <h3>Productos Certificados</h3>
              <p>Protección reglamentaria bajo normas nacionales e internacionales.</p>
            </div>
            <div className="glass-panel glass-panel-hover styles.statCard">
              <PhoneCall className={styles.statIcon} size={36} />
              <h3>Consulta por WhatsApp</h3>
              <p>Seleccione productos y obtenga su cotización directa sin demoras.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories (FamiliasWeb) */}
      {families.length > 0 && (
        <section className={styles.categoriesSection}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Categorías Principales</h2>
            <p className={styles.sectionSubtitle}>
              Navegue por nuestro catálogo segmentado por familias de protección.
            </p>
            
            <div className={styles.categoriesGrid}>
              {families.map((family) => (
                <Link 
                  key={family} 
                  href={`/productos?family=${encodeURIComponent(family)}`}
                  className={`glass-panel glass-panel-hover ${styles.categoryCard}`}
                >
                  <div className={styles.categoryInfo}>
                    <h3>{family}</h3>
                    <span className={styles.exploreLink}>
                      Ver productos <ArrowRight size={16} />
                    </span>
                  </div>
                  <div className={styles.categoryBadge}>{family[0]}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Interactive Slideshow / Banner */}
      {slides.length > 0 && (
        <section className={styles.sliderSection}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Nuestras Líneas Destacadas</h2>
            <div className={styles.sliderContainer}>
              {slides.slice(0, 3).map((slide, idx) => {
                const content = getSlideContent(slide, idx);
                return (
                  <div 
                    key={idx} 
                    className={`glass-panel ${styles.slide}`}
                    style={{ background: content.gradient }}
                  >
                    <div className={styles.slideContent}>
                      <span className={styles.slideLabel}>{content.familia}</span>
                      <h2>{content.title}</h2>
                      <p>{content.text}</p>
                      <Link 
                        href={`/productos?family=${encodeURIComponent(content.familia)}`} 
                        className="btn-secondary"
                        style={{ alignSelf: 'flex-start', marginTop: '16px' }}
                      >
                        Ver esta Línea
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products (WebHome) */}
      {featuredProducts.length > 0 && (
        <section className={styles.featuredSection}>
          <div className="container">
            <div className={styles.featuredHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Productos Destacados</h2>
                <p className={styles.sectionSubtitle}>
                  Selección de equipos recomendados para alta seguridad laboral.
                </p>
              </div>
              <Link href="/productos" className={styles.viewAllBtn}>
                Ver Todo el Catálogo <ArrowRight size={16} />
              </Link>
            </div>
            
            <div className="product-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product.Codigo} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it Works / Instructions */}
      <section className={styles.howItWorksSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>¿Cómo funciona el pedido de cotización?</h2>
          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <span className={styles.stepNumber}>01</span>
              <h3>Explorá el Catálogo</h3>
              <p>Navegá entre nuestras categorías y encontrá los productos específicos de protección.</p>
            </div>
            <div className={styles.stepCard}>
              <span className={styles.stepNumber}>02</span>
              <h3>Armá tu Selección</h3>
              <p>Hacé clic en "Consultar" en los productos que necesites para agregarlos a tu lista de consulta.</p>
            </div>
            <div className={styles.stepCard}>
              <span className={styles.stepNumber}>03</span>
              <h3>Envia tu consulta</h3>
              <p>Completá tu nombre, ingresá a la página de consulta y envianos la lista instantáneamente por WhatsApp.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={`container ${styles.footerContainer}`}>
          <div className={styles.footerBrand}>
            <h2>EXE<span>MAC</span></h2>
            <p>Soluciones integrales de protección laboral y seguridad industrial.</p>
          </div>
          <div className={styles.footerContact}>
            <h3>Contacto Directo</h3>
            <p>Email: info@exemac.com.ar</p>
            <p>Web: exemac.com.ar</p>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <div className="container">
            <p>&copy; {new Date().getFullYear()} EXEMAC Seguridad. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
