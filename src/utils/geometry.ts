/**
 * Cálculo da área polo método de Herón
 */
export function calculateHeronArea(a: number, b: number, c: number): number {
  if (a <= 0 || b <= 0 || c <= 0) return 0;
  // Verificación de desigualdade triangular
  if (a + b <= c || a + c <= b || b + c <= a) return -1;

  const s = (a + b + c) / 2;
  const val = s * (s - a) * (s - b) * (s - c);
  if (val < 0) return -1;
  return Math.sqrt(val);
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

  // Cálculo da áreas usando Herón para obter o descuadre real (como no Excel técnico)
  const area1 = calculateHeronArea(fSup, sIzq, diag1);
  const area2 = calculateHeronArea(fSup, sDer, diag2);

  if (area1 === -1 || area2 === -1) {
    return {
      status: 'ERROR',
      message: 'Medidas imposibles. Os datos non forman un oco real.',
      errorCm: 0,
      isPossible: false
    };
  }

  // Alturas comparativas respecto á fronte superior
  const h1 = (2 * area1) / fSup;
  const h2 = (2 * area2) / fSup;
  
  // O erro real é a diferencia de alturas (descuadre vertical) O de proxeccións en diagonal
  // No Excel do Iris sóese usar a diferencia de alturas como indicador de descuadre lateral
  const errorCm = Math.abs(h1 - h2);

  if (errorCm < 0.5) { // Menos de 5mm (0.5cm)
    return {
      isPossible: true,
      status: 'VERDE',
      message: 'Medida Perfecta. O toldo encaixará sen problemas.',
      errorCm
    }
  }

  if (errorCm < 2) { // Menos de 2cm
    return {
      isPossible: true,
      status: 'AMARELO',
      message: `Desfase detectado (${errorCm.toFixed(1)} cm). Recoméndase o uso de guías compensadoras.`,
      errorCm
    }
  }

  if (errorCm < 4) { // Menos de 4cm
    return {
      isPossible: true,
      status: 'VERMELLO',
      message: `Desfase crítico (${errorCm.toFixed(1)} cm). O toldo pode sufrir torsión. Revisa o oco.`,
      errorCm
    }
  }

  return {
    isPossible: false,
    status: 'ERROR',
    message: `Medida Incompatible (${errorCm.toFixed(1)} cm). Excede os límites técnicos do Iris.`,
    errorCm
  }
}
