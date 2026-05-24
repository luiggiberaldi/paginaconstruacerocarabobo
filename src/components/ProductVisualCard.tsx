import { DbProduct, getCategoryLabel, getProductSpecs } from './AutocotizadorHelpers';

interface ProductVisualCardProps {
  product: DbProduct;
  isSelected: boolean;
  currentQty: number;
  priceUsdBcv: number;
  priceVes: number;
  onToggle: (product: DbProduct) => void;
  onRemove: (productId: string) => void;
  onAdjustQuantity: (productId: string, amount: number, maxStock: number) => void;
  onInputChange: (productId: string, value: string, maxStock: number) => void;
  onShowSpecs: (product: DbProduct) => void;
}

export function ProductVisualCard({
  product,
  isSelected,
  currentQty,
  priceUsdBcv,
  priceVes,
  onToggle,
  onRemove,
  onAdjustQuantity,
  onInputChange,
  onShowSpecs,
}: ProductVisualCardProps) {
  // Read specs for dynamic technical badges on the card
  const specs = getProductSpecs(product);
  const specsArray = Object.entries(specs).slice(0, 2); // Show first 2 attributes

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('.card-action-container')) {
      return;
    }
    onShowSpecs(product);
  };

  return (
    <article 
      className={`product-visual-card ${isSelected ? 'selected' : ''}`}
      onClick={handleCardClick}
    >
      {/* Image Thumbnail Header */}
      <div className="product-img-wrapper">
        <img
          src={product.imagen_url || '/assets/product_placeholder.png'}
          alt={product.nombre}
          className="product-img"
          loading="lazy"
        />
        <div className="product-badge-category">
          {getCategoryLabel(product.categoria)}
        </div>

        <div className="product-badge-stock">
          <span className="product-stock-dot"></span>
          Stock: {product.stock_actual} {product.unidad}
        </div>

        {/* Specs Overlay Button */}
        <button
          type="button"
          className="product-badge-info-btn"
          onClick={(e) => {
            e.stopPropagation();
            onShowSpecs(product);
          }}
          title="Ver Ficha Técnica"
        >
          <svg style={{ width: '14px', height: '14px', fill: 'currentColor' }} viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
        </button>
      </div>

      {/* Card Information */}
      <div className="product-visual-body">
        <span className="product-visual-code">{product.codigo}</span>
        <h4 className="product-visual-title" title={product.nombre}>
          {product.nombre}
        </h4>

        {/* Dynamic Mini Tech Badges */}
        <div className="product-mini-specs">
          {specsArray.map(([label, val]) => (
            <span key={label} className="mini-spec-badge" title={`${label}: ${val}`}>
              {val}
            </span>
          ))}
        </div>

        {/* Pricing Box */}
        <div className="product-visual-price-row">
          <div className="price-box">
            <span className="price-label">Precio Unitario</span>
            <span className="price-usd">
              ${priceUsdBcv.toFixed(2)} <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>USD</span>
            </span>
            <span className="price-ves">
              ≈ Bs. <strong>{priceVes.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </span>
          </div>
        </div>

        {/* Action Cart Controls */}
        <div className="card-action-container">
          {!isSelected ? (
            <button
              type="button"
              className="product-add-btn"
              onClick={() => onToggle(product)}
            >
              <svg style={{ width: '14px', height: '14px', fill: 'currentColor' }} viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              Agregar
            </button>
          ) : (
            <div className="product-qty-selector">
              <button
                type="button"
                className="product-qty-btn"
                onClick={() => {
                  if (currentQty === 1) {
                    onRemove(product.id);
                  } else {
                    onAdjustQuantity(product.id, -1, product.stock_actual);
                  }
                }}
                title={currentQty === 1 ? 'Eliminar del presupuesto' : 'Disminuir cantidad'}
                style={currentQty === 1 ? { color: '#ef4444' } : undefined}
              >
                {currentQty === 1 ? (
                  <svg style={{ width: '13px', height: '13px', fill: 'currentColor' }} viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                  </svg>
                ) : (
                  '-'
                )}
              </button>
              <input
                type="number"
                className="product-qty-value"
                value={currentQty}
                onChange={(e) => onInputChange(product.id, e.target.value, product.stock_actual)}
              />
              <button
                type="button"
                className="product-qty-btn"
                onClick={() => onAdjustQuantity(product.id, 1, product.stock_actual)}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
