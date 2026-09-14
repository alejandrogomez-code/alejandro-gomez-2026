/**
 * El IMC nunca se guarda en la base de datos: se calcula siempre en el momento.
 */

/** IMC = peso(kg) / altura(m)^2. Devuelve null si faltan datos. */
export function calculateBMI(weightKg: number | null, heightCm: number | null): number | null {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

/** IMC con un decimal: 33.0 */
export function formatBMI(bmi: number | null): string {
  if (bmi === null) return '—';
  return bmi.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export type BMICategory =
  | 'Bajo peso'
  | 'Peso normal'
  | 'Sobrepeso'
  | 'Obesidad I'
  | 'Obesidad II'
  | 'Obesidad III';

export function bmiCategory(bmi: number | null): BMICategory | null {
  if (bmi === null) return null;
  if (bmi < 18.5) return 'Bajo peso';
  if (bmi < 25) return 'Peso normal';
  if (bmi < 30) return 'Sobrepeso';
  if (bmi < 35) return 'Obesidad I';
  if (bmi < 40) return 'Obesidad II';
  return 'Obesidad III';
}

/** Peso que correspondería a un IMC dado, para líneas de referencia. */
export function weightForBMI(bmi: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return bmi * heightM * heightM;
}
