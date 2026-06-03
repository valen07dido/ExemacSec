'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { Trash2, Send, MessageSquare, ShieldAlert, ArrowRight, ShoppingCart } from 'lucide-react';
import styles from './page.module.css';

// Default recipient WhatsApp number (Argentina format)
const WHATSAPP_RECIPIENT_NUMBER = '5493413978080';

export default function ConsultaPage() {
  const { cart, removeFromCart, clearCart, isLoaded } = useCart();
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [sent, setSent] = useState(false);

  // Load client details from localStorage if they filled them out before
  useEffect(() => {
    if (isLoaded) {
      setClientName(localStorage.getItem('gns_client_name') || '');
      setCompanyName(localStorage.getItem('gns_company_name') || '');
      setClientPhone(localStorage.getItem('gns_client_phone') || '');
    }
  }, [isLoaded]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (cart.length === 0) return;

    // Save details to localstorage for next time convenience
    localStorage.setItem('gns_client_name', clientName);
    localStorage.setItem('gns_company_name', companyName);
    localStorage.setItem('gns_client_phone', clientPhone);

    // Format the WhatsApp message text
    let messageText = `Hola, mi nombre es *${clientName}*`;
    if (companyName) {
      messageText += ` de la empresa *${companyName}*`;
    }
    if (clientPhone) {
      messageText += ` (Tel: ${clientPhone})`;
    }
    messageText += `.\n\nQuisiera solicitar presupuesto/información por los siguientes productos de su catálogo:\n\n`;

    cart.forEach((item, index) => {
      messageText += `${index + 1}. *${item.Descripcion}* - Cód: _${item.Codigo}_ (Marca: ${item.Marca || 'Genérica'})\n`;
    });

    if (notes.trim()) {
      messageText += `\n*Comentarios adicionales:* ${notes}\n`;
    }

    messageText += `\nEnviado desde el Catálogo Web de EXEMAC`;

    // Encode text for URL
    const encodedText = encodeURIComponent(messageText);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_RECIPIENT_NUMBER}&text=${encodedText}`;

    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');

    setSent(true);
    clearCart();
  };

  const handleClearAll = () => {
    if (window.confirm('¿Está seguro de que desea vaciar su lista de consulta?')) {
      clearCart();
    }
  };

  if (!isLoaded) {
    return (
      <>
        <Navbar />
        <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <p>Cargando lista de consultas...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="container animate-fade-in" style={{ padding: '60px 20px' }}>
        <h1 className={styles.title}>Lista de Consultas</h1>
        <p className={styles.subtitle}>
          Revise los productos seleccionados y complete sus datos para recibir su cotización directa por WhatsApp.
        </p>

        {sent && (
          <div className={`glass-panel ${styles.successBox}`}>
            <MessageSquare className={styles.successIcon} size={32} />
            <div>
              <h3>¡Consulta enviada a WhatsApp!</h3>
              <p>Se ha abierto la ventana del chat. Si no se abrió automáticamente, asegúrese de permitir las ventanas emergentes en su navegador.</p>
              <button 
                onClick={() => setSent(false)} 
                className="btn-primary" 
                style={{ marginTop: '14px', fontSize: '13px', padding: '8px 16px' }}
              >
                Ocultar este mensaje
              </button>
            </div>
          </div>
        )}

        {cart.length > 0 ? (
          <div className={styles.layout}>
            {/* Products List Column */}
            <div className={styles.listColumn}>
              <div className={styles.listHeader}>
                <h2>Productos en consulta ({cart.length})</h2>
                <button onClick={handleClearAll} className={styles.clearAllBtn}>
                  Vaciar Lista
                </button>
              </div>

              <div className={styles.productsList}>
                {cart.map((item) => {
                  let imgSrc = '';
                  if (item.Url1 && item.Url1.startsWith('http')) {
                    imgSrc = item.Url1;
                  } else {
                    imgSrc = `https://exemac.com.ar/Imagenes.Genesis.Seg/${item.Codigo}.jpg`;
                  }
                  
                  return (
                    <div key={item.Codigo} className={`glass-panel ${styles.productRow}`}>
                      <div className={styles.imgWrapper}>
                        {imgSrc ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={imgSrc} alt={item.Descripcion} onError={(e) => {e.target.style.display='none'}} />
                        ) : (
                          <div className={styles.imgPlaceholder}>{item.Familia[0]}</div>
                        )}
                      </div>
                      
                      <div className={styles.rowDetails}>
                        <span className={styles.rowCategory}>{item.Familia}</span>
                        <h3 className={styles.rowTitle}>
                          <Link href={`/producto/${item.Codigo}`}>{item.Descripcion}</Link>
                        </h3>
                        <span className={styles.rowCode}>Cód: {item.Codigo} | Marca: {item.Marca || 'Genérica'}</span>
                      </div>
                      
                      <button 
                        onClick={() => removeFromCart(item.Codigo)}
                        className={styles.removeBtn}
                        title="Quitar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contact Form Column */}
            <div className={styles.formColumn}>
              <div className={`glass-panel ${styles.formCard}`}>
                <h2>Completar Datos</h2>
                <p>Ingrese su nombre y datos de contacto para iniciar la conversación en WhatsApp.</p>
                
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formField}>
                    <label htmlFor="clientName">Nombre Completo *</label>
                    <input 
                      type="text" 
                      id="clientName" 
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ej: Juan Pérez"
                      required
                    />
                  </div>

                  <div className={styles.formField}>
                    <label htmlFor="companyName">Empresa / Organización (Opcional)</label>
                    <input 
                      type="text" 
                      id="companyName" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Ej: Constructora S.A."
                    />
                  </div>

                  <div className={styles.formField}>
                    <label htmlFor="clientPhone">Teléfono de Contacto *</label>
                    <input 
                      type="tel" 
                      id="clientPhone" 
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="Ej: 11 3456 7890"
                      required
                    />
                  </div>

                  <div className={styles.formField}>
                    <label htmlFor="notes">Notas / Mensaje Adicional (Opcional)</label>
                    <textarea 
                      id="notes" 
                      rows="4"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Indique detalles especiales, talles, cantidades aproximadas o urgencia de la cotización..."
                    ></textarea>
                  </div>

                  <button type="submit" className={`btn-primary ${styles.submitBtn}`}>
                    <Send size={18} />
                    <span>Enviar a WhatsApp</span>
                  </button>
                </form>

                <div className={styles.formNotice}>
                  <ShieldAlert size={16} />
                  <span>Sus datos no son compartidos externamente y se conservan solo en su navegador local.</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={`glass-panel ${styles.emptyCart}`}>
            <ShoppingCart size={48} className={styles.emptyIcon} />
            <h2>Su lista de consulta está vacía</h2>
            <p>Aún no ha seleccionado productos. Recorra el catálogo completo de seguridad industrial para agregarlos.</p>
            <Link href="/productos" className="btn-primary" style={{ marginTop: '20px' }}>
              Ver Catálogo de Productos <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
