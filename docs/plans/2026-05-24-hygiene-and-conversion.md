# B2B Industrial Catalog Hygiene and Conversion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Clean up orphaned legacy code files, integrate and style a brand-aligned WhatsApp floating chat widget on the landing page, and implement client input validation (cédula/RIF and phone number) in the checkout form to improve lead quality.

**Architecture:** 
1. Safely remove unused Zustand, hook, and mockup files that are no longer referenced in the active React state catalog flow.
2. Define a premium, brand-aligned CSS class for the floating WhatsApp button in `base.css` and conditionally render the widget in `App.tsx` only when the autocotizador standalone route is inactive.
3. Add validation helper functions in `AutocotizadorHelpers.ts` to perform progressive validation of cédula and phone fields, incorporating real-time input sanitization and UI feedback inside `CartDrawer.tsx`.

**Tech Stack:** React (v19), TypeScript, Vite, CSS Custom Properties (Vanilla CSS).

---

### Task 1: Clean Up Unused (Orphaned) Code Files

**Files:**
- Delete: `src/store.ts`
- Delete: `src/components/ProductCard.tsx`
- Delete: `src/components/CartSidebar.tsx`
- Delete: `src/hooks/useProducts.ts`
- Delete: `src/data/mockProducts.ts`

**Step 1: Run compilation check pre-deletion**

Run: `npm run lint`
Expected: Command exits successfully with no TypeScript compiler errors.

**Step 2: Remove the orphaned files**

Run command in shell to delete the files:
- `Remove-Item src/store.ts`
- `Remove-Item src/components/ProductCard.tsx`
- `Remove-Item src/components/CartSidebar.tsx`
- `Remove-Item src/hooks/useProducts.ts`
- `Remove-Item src/data/mockProducts.ts`

**Step 3: Verify the build compiles after deletion**

Run: `npm run build`
Expected: Vite build succeeds, generating the static site under `dist/` with no broken import errors.

**Step 4: Commit**

```bash
git add src/store.ts src/components/ProductCard.tsx src/components/CartSidebar.tsx src/hooks/useProducts.ts src/data/mockProducts.ts
git commit -m "refactor: remove orphaned store, card, sidebar, hook, and mock data files"
```

---

### Task 2: Define Brand-Aligned CSS Style for WhatsApp Float Button

**Files:**
- Modify: `src/styles/base.css`
- Modify: `src/components/WhatsAppFloat.tsx`

**Step 1: Write the visual styles in base.css**

Append to `src/styles/base.css` (lines 102+):
```css
/* ─────────────────────────────────────────────────────────────
   WhatsApp Float Button - Industrial Luxe Theme
   ───────────────────────────────────────────────────────────── */
.whatsapp-float-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: linear-gradient(135deg, #128c7e, #25d366);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(37, 211, 102, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 99;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, background 0.3s ease;
}

.whatsapp-float-btn:hover {
  transform: translateY(-4px) scale(1.08);
  box-shadow: 0 12px 28px rgba(37, 211, 102, 0.4);
  background: linear-gradient(135deg, #0f7569, #20ba5a);
}

.whatsapp-float-btn:active {
  transform: translateY(-2px) scale(1.02);
}

.whatsapp-float-btn:focus-visible {
  outline: 2.5px solid var(--accent);
  outline-offset: 2px;
}

@media (max-width: 768px) {
  .whatsapp-float-btn {
    bottom: 20px;
    right: 20px;
    width: 48px;
    height: 48px;
  }
}
```

**Step 2: Update WhatsAppFloat component styling**

Replace content in `src/components/WhatsAppFloat.tsx` to use the new `.whatsapp-float-btn` class:
```tsx
import { MessageCircle } from 'lucide-react';

export function WhatsAppFloat() {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '584244594724';
  
  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('¡Hola Construacero! Me gustaría saber más acerca de cómo funciona su sistema de despachos y presupuestos.')}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float-btn"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle size={26} />
    </a>
  );
}
```

**Step 3: Run TS compilation and build checks**

Run: `npm run lint` and `npm run build`
Expected: Successful validation with no errors.

**Step 4: Commit**

