import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbPromise from '@/lib/mongodb';
import { Vacacion, Usuario } from '@/lib/models';
import { ObjectId } from 'mongodb';
import { isAdminRole } from '@/lib/permissions';
import { calculateCalendarDays } from '@/lib/helpers';

/**
 * DELETE /api/admin/vacaciones/[id]
 * Elimina una vacación y restaura los días al usuario
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !isAdminRole(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid vacation ID' }, { status: 400 });
    }

    const db = await dbPromise;

    // Obtener la vacación para restaurar los días
    const vacation = await db.collection<Vacacion>('vacaciones').findOne({
      _id: new ObjectId(id)
    });

    if (!vacation) {
      return NextResponse.json({ error: 'Vacation not found' }, { status: 404 });
    }

    // Calcular días a restaurar
    const daysToRestore = calculateCalendarDays(
      new Date(vacation.fechaInicio),
      new Date(vacation.fechaFin)
    );

    // Eliminar la vacación
    await db.collection('vacaciones').deleteOne({
      _id: new ObjectId(id)
    });

    // Restaurar días al usuario
    await db.collection('usuarios').updateOne(
      { _id: new ObjectId(vacation.usuarioId) },
      {
        $inc: { diasVacaciones: daysToRestore },
        $set: { updatedAt: new Date() }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Vacation deleted successfully',
      daysRestored: daysToRestore
    });

  } catch (error) {
    console.error('Delete vacation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/vacaciones/[id]
 * Actualiza una vacación existente
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !isAdminRole(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid vacation ID' }, { status: 400 });
    }

    const body = await request.json();
    const { fechaInicio, fechaFin } = body;

    if (!fechaInicio || !fechaFin) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
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

    // Obtener la vacación actual
    const currentVacation = await db.collection<Vacacion>('vacaciones').findOne({
      _id: new ObjectId(id)
    });

    if (!currentVacation) {
      return NextResponse.json({ error: 'Vacation not found' }, { status: 404 });
    }

    // Calcular diferencia de días
    const oldDays = calculateCalendarDays(
      new Date(currentVacation.fechaInicio),
      new Date(currentVacation.fechaFin)
    );
    const newDays = calculateCalendarDays(startDate, endDate);
    const daysDifference = oldDays - newDays;

    // Actualizar la vacación
    await db.collection('vacaciones').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          fechaInicio: startDate,
          fechaFin: endDate,
          updatedAt: new Date()
        }
      }
    );

    // Ajustar días del usuario
    if (daysDifference !== 0) {
      await db.collection('usuarios').updateOne(
        { _id: new ObjectId(currentVacation.usuarioId) },
        {
          $inc: { diasVacaciones: daysDifference },
          $set: { updatedAt: new Date() }
        }
      );
    }

    // Obtener usuario actualizado
    const user = await db.collection<Usuario>('usuarios').findOne({
      _id: new ObjectId(currentVacation.usuarioId)
    });

    return NextResponse.json({
      success: true,
      message: 'Vacation updated successfully',
      vacation: {
        _id: id,
        fechaInicio: startDate,
        fechaFin: endDate,
        usuarioId: currentVacation.usuarioId,
        rolUsuario: currentVacation.rolUsuario
      },
      remainingDays: user?.diasVacaciones || 0
    });

  } catch (error) {
    console.error('Update vacation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

