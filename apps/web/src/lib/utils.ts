import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type NumberSeparator = 'space' | 'dot';

/**
 * Formate les nombres de 4 chiffres ou plus avec un séparateur de milliers net et visible.
 * Résout le problème CLDR Unicode U+202F (Narrow No-Break Space) de Intl.NumberFormat('fr-FR')
 * qui possède une largeur de 0px dans certaines polices web modernes comme Plus Jakarta Sans.
 * 
 * - 'space' : Espace insécable standard '\u00A0' (Norme légale OHADA / ISO 80000-1 / AFNOR) -> "12 918 700"
 * - 'dot'   : Point comptable (Norme européenne / latino-américaine) -> "12.918.700"
 */
export function formatNumber(
  val: number | string | any,
  separator: NumberSeparator = 'space'
): string {
  if (val === null || val === undefined || val === '') return '0';
  const num = typeof val === 'number' ? val : Number(val);
  if (isNaN(num)) return '0';

  const isNegative = num < 0;
  const absNum = Math.abs(Math.round(num));
  const sep = separator === 'dot' ? '.' : '\u00A0';

  // Sépare par tranches de 3 chiffres pour les nombres de 4 chiffres ou plus
  const formatted = absNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  return (isNegative ? '-' : '') + formatted;
}

/**
 * Formate un montant financier en FCFA avec séparateur de milliers garanti dès 4 chiffres.
 * Exemples :
 * - 999 -> "999 FCFA"
 * - 1000 -> "1 000 FCFA" (ou "1.000 FCFA" avec 'dot')
 * - 12918700 -> "12 918 700 FCFA" (ou "12.918.700 FCFA" avec 'dot')
 */
export function formatFCFA(
  val: number | string | any,
  separator: NumberSeparator = 'space'
): string {
  return `${formatNumber(val, separator)} FCFA`;
}
