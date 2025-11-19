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
 * oficial: 3 people max
 * gestion: unlimited (no restriction)
 * contabilidad + recepcion: 3 people max combined
 * copista: 1 person max
 * default: 2 people max
 */
function getMaxVacationsForRole(rol: string): number {
  const roleLower = rol.toLowerCase();
  
  if (roleLower === 'oficial') return 3;
  if (roleLower === 'gestion') return 999; // No limit
  if (roleLower === 'contabilidad' || roleLower === 'recepcion') return 3;
  if (roleLower === 'copista') return 1;
  
  return 2; // Default
}

/**
 * Check if a role has availability for vacation dates
 * Rules:
 * - oficial: max 3 people
 * - gestion: no limit
 * - contabilidad + recepcion: combined max 3 people
 * - copista: max 1 person
 * - others: max 2 people
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

  // Gestion has no limit
  if (roleLower === 'gestion') {
    return true;
  }

  // For contabilidad and recepcion, check combined count
  let rolesToCheck = [rol];
  if (roleLower === 'contabilidad' || roleLower === 'recepcion') {
    rolesToCheck = ['contabilidad', 'recepcion'];
  }

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
