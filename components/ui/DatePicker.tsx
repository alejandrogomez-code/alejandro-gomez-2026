'use client';

import { Input, type InputProps } from './Input';

export type DatePickerProps = Omit<InputProps, 'type'>;

/**
 * Selector de fecha nativo: funciona bien en desktop y celular y siempre
 * trabaja con strings 'YYYY-MM-DD', sin conversiones de zona horaria.
 */
export function DatePicker(props: DatePickerProps) {
  return <Input type="date" {...props} />;
}
