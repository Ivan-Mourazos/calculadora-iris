export function calculateHeronArea(a: number, b: number, c: number): number {
  if (a <= 0 || b <= 0 || c <= 0) return 0;
  if (a + b <= c || a + c <= b || b + c <= a) return -1;
  const s = (a + b + c) / 2;
  const val = s * (s - a) * (s - b) * (s - c);
  if (val < 0) return -1;
  return Math.sqrt(val);
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
  const { fSup, sIzq, sDer, diag1, diag2 } = m
  
  if (!fSup || !sIzq || !sDer || !diag1 || !diag2) return null

  // Segundo a fórmula do Excel: ABS(DiagonalCalculada - DiagonalMedida)
  // Diagonal teórica usando Pitágoras (Escuadrado perfecto)
  const diag1Teorica = Math.sqrt(Math.pow(fSup, 2) + Math.pow(sIzq, 2))
  const diag2Teorica = Math.sqrt(Math.pow(fSup, 2) + Math.pow(sDer, 2))

  const diff1 = Math.abs(diag1Teorica - diag1)
  const diff2 = Math.abs(diag2Teorica - diag2)

  // Tomamos o erro máximo detectado
  const errorCm = Math.max(diff1, diff2)

  // Umbrais según o Excel: <= 0.5 (Verde), <= 1 (Amarillo), > 1 (Vermello)
  if (errorCm <= 0.5) {
    return {
      isPossible: true,
      status: 'VERDE',
      message: 'Medida Perfecta (<5mm). Escuadrado correcto para Iris.',
      errorCm
    }
  }

  if (errorCm <= 1.0) {
    return {
      isPossible: true,
      status: 'AMARELO',
      message: `Desfase moderado (<1cm). Oco dentro dos límites de compensación.`,
      errorCm
    }
  }

  if (errorCm <= 3.0) {
    return {
      isPossible: true,
      status: 'VERMELLO',
      message: `Desfase crítico (>1cm). Revisar oco ou usar guías compensadoras.`,
      errorCm
    }
  }

  return {
    isPossible: false,
    status: 'ERROR',
    message: `Fóra de rango técnico. O toldo Iris sufrirá graves problemas de apertura.`,
    errorCm
  }
}
