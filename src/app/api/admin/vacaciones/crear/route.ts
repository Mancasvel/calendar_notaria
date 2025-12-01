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

    if (startDate >= endDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
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

    // Verificar que el usuario tenga suficientes días
    if (user.diasVacaciones < requestedDays) {
      return NextResponse.json(
        {
          error: 'User does not have enough vacation days',
          available: user.diasVacaciones,
          requested: requestedDays
        },
        { status: 400 }
      );
    }

    // Crear la vacación
    const newVacation = {
      usuarioId: new ObjectId(usuarioId),
      rolUsuario: user.rol,
      fechaInicio: startDate,
      fechaFin: endDate,
      createdAt: new Date(),
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

