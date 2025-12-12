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
        { error: 'Formato de fecha inválido' },
        { status: 400 }
      );
    }

    // Validar que la fecha de fin sea posterior o igual a la de inicio
    if (start > end) {
      return NextResponse.json(
        { error: 'La fecha de fin debe ser posterior o igual a la fecha de inicio' },
        { status: 400 }
      );
    }

    // Validar que no se puedan pedir vacaciones en el pasado
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar a medianoche
    start.setHours(0, 0, 0, 0);
    
    if (start < today) {
      return NextResponse.json(
        { error: 'No se pueden solicitar vacaciones en fechas pasadas' },
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

    // Calcular días solicitados (incluyendo festivos dinámicos)
    const requestedDays = await calculateCalendarDaysAsync(db, start, end);

    // TODAS las vacaciones nuevas entran como pendientes
    const vacationData: Vacacion = {
      usuarioId: new ObjectId(session.user.id),
      rolUsuario: user.rol,
      fechaInicio: start,
      fechaFin: end,
      estado: 'pendiente',
      diasSolicitados: requestedDays,
      createdAt: new Date()
    };

    const result = await db.collection<Vacacion>('vacaciones').insertOne(vacationData);

    // NO se descuentan días hasta que el admin apruebe
    return NextResponse.json({
      success: true,
      vacationId: result.insertedId,
      estado: 'pendiente',
      daysUsed: 0,
      remainingDays: user.diasVacaciones,
      message: 'Solicitud enviada y pendiente de aprobación por el administrador'
    });

  } catch (error) {
    console.error('Solicitar vacation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
