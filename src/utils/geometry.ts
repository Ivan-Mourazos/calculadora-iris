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
  errorCm: number;
  isPossible: boolean;
}

export function validateMeasurements(m: Measurements): ValidationResult | null {
  const { fSup, fInf, sIzq, sDer, diag1, diag2 } = m
  
  if (!fSup || !fInf || !sIzq || !sDer || !diag1 || !diag2) return null

  // Cálculo da diferenza entre diagonais (fórmula simplificada para este caso coherente co Excel en cm)
  const diffDiags = Math.abs(diag1 - diag2)

  // Limiares de erro en cm (Ajustados según lógica de negocio para toldos)
  const errorCm = diffDiags

  if (errorCm < 1) { // Menos de 1cm: Perfecto
    return {
      isPossible: true,
      status: 'VERDE',
      message: 'Medida Perfecta. O toldo encaixará sen problemas.',
      errorCm
    }
  }

  if (errorCm < 3) { // Entre 1cm y 3cm: Amarillo
    return {
      isPossible: true,
      status: 'AMARELO',
      message: `Desfase detectado (${errorCm.toFixed(1)} cm). O toldo pode quedar algo forzado.`,
      errorCm
    }
  }

  if (errorCm < 6) { // Entre 3cm y 6cm: Rojo
    return {
      isPossible: true,
      status: 'VERMELLO',
      message: `Desfase crítico (${errorCm.toFixed(1)} cm). Recomendable rectificar o oco.`,
      errorCm
    }
  }

  // Más de 6cm: Error
  return {
    isPossible: false,
    status: 'ERROR',
    message: `Medida Imposible (${errorCm.toFixed(1)} cm). Erro grave na toma de datos.`,
    errorCm
  }
}
