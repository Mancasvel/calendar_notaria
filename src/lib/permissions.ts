/**
 * Funciones helper para gestionar permisos y roles en el sistema
 */

/**
 * Verifica si un rol tiene permisos de administrador
 * Los roles con permisos de admin son: 'admin' y 'polizas'
 * 
 * @param role - El rol del usuario a verificar
 * @returns true si el rol tiene permisos de admin, false en caso contrario
 */
export function isAdminRole(role: string | undefined): boolean {
  if (!role) return false;
  return role === 'admin' || role === 'polizas';
}

/**
 * Roles que tienen permisos de administrador en el sistema
 */
export const ADMIN_ROLES = ['admin', 'polizas'] as const;

/**
 * Tipo para los roles de admin
 */
export type AdminRole = typeof ADMIN_ROLES[number];

