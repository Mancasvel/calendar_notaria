import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbPromise from '@/lib/mongodb';
import { isAdminRole } from '@/lib/permissions';
import { Vacacion, Usuario } from '@/lib/models';
import { ObjectId } from 'mongodb';
import { checkRoleAvailability } from '@/lib/helpers';

/**
 * Obtiene el máximo de vacaciones permitidas para un rol
 */
function getMaxVacationsForRole(rol: string): number {
  const roleLower = rol.toLowerCase();
  
  if (roleLower === 'gestion' || roleLower === 'recepcion') {
    return Infinity; // Sin límite
  }
  
  if (roleLower === 'indices' || roleLower === 'contabilidad' || roleLower === 'copista') {
    return 1; // Máximo 1 persona
  }
  
  if (roleLower === 'oficial') {
    return 3; // Máximo 3 personas
  }
  
  return 2; // Default: máximo 2 personas
}

/**
 * GET /api/admin/vacaciones/solicitudes
 * Obtiene todas las solicitudes de vacaciones pendientes con validación de restricciones
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !isAdminRole(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await dbPromise;

    // Obtener todas las solicitudes pendientes
    const solicitudes = await db
      .collection<Vacacion>('vacaciones')
      .find({ estado: 'pendiente' })
      .sort({ createdAt: -1 })
      .toArray();

    // Enriquecer con datos de usuario y validación
    const solicitudesConUsuario = await Promise.all(
      solicitudes.map(async (solicitud) => {
        const usuario = await db.collection<Usuario>('usuarios').findOne({
          _id: solicitud.usuarioId
        });

        // Verificar disponibilidad de rol
        const roleAvailable = await checkRoleAvailability(
          db,
          solicitud.rolUsuario,
          solicitud.fechaInicio,
          solicitud.fechaFin,
          solicitud.usuarioId.toString()
        );

        // Verificar días suficientes
        const hasEnoughDays = usuario ? usuario.diasVacaciones >= (solicitud.diasSolicitados || 0) : false;

        // Contar vacaciones actuales del rol
        const currentRoleVacations = await db.collection<Vacacion>('vacaciones').countDocuments({
          rolUsuario: solicitud.rolUsuario,
          estado: 'aprobada',
          $or: [
            {
              fechaInicio: { $lte: solicitud.fechaFin },
              fechaFin: { $gte: solicitud.fechaInicio }
            }
          ]
        });

        const maxRoleVacations = getMaxVacationsForRole(solicitud.rolUsuario);

        return {
          ...solicitud,
          _id: solicitud._id?.toString(),
          usuarioId: solicitud.usuarioId.toString(),
          usuario: usuario ? {
            _id: usuario._id.toString(),
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
            diasVacaciones: usuario.diasVacaciones
          } : undefined,
          validacion: {
            roleAvailable,
            hasEnoughDays,
            currentRoleVacations,
            maxRoleVacations
          }
        };
      })
    );

    return NextResponse.json({
      solicitudes: solicitudesConUsuario
    });

  } catch (error) {
    console.error('Get pending vacations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}




