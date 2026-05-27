export interface Measurements {
  fSup: number;
  fInf: number;
  sIzq: number;
  sDer: number;
  diag1: number;
  diag2: number;
}

export type Status = 'VERDADEIRO' | 'FALSO';

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

  let status: Status = 'VERDADEIRO';
  let message = 'Escuadrado correcto (desfase ≤ 0.5cm).';

  if (errorCm > 1.0) {
    status = 'FALSO';
    message = 'Desfase crítico (> 1.0cm). Revisar cotas.';
  } else if (errorCm > 0.5) {
    status = 'VERDADEIRO';
    message = 'Desfase moderado (0.5cm - 1.0cm). Require axuste.';
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

export type MeasurementValidationStatus = 'CORRECTA' | 'ACEPTABLE' | 'INCORRECTA' | 'IMPOSIBLE';

export interface MeasurementValidationResult {
  status: MeasurementValidationStatus;
  message: string;
  deviation: number;
  theoFInf: number;
  isPossible: boolean;
  details: {
    h1: number;
    h2: number;
    dirX1: number;
    dirX2: number;
  };
}

export interface OutputOffsetResult {
  offsetL: number;
  offsetR: number;
  maxOffset: number;
  status: 'CORRECTO' | 'MODERADO' | 'CRITICO';
  message: string;
  frenteToldo: number;
}

export function validateCommercialMeasurements(m: Measurements): MeasurementValidationResult | null {
  const { fSup, fInf, sIzq, sDer, diag1, diag2 } = m;

  if (!fSup || !fInf || !sIzq || !sDer || !diag1 || !diag2) return null;

  // Verify triangle inequality (Triangle 1 is completed by diag2, Triangle 2 by diag1)
  const t1Possible = (fSup + sIzq > diag2) && (fSup + diag2 > sIzq) && (sIzq + diag2 > fSup);
  const t2Possible = (fSup + sDer > diag1) && (fSup + diag1 > sDer) && (sDer + diag1 > fSup);

  if (!t1Possible || !t2Possible) {
    return {
      status: 'IMPOSIBLE',
      message: 'As medidas introducidas non son xeometricamente posibles (non forman triángulos válidos).',
      deviation: 0,
      theoFInf: 0,
      isPossible: false,
      details: { h1: 0, h2: 0, dirX1: 0, dirX2: 0 }
    };
  }

  // Trigonometry
  const cos_theta1 = (sIzq * sIzq + fSup * fSup - diag2 * diag2) / (2 * sIzq * fSup);
  const cos_theta2 = (sDer * sDer + fSup * fSup - diag1 * diag1) / (2 * sDer * fSup);

  if (Math.abs(cos_theta1) > 1 || Math.abs(cos_theta2) > 1) {
    return {
      status: 'IMPOSIBLE',
      message: 'As medidas introducidas son xeometricamente imposibles (ángulos fóra de rango).',
      deviation: 0,
      theoFInf: 0,
      isPossible: false,
      details: { h1: 0, h2: 0, dirX1: 0, dirX2: 0 }
    };
  }

  const theta1 = Math.acos(cos_theta1);
  const theta2 = Math.acos(cos_theta2);

  const h1 = sIzq * Math.sin(theta1);
  const h2 = sDer * Math.sin(theta2);

  const x1 = sIzq * Math.abs(Math.cos(theta1));
  const x2 = sDer * Math.abs(Math.cos(theta2));

  // K3 > 90 in Excel is theta1 > PI/2, which is cos_theta1 < 0
  const dirX1 = cos_theta1 < 0 ? x1 : -x1;
  const dirX2 = cos_theta2 < 0 ? x2 : -x2;

  const sepAlturas = fSup + dirX1 + dirX2;
  const difAlturas = h1 - h2;
  const theoFInf = Math.sqrt(sepAlturas * sepAlturas + difAlturas * difAlturas);

  const deviation = Math.abs(theoFInf - fInf);

  let status: MeasurementValidationStatus = 'CORRECTA';
  let message = 'Medidas correctas. O erro na toma de medidas é inferior a 0.5 cm.';

  if (deviation > 1.0) {
    status = 'INCORRECTA';
    message = 'Medidas incorrectas. O desfase de medidas é crítico (> 1.0 cm). Revisar cotas no sitio.';
  } else if (deviation > 0.5) {
    status = 'ACEPTABLE';
    message = 'Medidas aceptables. O desfase de medidas é moderado (0.5 cm - 1.0 cm).';
  }

  return {
    status,
    message,
    deviation,
    theoFInf,
    isPossible: true,
    details: {
      h1,
      h2,
      dirX1,
      dirX2
    }
  };
}

export function calculateOutputOffsets(m: Measurements, validation: MeasurementValidationResult): OutputOffsetResult {
  const { fSup } = m;
  const { dirX1, dirX2 } = validation.details;

  const offsetL = Math.abs(dirX1);
  const offsetR = Math.abs(dirX2);
  const maxOffset = Math.max(offsetL, offsetR);

  let status: 'CORRECTO' | 'MODERADO' | 'CRITICO' = 'CORRECTO';
  let message = 'Escuadrado correcto (desfase ≤ 0.5cm).';

  if (maxOffset > 1.0) {
    status = 'CRITICO';
    message = 'Desfase crítico (> 1.0cm). O toldo require axuste de fabricación.';
  } else if (maxOffset > 0.5) {
    status = 'MODERADO';
    message = 'Desfase moderado (0.5cm - 1.0cm). Require axuste.';
  }

  const descuentoL = dirX1 < 0 ? dirX1 : 0;
  const descuentoR = dirX2 < 0 ? dirX2 : 0;
  const frenteToldo = fSup + descuentoL + descuentoR;

  return {
    offsetL,
    offsetR,
    maxOffset,
    status,
    message,
    frenteToldo
  };
}
