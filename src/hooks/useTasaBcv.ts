import { useState, useEffect } from 'react';

export interface TasaBcvData {
  precio: number;          // Tasa BCV oficial Bs/$
  tasaUsdt: number;        // Tasa USDT paralela Bs/$
  fuente: string;
  ultimaActualizacion: string | null;
  cargando: boolean;
  error: string | null;
}

const STORAGE_KEY = 'construacero_landing_tasa_bcv_v3';
const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 horas

// Tasas de respaldo realistas para mayo 2026 en caso de error de red
const DEFAULT_BCV_RATE  = 530.00;
const DEFAULT_USDT_RATE = 730.00;

function parseSafeFloat(val: any): number {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const clean = val.replace(/[^\d.,]/g, '');
    const lastDot   = clean.lastIndexOf('.');
    const lastComma = clean.lastIndexOf(',');
    const lastSep   = Math.max(lastDot, lastComma);
    if (lastSep === -1) return parseFloat(clean) || 0;
    const integer  = clean.slice(0, lastSep).replace(/[.,]/g, '');
    const decimals = clean.slice(lastSep + 1);
    return parseFloat(`${integer}.${decimals}`) || 0;
  }
  return 0;
}

async function fetchWithTimeout(url: string, timeout = 8000): Promise<any> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    clearTimeout(id);
    return null;
  }
}

// Fetch live Binance P2P USDT rate from CriptoYa (formula from original POS system)
async function fetchUsdtRateFromBinance(): Promise<{ price: number; fuente: string } | null> {
  try {
    const result = await fetchWithTimeout('https://criptoya.com/api/binancep2p/USDT/VES/1', 8000);
    if (result) {
      const avgAsk = typeof result.ask === 'number' 
        ? result.ask
        : (Array.isArray(result.ask) && result.ask.length > 0
          ? result.ask.slice(0, 3).reduce((s: number, i: any) => s + (i.price ?? i), 0) / Math.min(3, result.ask.length)
          : 0);
      const avgBid = typeof result.bid === 'number' 
        ? result.bid
        : (Array.isArray(result.bid) && result.bid.length > 0
          ? result.bid.slice(0, 3).reduce((s: number, i: any) => s + (i.price ?? i), 0) / Math.min(3, result.bid.length)
          : 0);

      if (avgAsk > 0 || avgBid > 0) {
        const basePrice = (avgAsk > 0 && avgBid > 0) ? (avgAsk + avgBid) / 2 : (avgAsk || avgBid);
        // Formula original: Math.ceil(precio) + 2
        return {
          price: Math.ceil(basePrice) + 2,
          fuente: 'Binance P2P'
        };
      }
    }
  } catch (err) {
    console.error('Error fetching USDT from CriptoYa P2P:', err);
  }
  return null;
}

interface RatesResult {
  bcv: number;
  usdt: number;
  fuente: string;
}

