import { Db } from 'mongodb';
import { Vacacion } from './models';

/**
 * Festivos oficiales FIJOS para 2025
 * Estos días NO cuentan como días de vacaciones
 */
const FESTIVOS_FIJOS_2025 = [
  new Date('2025-01-01'), // Año Nuevo
  new Date('2025-01-06'), // Epifanía del Señor
  new Date('2025-02-28'), // Día de Andalucía
  new Date('2025-04-17'), // Jueves Santo
  new Date('2025-04-18'), // Viernes Santo
  new Date('2025-05-01'), // Fiesta del Trabajo
  new Date('2025-08-15'), // Asunción de la Virgen
  new Date('2025-10-12'), // Fiesta Nacional de España
  new Date('2025-11-01'), // Todos los Santos
  new Date('2025-12-06'), // Día de la Constitución
  new Date('2025-12-08'), // Inmaculada Concepción (pasa al 9 por caer en domingo)
  new Date('2025-12-09'), // Inmaculada Concepción (trasladada)
  new Date('2025-12-25'), // Navidad
];

/**
 * Obtiene los festivos dinámicos de la base de datos
 */
export async function getFestivosDinamicos(db: Db): Promise<Date[]> {
  try {
    const festivos = await db.collection('festivos_dinamicos').find({}).toArray();
    return festivos.map(f => new Date(f.fecha));
  } catch (error) {
    console.error('Error fetching festivos dinamicos:', error);
    return [];
  }
}

/**
 * Verifica si una fecha es festivo (fijo)
 */
function isFestivoFijo(date: Date): boolean {
  const dateString = date.toISOString().split('T')[0];
  return FESTIVOS_FIJOS_2025.some(festivo => {
    const festivoString = festivo.toISOString().split('T')[0];
    return festivoString === dateString;
  });
}

/**
 * Verifica si una fecha es festivo (fijo o dinámico)
 */
function isFestivo(date: Date, festivosDinamicos: Date[] = []): boolean {
  const dateString = date.toISOString().split('T')[0];
  
  // Verificar festivos fijos
  if (isFestivoFijo(date)) {
    return true;
  }
  
  // Verificar festivos dinámicos
  return festivosDinamicos.some(festivo => {
    const festivoString = festivo.toISOString().split('T')[0];
    return festivoString === dateString;
  });
}

/**
 * Verifica si una fecha es fin de semana (sábado o domingo)
 */
function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Domingo, 6 = Sábado
}

/**
 * Verifica si una fecha es laborable (no es fin de semana ni festivo)
 */
function isWorkingDay(date: Date, festivosDinamicos: Date[] = []): boolean {
  return !isWeekend(date) && !isFestivo(date, festivosDinamicos);
}

/**
 * Check if two date ranges overlap
 */
export function datesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 <= end2 && start2 <= end1;
}

/**
 * Calculate the number of WORKING days between two dates (inclusive)
 * Excluye sábados, domingos, festivos oficiales y festivos dinámicos
 * @param start Fecha de inicio
 * @param end Fecha de fin
 * @param festivosDinamicos Lista opcional de festivos dinámicos de la BD
 */
export function calculateCalendarDays(start: Date, end: Date, festivosDinamicos: Date[] = []): number {
  const startDate = new Date(start);
  const endDate = new Date(end);

  // Reset time to avoid timezone issues
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  let workingDays = 0;
  const currentDate = new Date(startDate);

  // Iterar día por día y contar solo días laborables
  while (currentDate <= endDate) {
    if (isWorkingDay(currentDate, festivosDinamicos)) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workingDays;
}

/**
 * Versión asíncrona que obtiene los festivos dinámicos de la BD
 */
export async function calculateCalendarDaysAsync(db: Db, start: Date, end: Date): Promise<number> {
  const festivosDinamicos = await getFestivosDinamicos(db);
  return calculateCalendarDays(start, end, festivosDinamicos);
}

/**
 * Get the maximum number of people that can be on vacation for a role
 * 
 * Reglas actualizadas:
 * - recepcion: Sin restricción (ilimitado)
 * - indices: Máximo 1 persona
 * - contabilidad: Máximo 1 persona
 * - copista: Máximo 1 persona
 * - oficial: Máximo 3 personas
 * - gestion: Sin restricción (ilimitado)
 * - default: Máximo 2 personas
 */
function getMaxVacationsForRole(rol: string): number {
  const roleLower = rol.toLowerCase();
  
  // Reglas actualizadas:
  if (roleLower === 'recepcion') return 999; // Sin restricción
  if (roleLower === 'indices') return 1; // Máximo 1 persona
  if (roleLower === 'contabilidad') return 1; // Máximo 1 persona
  if (roleLower === 'copista') return 1; // Máximo 1 persona
  if (roleLower === 'oficial') return 3; // Máximo 3 personas
  if (roleLower === 'gestion') return 999; // Sin restricción
  
  return 2; // Default: máximo 2 personas
}

/**
 * Check if a role has availability for vacation dates
 * 
 * Reglas actualizadas:
 * - recepcion: Sin límite
 * - gestion: Sin límite
 * - indices: Máximo 1 persona
 * - contabilidad: Máximo 1 persona
 * - copista: Máximo 1 persona
 * - oficial: Máximo 3 personas
 * - default: Máximo 2 personas
 */
export async function checkRoleAvailability(
  db: Db,
  rol: string,
  start: Date,
  end: Date,
  excludeUsuarioId?: string
): Promise<boolean> {
  const collection = db.collection<Vacacion>('vacaciones');
  const roleLower = rol.toLowerCase();

  // Sin límite para gestion y recepcion
  if (roleLower === 'gestion' || roleLower === 'recepcion') {
    return true;
  }

  // Cada rol se verifica de forma independiente
  let rolesToCheck = [rol];

  // Find all vacations for this role(s) that overlap with the requested dates
  const overlappingVacations = await collection
    .find({
      rolUsuario: { $in: rolesToCheck },
      $or: [
        {
          fechaInicio: { $lte: end },
          fechaFin: { $gte: start }
        }
      ]
    })
    .toArray();

  // Filter out the current user's vacation if updating
  const filteredVacations = excludeUsuarioId
    ? overlappingVacations.filter(v => v.usuarioId.toString() !== excludeUsuarioId)
    : overlappingVacations;

  const maxAllowed = getMaxVacationsForRole(rol);
  return filteredVacations.length < maxAllowed;
}
