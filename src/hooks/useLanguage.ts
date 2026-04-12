/**
 * useLanguage — Spanish (es-MX) / English (en) toggle.
 *
 * Uses Google Translate Basic API (free tier: 500k chars/month).
 * API key is read from VITE_GOOGLE_TRANSLATE_KEY env variable.
 *
 * When no API key is set, falls back to a built-in static dictionary
 * covering all common Kluje construction UI strings in Mexican Spanish.
 *
 * Usage:
 *   const { t, lang, toggleLang } = useLanguage();
 *   <p>{t('Quote Builder')}</p>
 */

import { useState, useCallback } from 'react';

export type Lang = 'en' | 'es';

// ─── Static dictionary (Mexican/Latin American Spanish) ───────────────────
// Full construction + platform vocabulary. Covers the most-used strings
// so the app works offline or without a Translate API key.
const DICT: Record<string, string> = {
  // Nav & dashboard
  'My Quotes': 'Mis Cotizaciones',
  'Quote Builder': 'Constructor de Cotización',
  'New Quote': 'Nueva Cotización',
  'Active Jobs': 'Trabajos Activos',
  'Materials Queue': 'Cola de Materiales',
  'AI Activity': "Actividad de IA",
  "Today's Snapshot": 'Resumen del Día',
  'GC-Dashboard': 'Panel GC',
  'Site Map': 'Mapa del Sitio',
  'Schedule': 'Calendario',
  'Inbound Calls': 'Llamadas Entrantes',
  'Email Inbox': 'Bandeja de Entrada',
  'Sub Messaging': 'Mensajería de Subs',
  'Agent Log': 'Registro del Agente',
  'Orders': 'Órdenes',
  'Suppliers': 'Proveedores',
  'Inventory': 'Inventario',
  'Design Checklist': 'Lista de Diseño',
  'Subcontractors': 'Subcontratistas',
  'Biometric Access': 'Acceso Biométrico',
  'Site Tracking': 'Rastreo en Sitio',
  'Timesheets': 'Hojas de Tiempo',
  'Accounting': 'Contabilidad',
  'Invoices': 'Facturas',
  'Job Costing': 'Costeo de Trabajo',
  'Lien Waivers': 'Renuncias de Gravamen',
  'Legals': 'Legal',
  'Attorneys': 'Abogados',
  'Arbitration': 'Arbitraje',
  'Architects': 'Arquitectos',
  'Engineers': 'Ingenieros',
  'Agreements': 'Contratos',
  'E-Signature': 'Firma Electrónica',
  'Fire Dept': 'Bomberos',
  'Health & Safety': 'Salud y Seguridad',
  'Insurance': 'Seguros',
  'Projects': 'Proyectos',
  'Quotes': 'Cotizaciones',
  'Realtors': 'Agentes Inmobiliarios',
  'Security': 'Seguridad',
  'Title Companies': 'Empresas de Título',
  'Town Planning': 'Planeación Urbana',
  'Verification Orders': 'Órdenes de Verificación',
  'Cleaning': 'Limpieza',
  // Quote form
  'Client Name': 'Nombre del Cliente',
  'Client Phone': 'Teléfono del Cliente',
  'Client Email': 'Correo del Cliente',
  'Property Address': 'Dirección del Inmueble',
  'Zip Code': 'Código Postal',
  'Project Type': 'Tipo de Proyecto',
  'Scope': 'Alcance',
  'Labor': 'Mano de Obra',
  'Materials': 'Materiales',
  'Equipment': 'Equipo',
  'Subcontractor Costs': 'Costos de Subcontratistas',
  'Overhead %': 'Gastos Generales %',
  'Profit Margin %': 'Margen de Ganancia %',
  'Total Quote Value': 'Valor Total de Cotización',
  'Save Draft': 'Guardar Borrador',
  'Generate Quote PDF': 'Generar PDF de Cotización',
  'Send to Client': 'Enviar al Cliente',
  'Quote #': 'Cotización #',
  'Payment Terms': 'Términos de Pago',
  'Quote Validity': 'Validez de Cotización',
  'Notes': 'Notas',
  'Pending': 'Pendiente',
  'Accepted': 'Aceptado',
  'Completed': 'Completado',
  'All': 'Todos',
  // Service types
  'General Contractor': 'Contratista General',
  'Subcontractor': 'Subcontratista',
  'Service Provider': 'Proveedor de Servicios',
  'Cleaning Contractor': 'Contratista de Limpieza',
  'Specialist': 'Especialista',
  // Weather
  'Weather': 'Clima',
  'Construction Risk': 'Riesgo de Construcción',
  'HIGH RISK': 'RIESGO ALTO',
  'MODERATE RISK': 'RIESGO MODERADO',
  'LOW RISK': 'RIESGO BAJO',
  // Cleaning
  'Cleaning Scope': 'Alcance de Limpieza',
  'Square Footage': 'Metros Cuadrados (sq ft)',
  'Cleaning Frequency': 'Frecuencia de Limpieza',
  'Daily': 'Diario',
  'Weekly': 'Semanal',
  'Bi-Weekly': 'Quincenal',
  'Monthly': 'Mensual',
  'One-Time': 'Una Vez',
  'Monthly Recurring': 'Mensual Recurrente',
  'Per-Visit Price': 'Precio por Visita',
  'Initial Deep Clean': 'Limpieza Profunda Inicial',
  // Actions
  'Back': 'Atrás',
  'Save': 'Guardar',
  'Submit': 'Enviar',
  'Cancel': 'Cancelar',
  'Edit': 'Editar',
  'Delete': 'Eliminar',
  'View': 'Ver',
  'Loading': 'Cargando',
  // Misc
  'AI monitoring active': 'Monitoreo de IA activo',
  'Complete your profile': 'Completa tu perfil',
  'Profile incomplete': 'Perfil incompleto',
};

