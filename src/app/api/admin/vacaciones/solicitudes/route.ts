import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbPromise from '@/lib/mongodb';
import { isAdminRole } from '@/lib/permissions';
import { Vacacion, Usuario } from '@/lib/models';
import { ObjectId } from 'mongodb';

/**
 * GET /api/admin/vacaciones/solicitudes
 * Obtiene todas las solicitudes de vacaciones pendientes
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

    // Enriquecer con datos de usuario
    const solicitudesConUsuario = await Promise.all(
      solicitudes.map(async (solicitud) => {
        const usuario = await db.collection<Usuario>('usuarios').findOne({
          _id: solicitud.usuarioId
        });

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
          } : undefined
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

