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
  details: {
    offsetL: number;
    offsetR: number;
    theoDiagL: number;
    theoDiagR: number;
  };
}

export function validateMeasurements(m: Measurements): ValidationResult | null {
  const { fSup, fInf, sIzq, sDer, diag1, diag2 } = m
  
  if (!fSup || !fInf || !sIzq || !sDer || !diag1 || !diag2) return null

  /**
   * CÁLCULO DE DIAGONAL TEÓRICA (Pitágoras):
   * d = sqrt(f^2 + s^2)
   */
  const theoDiagL = Math.sqrt(Math.pow(fSup, 2) + Math.pow(sIzq, 2));
  const theoDiagR = Math.sqrt(Math.pow(fSup, 2) + Math.pow(sDer, 2));

  /**
   * FÓRMULA EXCEL TGM (Descuadre lateral proyectado):
   * Descuadre = ABS((Diagonal^2 - Frente^2 - Salida^2) / (2 * Frente))
   */
  const calcOffset = (f: number, s: number, d: number) => {
    const num = Math.pow(d, 2) - Math.pow(f, 2) - Math.pow(s, 2);
    const den = 2 * f;
    return Math.abs(num / den);
  };

  const offsetL = calcOffset(fSup, sIzq, diag1);
  const offsetR = calcOffset(fSup, sDer, diag2);

  const errorCm = Math.max(offsetL, offsetR);

  let status: Status = 'VERDE';
  let message = 'Escuadrado Perfecto (±0.5cm).';

  if (errorCm > 1.0) {
    status = 'VERMELLO';
    message = 'Erro na medida (>1cm). Revisar cotas.';
  } else if (errorCm > 0.5) {
    status = 'AMARELO';
    message = 'Desfase moderado. Require axuste de guías.';
  }

  return {
    isPossible: true,
    status,
    message,
    errorCm,
    details: {
      offsetL,
      offsetR,
      theoDiagL,
      theoDiagR
    }
  }
}