```bash
git add src/styles/base.css src/components/WhatsAppFloat.tsx
git commit -m "style: apply premium brand styles to WhatsApp floating button"
```

---

### Task 3: Add Phone and Cédula/RIF Validation Helpers

**Files:**
- Modify: `src/components/AutocotizadorHelpers.ts`

**Step 1: Write helper validator functions**

Append to `src/components/AutocotizadorHelpers.ts` (lines 161+):
```typescript
/**
 * Validates Venezuelan Cedula or RIF format.
 * Format examples: V-12345678, E-12345678, J-12345678-9, G-12345678-9, or pure digits 6-9 chars.
 */
export function isCedulaValid(val: string): boolean {
  const clean = val.trim().toUpperCase();
  if (!clean) return true; // Don't show error if empty (field is required anyway)
  return /^(V|E|J|G|P|C)?[- ]?\d{5,9}([- ]?\d)?$/.test(clean);
}

/**
 * Validates contact phone number length (10 to 13 digits when stripped of non-digits).
 */
export function isPhoneValid(val: string): boolean {
  const clean = val.replace(/[^0-9]/g, '');
  if (!clean) return true; // Don't show error if empty
  return clean.length >= 10 && clean.length <= 13;
}
```

**Step 2: Run TS compiler validation**

Run: `npm run lint`
Expected: Successful compile with no errors.

**Step 3: Commit**

```bash
git add src/components/AutocotizadorHelpers.ts
git commit -m "feat: add isCedulaValid and isPhoneValid validation helpers"
```

---

### Task 4: Integrate clientPhone State and Validation Check in Autocotizador

**Files:**
- Modify: `src/components/Autocotizador.tsx`

**Step 1: Implement state, local storage persistence, and WhatsApp template updates**

1. Import `isCedulaValid` and `isPhoneValid` from `./AutocotizadorHelpers`.
2. Declare `clientPhone` and `setClientPhone` hooks initialized from localStorage.
3. Sync `clientPhone` in the `useEffect` hook.
4. Update `handleSendQuote` to check `clientPhone` and include it in the WhatsApp text template.
5. Add `clientPhone` and `setClientPhone` to `sharedCartProps`.

Modify `src/components/Autocotizador.tsx`:
```typescript
// Replace import line (approx line 4-8) with:
import { 
  DbProduct, 
  fallbackProducts, 
  getCategoryLabel,
  isCedulaValid,
  isPhoneValid
} from './AutocotizadorHelpers';

// Replace Form State persisted in localStorage (approx line 106-108) with:
  const [clientName, setClientName] = useState(() => localStorage.getItem('construacero_client_name') || '');
  const [clientCedula, setClientCedula] = useState(() => localStorage.getItem('construacero_client_cedula') || '');
  const [clientPhone, setClientPhone] = useState(() => localStorage.getItem('construacero_client_phone') || '');
  const [clientAddress, setClientAddress] = useState(() => localStorage.getItem('construacero_client_address') || '');

// Replace Form Fields save useEffect (approx line 147-151) with:
  useEffect(() => {
    localStorage.setItem('construacero_client_name', clientName);
    localStorage.setItem('construacero_client_cedula', clientCedula);
    localStorage.setItem('construacero_client_phone', clientPhone);
    localStorage.setItem('construacero_client_address', clientAddress);
  }, [clientName, clientCedula, clientPhone, clientAddress]);

// Update handleSendQuote submit checks (approx line 390-393) with:
  const handleSendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      totalSelectedCount === 0 || 
      clientName.trim() === '' || 
      clientCedula.trim() === '' || 
      clientPhone.trim() === '' || 
      clientAddress.trim() === '' ||
      !isCedulaValid(clientCedula) ||
      !isPhoneValid(clientPhone)
    ) return;

// Update handleSendQuote text output format (approx line 404-407) with:
    let text = `*SOLICITUD DE COTIZACIÓN - CONSTRUACERO CARABOBO*\n\n`;
    text += `👤 *Cliente:* ${clientName.trim()}\n`;
    text += `🪪 *Cédula:* ${clientCedula.trim()}\n`;
    text += `📞 *Teléfono:* ${clientPhone.trim()}\n`;
    text += `📍 *Dirección:* ${clientAddress.trim()}\n\n`;

// Update sharedCartProps object (approx line 439-445) with:
    clientName,
    setClientName,
    clientCedula,
    setClientCedula,
    clientPhone,
    setClientPhone,
    clientAddress,
    setClientAddress,
```

