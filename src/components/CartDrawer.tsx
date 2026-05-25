import React from 'react';
import { DbProduct, isCedulaValid, isPhoneValid, fallbackProducts } from './AutocotizadorHelpers';

interface CartDrawerProps {
  selectedItems: { [key: string]: number };
  products: DbProduct[];
  factor: number;
  tasaBcv: any;
  isOnline: boolean;
  isDrawer?: boolean;
  onCloseDrawer?: () => void;
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
  clientName: string;
  setClientName: (name: string) => void;
  clientCedula: string;
  setClientCedula: (cedula: string) => void;
  clientPhone: string;
  setClientPhone: (phone: string) => void;
  clientAddress: string;
  setClientAddress: (address: string) => void;
  totalUsd: number;
  totalVes: number;
  onSendQuote: (e: React.FormEvent) => void;
  onCheckout: () => void;
  onAdjustQuantity: (productId: string, amount: number) => void;
}

export function CartDrawer({
  selectedItems,
  products,
  factor,
  tasaBcv,
  isOnline,
  isDrawer = false,
  onCloseDrawer,
  onRemoveFromCart,
  onClearCart,
  clientName,
  setClientName,
  clientCedula,
  setClientCedula,
  clientPhone,
  setClientPhone,
  clientAddress,
  setClientAddress,
  totalUsd,
  totalVes,
  onSendQuote,
  onCheckout,
  onAdjustQuantity,
}: CartDrawerProps) {
  const totalSelectedCount = Object.keys(selectedItems).length;

  return (
    <>
      <div className="cart-header">
        <span className="cart-header-title">
          <svg style={{ width: '16px', height: '16px', fill: 'currentColor' }} viewBox="0 0 24 24">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.9 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
          Tu Presupuesto ({totalSelectedCount})
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {totalSelectedCount > 0 && (
            <button type="button" className="cart-clear-btn" onClick={onClearCart}>
              Vaciar todo
            </button>
          )}
          {isDrawer && onCloseDrawer && (
            <button
              type="button"
              className="cart-drawer-close-btn"
              onClick={onCloseDrawer}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '1.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
                lineHeight: 1,
              }}
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Offline notification card inside cart */}
      {!isOnline && (
        <div className="offline-warning-card">
          <svg viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
          <span>Offline: Copiaremos tu ticket al portapapeles.</span>
        </div>
      )}

      {/* Cart list content */}
      {totalSelectedCount === 0 ? (
        <div className="cart-empty-wrapper">
          <svg className="cart-empty-icon" viewBox="0 0 24 24" style={{ fill: 'currentColor' }}>
            <path d="M17.21 9l-4.38-6.56c-.19-.28-.51-.42-.83-.42-.32 0-.64.14-.83.43L6.79 9H2c-1.1 0-2 .9-2 2v2c0 .96.69 1.76 1.62 1.97L3.84 21c.15.57.66.97 1.25.97h13.82c.59 0 1.1-.4 1.25-.97l2.22-6.03c.93-.21 1.62-1.01 1.62-1.97v-2c0-1.1-.9-2-2-2h-4.79zM9 6l3-4.5L15 6H9zm11 7H4v-2h16v2z" />
          </svg>
          <div className="cart-empty-text">
            Su carrito está vacío.<br />
            Añada insumos del catálogo para elaborar su cotización.
          </div>
          {isDrawer && onCloseDrawer && (
            <button
              type="button"
              className="product-add-btn"
              onClick={onCloseDrawer}
              style={{ marginTop: '10px', width: 'auto', padding: '10px 20px' }}
            >
              Volver al Catálogo
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="cart-items-list">
            {Object.entries(selectedItems).map(([id, qty]) => {
              const prod = products.find((p) => p.id === id) || 
                           fallbackProducts.find((p) => p.id === id) || {
                             id: id,
                             codigo: 'ESP-' + id.substring(0, 4).toUpperCase(),
                             nombre: 'Material Estructural Especial (' + id + ')',
                             categoria: 'MATERIALES',
                             descripcion: '',
                             unidad: 'und',
                             precio_usd: 15.0,
                             stock_actual: 999,
                             imagen_url: null,
                             activo: true
                           };

              const priceUsdBcv = prod.precio_usd * factor;
              const subtotalUsd = priceUsdBcv * qty;

              return (
                <div key={id} className="cart-item-row">
                  {prod.imagen_url ? (
                    <img
                      src={prod.imagen_url}
                      alt={prod.nombre}
                      className="cart-item-img"
                    />
                  ) : (
                    <div className="cart-item-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--accent-light)', color: 'var(--accent)', fontSize: '1.2rem', fontWeight: 'bold' }}>
                      ⚙️
                    </div>
                  )}

                  <div className="cart-item-details">
                    <h5 className="cart-item-title" title={prod.nombre}>
                      {prod.nombre}
                    </h5>
                    
                    {/* Compact Interactive Quantity Selector */}
                    <div className="cart-item-qty-container">
                      <button
                        type="button"
                        className="cart-qty-btn-minus"
                        onClick={() => onAdjustQuantity(prod.id, -1)}
                      >
                        -
                      </button>
                      <span className="cart-qty-value">
                        {qty}
                      </span>
                      <button
                        type="button"
                        className="cart-qty-btn-plus"
                        onClick={() => onAdjustQuantity(prod.id, 1)}
                      >
                        +
                      </button>
                      <span className="cart-qty-unit-label">
                        {prod.unidad} x <strong>${priceUsdBcv.toFixed(2)}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="cart-item-actions">
                    <strong style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>
                      ${subtotalUsd.toFixed(2)}
                    </strong>

                    <button
                      type="button"
                      className="cart-item-delete"
                      onClick={() => onRemoveFromCart(prod.id)}
                      title="Remover producto"
                    >
                      <svg style={{ width: '13px', height: '13px', fill: 'currentColor' }} viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Cart Footer with Totals and CTA Button */}
          <div className="cart-footer-sticky">
            <div className="checkout-totals-summary" style={{ marginTop: 0, marginBottom: '16px' }}>
              <div className="total-row">
                <span className="total-label">Total en USD (BCV):</span>
                <span className="total-value-usd" style={{ fontSize: '1.15rem' }}>${totalUsd.toFixed(2)}</span>
              </div>

              <div className="total-row" style={{ marginTop: '2px' }}>
                <span className="total-label" style={{ fontSize: '0.72rem' }}>Total en Bolívares (VES):</span>
                <span className="total-value-ves" style={{ fontSize: '0.88rem' }}>
                  Bs. {totalVes.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="checkout-rates-info">
                Tasa BCV oficial: <strong>{tasaBcv.precio.toFixed(2)} Bs/$</strong>
              </div>
            </div>

            <button
              type="button"
              className="checkout-submit-btn"
              onClick={onCheckout}
              disabled={totalSelectedCount === 0}
              style={{
                background: 'linear-gradient(135deg, #128c7e, #25d366)',
                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.25)',
                border: 'none',
                cursor: totalSelectedCount > 0 ? 'pointer' : 'not-allowed',
                opacity: totalSelectedCount > 0 ? 1 : 0.45,
              }}
            >
              <span>Contactar con un Asesor Comercial</span>
              <svg style={{ width: '16px', height: '16px', fill: 'currentColor' }} viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </>
      )}
    </>
  );
}
