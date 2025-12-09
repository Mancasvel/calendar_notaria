import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbPromise from '@/lib/mongodb';
import { checkRoleAvailability, calculateCalendarDaysAsync } from '@/lib/helpers';
import { Usuario, Vacacion } from '@/lib/models';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fechaInicio, fechaFin } = body;

    if (!fechaInicio || !fechaFin) {
      return NextResponse.json(
        { error: 'Missing fechaInicio or fechaFin' },
        { status: 400 }
      );
    }

    const start = new Date(fechaInicio);
    const end = new Date(fechaFin);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (start > end) {
      return NextResponse.json(
        { error: 'Start date must be before end date' },
        { status: 400 }
      );
    }

    const db = await dbPromise;

    // Get user data
    const user = await db.collection<Usuario>('usuarios').findOne({
      _id: new ObjectId(session.user.id)
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check role availability
    const roleAvailable = await checkRoleAvailability(
      db,
      user.rol,
      start,
      end
    );

    // Check if user has enough vacation days (incluyendo festivos dinámicos)
    const requestedDays = await calculateCalendarDaysAsync(db, start, end);
    const hasEnoughDays = user.diasVacaciones >= requestedDays;

    // Determinar el estado de la vacación
    const canAutoApprove = roleAvailable && hasEnoughDays;
    const estado: 'aprobada' | 'pendiente' = canAutoApprove ? 'aprobada' : 'pendiente';

    // Create vacation record
    const vacationData: Vacacion = {
      usuarioId: new ObjectId(session.user.id),
      rolUsuario: user.rol,
      fechaInicio: start,
      fechaFin: end,
      estado,
      diasSolicitados: requestedDays,
      createdAt: new Date(),
      ...(canAutoApprove ? { approvedAt: new Date() } : {})
    };

    const result = await db.collection<Vacacion>('vacaciones').insertOne(vacationData);

    // Solo descontar días si la vacación es aprobada automáticamente
    if (canAutoApprove) {
      await db.collection<Usuario>('usuarios').updateOne(
        { _id: user._id },
        {
          $inc: { diasVacaciones: -requestedDays },
          $set: { updatedAt: new Date() }
        }
      );
    }

    return NextResponse.json({
      success: true,
      vacationId: result.insertedId,
      estado,
      daysUsed: canAutoApprove ? requestedDays : 0,
      remainingDays: canAutoApprove ? user.diasVacaciones - requestedDays : user.diasVacaciones,
      message: canAutoApprove 
        ? 'Vacaciones aprobadas automáticamente' 
        : 'Solicitud enviada y pendiente de aprobación por el administrador'
    });

  } catch (error) {
    console.error('Solicitar vacation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
