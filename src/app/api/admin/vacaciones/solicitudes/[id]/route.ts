import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbPromise from '@/lib/mongodb';
import { isAdminRole } from '@/lib/permissions';
import { Vacacion, Usuario } from '@/lib/models';
import { ObjectId } from 'mongodb';
import { checkRoleAvailability, calculateCalendarDaysAsync } from '@/lib/helpers';

/**
 * PATCH /api/admin/vacaciones/solicitudes/[id]
 * Aprobar o rechazar una solicitud de vacaciones pendiente
 * Body: { action: 'aprobar' | 'rechazar' }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !isAdminRole(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (!action || !['aprobar', 'rechazar'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "aprobar" or "rechazar"' },
        { status: 400 }
      );
    }

    const db = await dbPromise;

    // Obtener la solicitud de vacaciones
    const vacacion = await db.collection<Vacacion>('vacaciones').findOne({
      _id: new ObjectId(id)
    });

    if (!vacacion) {
      return NextResponse.json({ error: 'Vacation not found' }, { status: 404 });
    }

    if (vacacion.estado !== 'pendiente') {
      return NextResponse.json(
        { error: 'Only pending vacations can be approved or rejected' },
        { status: 400 }
      );
    }

    // Obtener datos del usuario
    const user = await db.collection<Usuario>('usuarios').findOne({
      _id: vacacion.usuarioId
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (action === 'aprobar') {
      // Verificar disponibilidad de rol antes de aprobar
      const roleAvailable = await checkRoleAvailability(
        db,
        vacacion.rolUsuario,
        vacacion.fechaInicio,
        vacacion.fechaFin,
        vacacion.usuarioId.toString()
      );

      if (!roleAvailable) {
        return NextResponse.json(
          { error: 'No se puede aprobar: ya hay el máximo de personas de este rol de vacaciones en estas fechas' },
          { status: 400 }
        );
      }

      // Verificar días disponibles
      const requestedDays = vacacion.diasSolicitados || 
        await calculateCalendarDaysAsync(db, vacacion.fechaInicio, vacacion.fechaFin);

      if (user.diasVacaciones < requestedDays) {
        return NextResponse.json(
          { 
            error: 'No se puede aprobar: el usuario no tiene suficientes días de vacaciones',
            available: user.diasVacaciones,
            requested: requestedDays
          },
          { status: 400 }
        );
      }

      // Aprobar la vacación
      await db.collection<Vacacion>('vacaciones').updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            estado: 'aprobada',
            approvedAt: new Date(),
            approvedBy: new ObjectId(session.user.id),
            diasSolicitados: requestedDays
          }
        }
      );

      // Descontar días al usuario
      await db.collection<Usuario>('usuarios').updateOne(
        { _id: vacacion.usuarioId },
        {
          $inc: { diasVacaciones: -requestedDays },
          $set: { updatedAt: new Date() }
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Vacaciones aprobadas exitosamente',
        daysDeducted: requestedDays,
        remainingDays: user.diasVacaciones - requestedDays
      });

    } else {
      // Rechazar la vacación
      await db.collection<Vacacion>('vacaciones').updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            estado: 'rechazada',
            rejectedAt: new Date(),
            rejectedBy: new ObjectId(session.user.id)
          }
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Vacaciones rechazadas'
      });
    }

  } catch (error) {
    console.error('Approve/reject vacation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

