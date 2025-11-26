import { Db } from 'mongodb';
import { Vacacion } from './models';

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
 * Calculate the number of calendar days between two dates (inclusive)
 */
export function calculateCalendarDays(start: Date, end: Date): number {
  const startDate = new Date(start);
  const endDate = new Date(end);

  // Reset time to avoid timezone issues
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 for inclusive

  return diffDays;
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