const LANG_KEY = 'kluje_lang';

// ─── Google Translate (optional) ──────────────────────────────────────────
const TRANSLATE_CACHE: Record<string, string> = {};

async function googleTranslate(text: string, target: Lang): Promise<string> {
  const key = import.meta.env.VITE_GOOGLE_TRANSLATE_KEY;
  if (!key || target === 'en') return text;

  const cacheKey = `${target}:${text}`;
  if (TRANSLATE_CACHE[cacheKey]) return TRANSLATE_CACHE[cacheKey];

  try {
    const res = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text, target, format: 'text' }),
      }
    );
    const json = await res.json();
    const translated = json?.data?.translations?.[0]?.translatedText ?? text;
    TRANSLATE_CACHE[cacheKey] = translated;
    return translated;
  } catch {
    return text;
  }
}

// ─── Hook ──────────────────────────────────────────────────────────────────
interface UseLanguageReturn {
  lang: Lang;
  toggleLang: () => void;
  /** Synchronous translation — uses static dictionary */
  t: (key: string) => string;
  /** Async translation — uses Google API if available, else dictionary */
  tAsync: (text: string) => Promise<string>;
  isSpanish: boolean;
}

export function useLanguage(): UseLanguageReturn {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      return (localStorage.getItem(LANG_KEY) as Lang) ?? 'en';
    } catch {
      return 'en';
    }
  });

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next: Lang = prev === 'en' ? 'es' : 'en';
      try { localStorage.setItem(LANG_KEY, next); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const t = useCallback(
    (key: string): string => {
      if (lang === 'en') return key;
      return DICT[key] ?? key;
    },
    [lang]
  );

  const tAsync = useCallback(
    async (text: string): Promise<string> => {
      if (lang === 'en') return text;
      if (DICT[text]) return DICT[text];
      return googleTranslate(text, lang);
    },
    [lang]
  );

  return { lang, toggleLang, t, tAsync, isSpanish: lang === 'es' };
}
