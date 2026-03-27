/**
 * Cálculo da área polo método de Herón
 */
export function calculateHeronArea(a: number, b: number, c: number): number {
  if (a <= 0 || b <= 0 || c <= 0) return 0;
  if (a + b <= c || a + c <= b || b + c <= a) return -1; // Tringulo imposible

  const s = (a + b + c) / 2;
  return Math.sqrt(s * (s - a) * (s - b) * (s - c));
}

/**
 * Calcula a altura vertical dun punto dado os tres lados dun tringulo, 
 * considerando o lado 'base' como horizontal.
 */
export function calculateHeight(base: number, side: number, diagonal: number): number {
  const area = calculateHeronArea(base, side, diagonal);
  if (area <= 0) return 0;
  return (2 * area) / base;
}

export interface Measurements {
  fSup: number;
  fInf: number;
  sIzq: number;
  sDer: number;
  diag1: number;
  diag2: number;
}

export type Status = 'VERDE' | 'AMARELO' | 'VERMELLO' | 'ERROR';

export interface ValidationResult {
  status: Status;
  message: string;
  errorMm: number;
  isPossible: boolean;
}

export function validateMeasurements(m: Measurements): ValidationResult {
  // 1. Verificación de triángulos posibles
  // Triángulo 1: fSup, sIzq, diag1 (o diag2 según o esquema)
  // Baseado no Excel: Triángulo 1 usa fSup, sIzq, diag1. Triángulo 2 usa fSup, sDer, diag2.
  const area1 = calculateHeronArea(m.fSup, m.sIzq, m.diag1);
  const area2 = calculateHeronArea(m.fSup, m.sDer, m.diag2);

  if (area1 === -1 || area2 === -1) {
    return {
      status: 'ERROR',
      message: 'Medidas imposibles. Revisa os datos.',
      errorMm: 0,
      isPossible: false
    };
  }

  // 2. Cálculo do desfase (diferenza de alturas)
  const h1 = (2 * area1) / m.fSup;
  const h2 = (2 * area2) / m.fSup;
  const diff = Math.abs(h1 - h2);

  // 3. Semáforo
  if (diff < 5) {
    return {
      status: 'VERDE',
      message: 'Medida Perfecta',
      errorMm: diff,
      isPossible: true
    };
  } else if (diff <= 15) {
    return {
      status: 'AMARELO',
      message: `Oco descuadrado (${diff.toFixed(1)} mm). Necesítanse guías compensadoras. Confirmas?`,
      errorMm: diff,
      isPossible: true
    };
  } else {
    return {
      status: 'VERMELLO',
      message: `Erro de medida excesivo (${diff.toFixed(1)} mm). Por favor, volve medir antes de enviar.`,
      errorMm: diff,
      isPossible: true
    };
  }
}