async function fetchAllRates(): Promise<RatesResult | null> {
  let bcvPrice = 0;
  let usdtPrice = 0;
  let bcvFuente = 'Desconocido';
  let usdtFuente = 'Desconocido';

  // 1. Fetch USDT Rate as top priority (Binance P2P via CriptoYa)
  const usdtData = await fetchUsdtRateFromBinance();
  if (usdtData && usdtData.price > 0) {
    usdtPrice = usdtData.price;
    usdtFuente = usdtData.fuente;
  }

  // 2. Fetch BCV Rate - Cascade Fuente 1: Google Script de Construacero
  try {
    const data = await fetchWithTimeout(
      'https://script.google.com/macros/s/AKfycbzUmj0Tug-pa3Y6jLEMT8tijNFvYb4_CLWhBZ0vDW7YsuP-QXjAcelOH5r-Mip3FJ-_7A/exec?token=Lvbp1994',
      8000
    );
    const price = parseSafeFloat(data?.bcv?.price);
    if (price > 0) {
      bcvPrice = price;
      bcvFuente = 'Script Construacero';
    }
  } catch {}

  // 3. Cascade Fuente 2: DolarApi (Official for BCV, Parallel as USDT backup)
  if (bcvPrice === 0 || usdtPrice === 0) {
    try {
      const data = await fetchWithTimeout('https://ve.dolarapi.com/v1/dolares', 6000);
      if (data && Array.isArray(data)) {
        const oficial = data.find((d: any) =>
          d.fuente === 'oficial' || d.nombre === 'Oficial' || d.casa === 'oficial'
        );
        const paralelo = data.find((d: any) =>
          d.fuente === 'paralelo' || d.nombre === 'Paralelo' || d.casa === 'paralelo'
        );

        if (bcvPrice === 0 && oficial) {
          bcvPrice = parseSafeFloat(oficial.promedio);
          bcvFuente = 'DolarApi BCV';
        }
        if (usdtPrice === 0 && paralelo) {
          usdtPrice = Math.ceil(parseSafeFloat(paralelo.promedio)) + 2;
          usdtFuente = 'DolarApi Paralelo';
        }
      }
    } catch {}
  }

  // 4. Cascade Fuente 3: PyDolarVE (Two parallel calls)
  if (bcvPrice === 0 || usdtPrice === 0) {
    try {
      const [dataBcv, dataUsdt] = await Promise.all([
        fetchWithTimeout('https://pydolarve.org/api/v1/dollar?monitor=bcv', 6000),
        fetchWithTimeout('https://pydolarve.org/api/v1/dollar?monitor=usdt', 6000),
      ]);
      if (bcvPrice === 0 && dataBcv) {
        bcvPrice = parseSafeFloat(dataBcv.price);
        bcvFuente = 'PyDolarVE BCV';
      }
      if (usdtPrice === 0 && dataUsdt) {
        usdtPrice = Math.ceil(parseSafeFloat(dataUsdt.price)) + 2;
        usdtFuente = 'PyDolarVE Parallel';
      }
    } catch {}
  }

  // 5. Cascade Fuente 4: ExchangeDynamics
  if (bcvPrice === 0) {
    try {
      const data = await fetchWithTimeout('https://api.exchangedynamics.com/rates/VES', 6000);
      const price = parseSafeFloat(data?.USD);
      if (price > 0) {
        bcvPrice = price;
        bcvFuente = 'ExchangeDynamics';
      }
    } catch {}
  }

  // Sanity checks and fallback values
  if (bcvPrice > 0) {
    if (usdtPrice === 0) {
      // Standard parallel spread factor (+4%) if Binance is unreachable
      usdtPrice = Math.ceil(bcvPrice * 1.04) + 2;
      usdtFuente = bcvFuente + ' (+4%)';
    }
    return {
      bcv: bcvPrice,
      usdt: usdtPrice,
      fuente: `${bcvFuente} / ${usdtFuente}`
    };
  }

  return null;
}

export function useTasaBcv() {
  const [tasa, setTasa] = useState<TasaBcvData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const age = Date.now() - new Date(parsed.timestamp).getTime();
        if (parsed.precio > 0 && age < CACHE_DURATION) {
          return {
            precio:               parsed.precio,
            tasaUsdt:             parsed.tasaUsdt ?? (parsed.precio * 1.04 + 2),
            fuente:               parsed.fuente,
            ultimaActualizacion:  parsed.timestamp,
            cargando:             false,
            error:                null,
          };
        }
      }
    } catch {}

    return {
      precio:              DEFAULT_BCV_RATE,
      tasaUsdt:            DEFAULT_USDT_RATE,
      fuente:              'Tasa predeterminada',
      ultimaActualizacion: null,
      cargando:            true,
      error:               null,
    };
  });

  useEffect(() => {
    let active = true;

    async function loadTasa() {
      if (tasa.ultimaActualizacion && !tasa.cargando) return;

      try {
        const result = await fetchAllRates();
        if (!active) return;

        if (result && result.bcv > 0) {
          const timestamp = new Date().toISOString();
          const newData: TasaBcvData = {
            precio:              result.bcv,
            tasaUsdt:            result.usdt,
            fuente:              result.fuente,
            ultimaActualizacion: timestamp,
            cargando:            false,
            error:               null,
          };
          setTasa(newData);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
              precio:    result.bcv,
              tasaUsdt:  result.usdt,
              fuente:    result.fuente,
              timestamp,
            }));
          } catch {}
        } else {
          setTasa(prev => ({
            ...prev,
            cargando: false,
            error: 'No se pudo obtener la tasa en vivo. Usando respaldo.',
          }));
        }
      } catch {
        if (active) {
          setTasa(prev => ({
            ...prev,
            cargando: false,
            error: 'Error al obtener la tasa cambiaria.',
          }));
        }
      }
    }

    loadTasa();
    return () => { active = false; };
  }, []);

  return tasa;
}
