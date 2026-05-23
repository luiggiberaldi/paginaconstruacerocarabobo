import { DbProduct, getCategoryLabel, getProductSpecs } from './AutocotizadorHelpers';

interface SpecsModalProps {
  product: DbProduct | null;
  isAlreadyInCart: boolean;
  onClose: () => void;
  onAddToCart: () => void;
}

export function SpecsModal({
  product,
  isAlreadyInCart,
  onClose,
  onAddToCart,
}: SpecsModalProps) {
  if (!product) return null;
  const specs = getProductSpecs(product);

  return (
    <div className={`specs-modal-overlay active`} onClick={onClose}>
      <div className="specs-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="specs-modal-close" onClick={onClose}>&times;</button>

        <h3 className="specs-modal-title">Ficha Técnica Oficial</h3>
        <div className="specs-modal-code">{product.codigo}</div>

        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
          {product.nombre}
        </h4>

        <p className="specs-modal-desc" style={{ fontSize: '0.8rem', marginBottom: '16px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {product.descripcion || 'Material siderúrgico de primera calidad certificado bajo estándares internacionales para obras civiles e infraestructura pesada.'}
        </p>

        <table className="specs-table" style={{ marginBottom: '20px', width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr className="specs-table-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td className="specs-table-label" style={{ fontSize: '0.75rem', padding: '8px 0', color: 'var(--text-muted)' }}>Categoría</td>
              <td className="specs-table-value" style={{ fontSize: '0.8rem', padding: '8px 0', fontWeight: 600, color: 'white', textAlign: 'right' }}>{getCategoryLabel(product.categoria)}</td>
            </tr>
            <tr className="specs-table-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td className="specs-table-label" style={{ fontSize: '0.75rem', padding: '8px 0', color: 'var(--text-muted)' }}>Unidad de Medida</td>
              <td className="specs-table-value" style={{ fontSize: '0.8rem', padding: '8px 0', fontWeight: 600, color: 'white', textAlign: 'right' }}>{product.unidad}</td>
            </tr>
            {Object.entries(specs).map(([label, val]) => (
              <tr key={label} className="specs-table-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td className="specs-table-label" style={{ fontSize: '0.75rem', padding: '8px 0', color: 'var(--text-muted)' }}>{label}</td>
                <td className="specs-table-value" style={{ fontSize: '0.8rem', padding: '8px 0', fontWeight: 600, color: 'white', textAlign: 'right' }}>{val}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-primary"
            style={{ flex: 1, padding: '12px', fontSize: '0.85rem', justifyContent: 'center', borderRadius: '10px' }}
            onClick={() => {
              if (!isAlreadyInCart) {
                onAddToCart();
              }
              onClose();
            }}
          >
            {isAlreadyInCart ? 'Ya en Carrito' : 'Agregar a Cotización'}
          </button>

          <button
            type="button"
            className="btn"
            style={{ padding: '12px 18px', fontSize: '0.85rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px' }}
            onClick={onClose}
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
}
