/**
 * Festivos oficiales para España/Andalucía 2025
 * Estos días NO cuentan como días de vacaciones
 */

export interface Holiday {
  date: Date;
  name: string;
  description?: string;
}

export const HOLIDAYS_2025: Holiday[] = [
  {
    date: new Date('2025-01-01'),
    name: 'Año Nuevo',
    description: 'Año Nuevo'
  },
  {
    date: new Date('2025-01-06'),
    name: 'Epifanía del Señor',
    description: 'Día de Reyes'
  },
  {
    date: new Date('2025-02-28'),
    name: 'Día de Andalucía',
    description: 'Día de la Comunidad Autónoma de Andalucía'
  },
  {
    date: new Date('2025-04-17'),
    name: 'Jueves Santo',
    description: 'Semana Santa'
  },
  {
    date: new Date('2025-04-18'),
    name: 'Viernes Santo',
    description: 'Semana Santa'
  },
  {
    date: new Date('2025-05-01'),
    name: 'Fiesta del Trabajo',
    description: 'Día Internacional de los Trabajadores'
  },
  {
    date: new Date('2025-08-15'),
    name: 'Asunción de la Virgen',
    description: 'Festividad de la Asunción de la Virgen'
  },
  {
    date: new Date('2025-10-12'),
    name: 'Fiesta Nacional de España',
    description: 'Día de la Hispanidad'
  },
  {
    date: new Date('2025-11-01'),
    name: 'Todos los Santos',
    description: 'Día de Todos los Santos'
  },
  {
    date: new Date('2025-12-06'),
    name: 'Día de la Constitución',
    description: 'Día de la Constitución Española'
  },
  {
    date: new Date('2025-12-08'),
    name: 'Inmaculada Concepción',
    description: 'La Inmaculada Concepción'
  },
  {
    date: new Date('2025-12-09'),
    name: 'Inmaculada Concepción (trasladada)',
    description: 'Festivo trasladado por caer en domingo'
  },
  {
    date: new Date('2025-12-25'),
    name: 'Navidad',
    description: 'Natividad del Señor'
  }
];

/**
 * Obtiene la lista de festivos como strings en formato ISO
 */
export function getHolidayStrings(): string[] {
  return HOLIDAYS_2025.map(h => h.date.toISOString().split('T')[0]);
}

/**
 * Verifica si una fecha es festivo
 */
export function isHoliday(date: Date): boolean {
  const dateString = date.toISOString().split('T')[0];
  return getHolidayStrings().includes(dateString);
}

/**
 * Obtiene el nombre del festivo si la fecha es festivo
 */
export function getHolidayName(date: Date): string | null {
  const dateString = date.toISOString().split('T')[0];
  const holiday = HOLIDAYS_2025.find(h => 
    h.date.toISOString().split('T')[0] === dateString
  );
  return holiday ? holiday.name : null;
}

