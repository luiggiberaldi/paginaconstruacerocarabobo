import React from 'react';
import { isCedulaValid, isPhoneValid } from './AutocotizadorHelpers';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  setClientName: (name: string) => void;
  clientCedula: string;
  setClientCedula: (cedula: string) => void;
  clientPhone: string;
  setClientPhone: (phone: string) => void;
  clientAddress: string;
  setClientAddress: (address: string) => void;
  clientState: string;
  setClientState: (state: string) => void;
  clientCity: string;
  setClientCity: (city: string) => void;
  totalUsd: number;
  totalVes: number;
  tasaBcv: any;
  onSubmit: (e: React.FormEvent) => void;
  totalSelectedCount: number;
}

export function CheckoutModal({
  isOpen,
  onClose,
  clientName,
  setClientName,
  clientCedula,
  setClientCedula,
  clientPhone,
  setClientPhone,
  clientAddress,
  setClientAddress,
  clientState,
  setClientState,
  clientCity,
  setClientCity,
  totalUsd,
  totalVes,
  tasaBcv,
  onSubmit,
  totalSelectedCount,
}: CheckoutModalProps) {
  if (!isOpen) return null;

  const isFormValid =
    totalSelectedCount > 0 &&
    clientName.trim() !== '' &&
    clientCedula.trim() !== '' &&
    clientPhone.trim() !== '' &&
    clientState.trim() !== '' &&
    clientCity.trim() !== '' &&
    clientAddress.trim() !== '' &&
    isCedulaValid(clientCedula) &&
    isPhoneValid(clientPhone);

  return (
    <div className="specs-modal-overlay active" onClick={onClose} style={{ zIndex: 10200 }}>
      <div className="specs-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <button className="specs-modal-close" onClick={onClose} aria-label="Cerrar modal">&times;</button>

        {/* Modal Header */}
        <div className="checkout-modal-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
          <div className="specs-icon-wrapper" style={{ width: '44px', height: '44px', borderRadius: '10px' }}>
            <svg style={{ width: '22px', height: '22px', stroke: 'currentColor', fill: 'none', strokeWidth: 2 }} viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <span className="specs-category-badge" style={{ marginBottom: '2px' }}>Paso Final</span>
            <h3 className="specs-product-title" style={{ margin: 0, fontSize: '1.2rem' }}>Información de Despacho</h3>
          </div>
        </div>

        {/* Modal Content Scroll Area */}
        <form onSubmit={(e) => {
          onSubmit(e);
          onClose();
        }} className="specs-scrollable-content" style={{ marginBottom: 0 }}>
          
          <p className="specs-modal-desc" style={{ marginBottom: '16px', fontSize: '0.8rem' }}>
            Complete los siguientes datos para que un asesor comercial procese su cotización y coordine el despacho de su material de forma directa.
          </p>

          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label">Nombre y Apellido</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: Pedro Pérez"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label">Cédula de Identidad / RIF</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: V-12345678 o J-12345678-9"
              value={clientCedula}
              onChange={(e) => {
                const val = e.target.value.toUpperCase().replace(/[^0-9A-Z-\s]/g, '');
                setClientCedula(val);
              }}
              required
            />
            {!isCedulaValid(clientCedula) && clientCedula.trim() !== '' && (
              <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                Formato de Cédula/RIF inválido (Ej: V-12345678 o J-12345678-9)
              </span>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label">Teléfono de Contacto</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: 0412-1234567"
              value={clientPhone}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9+\s-()]/g, '');
                setClientPhone(val);
              }}
              required
            />
            {!isPhoneValid(clientPhone) && clientPhone.trim() !== '' && (
              <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                Teléfono inválido (mínimo 10 dígitos, Ej: 0412-1234567)
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Estado</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: Carabobo"
                value={clientState}
                onChange={(e) => setClientState(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Ciudad</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: Valencia"
                value={clientCity}
                onChange={(e) => setClientCity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Dirección de Entrega</label>
            <textarea
              className="form-input"
              rows={2}
              placeholder="Ej: Av. Bolívar, Calle 4, Local 12-B..."
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              required
            />
          </div>

          {/* Totals Summary */}
          <div className="checkout-totals-summary" style={{ padding: '14px', borderRadius: '14px', marginBottom: '20px' }}>
            <div className="total-row">
              <span className="total-label">Total en USD (BCV):</span>
              <span className="total-value-usd" style={{ fontSize: '1.2rem' }}>${totalUsd.toFixed(2)}</span>
            </div>

            <div className="total-row" style={{ marginTop: '2px' }}>
              <span className="total-label" style={{ fontSize: '0.75rem' }}>Total en Bolívares:</span>
              <span className="total-value-ves" style={{ fontSize: '0.9rem' }}>
                Bs. {totalVes.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="checkout-rates-info" style={{ marginTop: '6px', fontSize: '0.65rem', lineHeight: '1.3', textAlign: 'center' }}>
              Tasa BCV de Referencia: <strong>{tasaBcv.precio.toFixed(2)} Bs/$</strong><br />
              <span style={{ color: 'var(--accent)', fontWeight: '600' }}>Los precios son referenciales y aproximados, sujetos a cambio sin previo aviso.</span>
            </div>
          </div>

          {/* Action Footer inside Modal */}
          <div className="specs-actions-footer" style={{ marginTop: 0 }}>
            <button
              type="submit"
              className="btn btn-primary specs-btn-main"
              disabled={!isFormValid}
              style={{
                background: 'linear-gradient(135deg, #128c7e, #25d366)',
                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.25)',
                border: 'none',
                opacity: isFormValid ? 1 : 0.45,
                cursor: isFormValid ? 'pointer' : 'not-allowed'
              }}
            >
              <span>Enviar a WhatsApp</span>
              <svg style={{ width: '16px', height: '16px', fill: 'currentColor' }} viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
            <button
              type="button"
              className="btn specs-btn-close"
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