**Step 2: Verify compiling fails temporarily due to CartDrawer types**

Run: `npm run lint`
Expected: Fails with type mismatch error on `CartDrawer` because its props interface does not yet contain `clientPhone`.

**Step 3: Commit state changes**

```bash
git add src/components/Autocotizador.tsx
git commit -m "feat: integrate clientPhone state and quote submission handler in Autocotizador"
```

---

### Task 5: Add Phone Input Field and Validation Feedback in CartDrawer

**Files:**
- Modify: `src/components/CartDrawer.tsx`

**Step 1: Update CartDrawer component structure and UI form**

1. Import `isCedulaValid` and `isPhoneValid` from `./AutocotizadorHelpers`.
2. Add `clientPhone` and `setClientPhone` to `CartDrawerProps` interface and destructured arguments.
3. Update the inputs section.
4. Implement input sanitization handler for Cédula and Phone.
5. Add UI error labels for validation errors.
6. Make checkout submit button disabled if validation fails or fields are empty.

Modify `src/components/CartDrawer.tsx`:
```typescript
// Replace import line at top with:
import React from 'react';
import { DbProduct, isCedulaValid, isPhoneValid } from './AutocotizadorHelpers';

// Add clientPhone and setClientPhone in CartDrawerProps interface:
  clientCedula: string;
  setClientCedula: (cedula: string) => void;
  clientPhone: string;
  setClientPhone: (phone: string) => void;
  clientAddress: string;
  setClientAddress: (address: string) => void;

// Add clientPhone and setClientPhone in CartDrawer destructuring:
  clientCedula,
  setClientCedula,
  clientPhone,
  setClientPhone,
  clientAddress,

// Modify Cedula field input and validation inside return block:
            <div className="form-group" style={{ marginBottom: '10px' }}>
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

            <div className="form-group" style={{ marginBottom: '10px' }}>
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

// Update submit button disabled status:
            <button
              type="submit"
              className="checkout-submit-btn"
              disabled={
                totalSelectedCount === 0 ||
                clientName.trim() === '' ||
                clientCedula.trim() === '' ||
                clientPhone.trim() === '' ||
                clientAddress.trim() === '' ||
                !isCedulaValid(clientCedula) ||
                !isPhoneValid(clientPhone)
              }
            >
```

**Step 2: Run TS compiler validation**

Run: `npm run lint`
Expected: Exits successfully with zero errors.

**Step 3: Run production build check**

Run: `npm run build`
Expected: Exits successfully with zero errors.

**Step 4: Commit**

```bash
git add src/components/CartDrawer.tsx
git commit -m "feat: add phone number field and validation messages to CartDrawer form"
```

---

### Task 6: Import and Conditionally Render WhatsAppFloat on Landing Page in App

**Files:**
- Modify: `src/App.tsx`

**Step 1: Import and render WhatsAppFloat conditionally**

1. Import `WhatsAppFloat` from `./components/WhatsAppFloat`.
2. Render `<WhatsAppFloat />` inside the normal landing page return block (only visible when `isCotizadorRoute` is false).

Modify `src/App.tsx`:
```typescript
// Add WhatsAppFloat import:
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';
import { WhatsAppFloat } from './components/WhatsAppFloat';

// Render at the end of the normal landing page return block (just before closing </div>, approx line 97):
      {/* Corporate Siderurgic Footer */}
      <Footer standalone={false} />

      {/* Floating WhatsApp button (Landing page only) */}
      <WhatsAppFloat />
    </div>
  );
```

**Step 2: Validate compiler**

Run: `npm run lint`
Expected: Successful compile.

**Step 3: Validate production build**

Run: `npm run build`
Expected: Successful build compilation.

**Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: render WhatsAppFloat widget conditionally on the landing page only"
```
