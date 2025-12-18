import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbPromise from '@/lib/mongodb';
import { Usuario } from '@/lib/models';
import { ObjectId } from 'mongodb';
import { isAdminRole } from '@/lib/permissions';
import { calculateCalendarDaysAsync } from '@/lib/helpers';

/**
 * POST /api/admin/vacaciones/crear
 * Crea una vacación manualmente para cualquier usuario (solo admin)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !isAdminRole(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { usuarioId, fechaInicio, fechaFin } = body;

    // Validaciones
    if (!usuarioId || !fechaInicio || !fechaFin) {
      return NextResponse.json(
        { error: 'User ID, start date and end date are required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(usuarioId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const startDate = new Date(fechaInicio);
    const endDate = new Date(fechaFin);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Formato de fecha inválido' },
        { status: 400 }
      );
    }

    if (startDate > endDate) {
      return NextResponse.json(
        { error: 'La fecha de fin debe ser posterior o igual a la fecha de inicio' },
        { status: 400 }
      );
    }

    const db = await dbPromise;

    // Obtener el usuario
    const user = await db.collection<Usuario>('usuarios').findOne({
      _id: new ObjectId(usuarioId)
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calcular días de vacaciones (incluyendo festivos dinámicos)
    const requestedDays = await calculateCalendarDaysAsync(db, startDate, endDate);

    // Verificar que haya al menos 1 día laborable
    if (requestedDays === 0) {
      return NextResponse.json(
        { error: 'El período seleccionado no contiene días laborables' },
        { status: 400 }
      );
    }

    // Verificar que el usuario tenga suficientes días
    if (user.diasVacaciones < requestedDays) {
      return NextResponse.json(
        {
          error: 'El usuario no tiene suficientes días de vacaciones disponibles',
          available: user.diasVacaciones,
          requested: requestedDays
        },
        { status: 400 }
      );
    }

    // Crear la vacación (aprobada automáticamente al ser creada por admin)
    const newVacation = {
      usuarioId: new ObjectId(usuarioId),
      rolUsuario: user.rol,
      fechaInicio: startDate,
      fechaFin: endDate,
      estado: 'aprobada' as const,
      diasSolicitados: requestedDays,
      createdAt: new Date(),
      approvedAt: new Date(),
      approvedBy: new ObjectId(session.user.id),
      createdBy: session.user.id // Admin que creó la vacación
    };

    const result = await db.collection('vacaciones').insertOne(newVacation);

    // Descontar días del usuario
    await db.collection('usuarios').updateOne(
      { _id: new ObjectId(usuarioId) },
      {
        $inc: { diasVacaciones: -requestedDays },
        $set: { updatedAt: new Date() }
      }
    );

    // Obtener usuario actualizado
    const updatedUser = await db.collection<Usuario>('usuarios').findOne({
      _id: new ObjectId(usuarioId)
    });

    return NextResponse.json({
      success: true,
      message: 'Vacation created successfully',
      vacation: {
        _id: result.insertedId,
        ...newVacation
      },
      remainingDays: updatedUser?.diasVacaciones || 0
    }, { status: 201 });

  } catch (error) {
    console.error('Create vacation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

