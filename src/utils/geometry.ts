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
  sideOffsets?: {
    izq: number;
    der: number;
  };
}

export function validateMeasurements(m: Measurements): ValidationResult | null {
  const { fSup, sIzq, sDer, diag1, diag2 } = m
  
  if (!fSup || !sIzq || !sDer || !diag1 || !diag2) return null

  /**
   * FÓRMULA EXCEL TGM (Descuadre lateral proyectado):
   * Descuadre = ABS((Diagonal^2 - Frente^2 - Salida^2) / (2 * Frente))
   * Este valor representa os cm/mm que o lateral se desvía da perpendicular.
   */
  const calcOffset = (f: number, s: number, d: number) => {
    const num = Math.pow(d, 2) - Math.pow(f, 2) - Math.pow(s, 2);
    const den = 2 * f;
    return Math.abs(num / den);
  };

  const offsetIzq = calcOffset(fSup, sIzq, diag1);
  const offsetDer = calcOffset(fSup, sDer, diag2);

  // O erro que marca o Excel é o valor deste descuadre
  const errorCm = Math.max(offsetIzq, offsetDer);

  // Umbrais según o Excel: > 1cm é Erro en medida
  if (errorCm <= 0.5) {
    return {
      isPossible: true,
      status: 'VERDE',
      message: 'Medida Perfecta. Escuadrado dentro do rango ideal (<5mm).',
      errorCm,
      sideOffsets: { izq: offsetIzq, der: offsetDer }
    }
  }

  if (errorCm <= 1.0) {
    return {
      isPossible: true,
      status: 'AMARELO',
      message: `Desfase moderado (${errorCm.toFixed(1)} cm). O toldo pode necesitar axustes de guías.`,
      errorCm,
      sideOffsets: { izq: offsetIzq, der: offsetDer }
    }
  }

  // Se o erro é maior de 1cm, o Excel márcao como Crítico/Vermello
  if (errorCm > 1.0) {
    return {
      isPossible: true,
      status: 'VERMELLO',
      message: `Erro na medida (>1cm). O descuadre lateral é excesivo para este modelo.`,
      errorCm,
      sideOffsets: { izq: offsetIzq, der: offsetDer }
    }
  }

  return {
    isPossible: false,
    status: 'ERROR',
    message: `Medidas incompatibles co sistema Iris.`,
    errorCm,
    sideOffsets: { izq: offsetIzq, der: offsetDer }
  }
}
