import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbPromise from '@/lib/mongodb';
import { Vacacion, Usuario } from '@/lib/models';
import { ObjectId } from 'mongodb';
import { isAdminRole } from '@/lib/permissions';
import { calculateCalendarDaysAsync } from '@/lib/helpers';

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

    // Solo restaurar días si la vacación estaba aprobada
    let daysToRestore = 0;
    if (vacation.estado === 'aprobada') {
      daysToRestore = vacation.diasSolicitados || await calculateCalendarDaysAsync(
        db,
        new Date(vacation.fechaInicio),
        new Date(vacation.fechaFin)
      );

      // Restaurar días al usuario
      await db.collection('usuarios').updateOne(
        { _id: new ObjectId(vacation.usuarioId) },
        {
          $inc: { diasVacaciones: daysToRestore },
          $set: { updatedAt: new Date() }
        }
      );
    }

    // Eliminar la vacación
    await db.collection('vacaciones').deleteOne({
      _id: new ObjectId(id)
    });

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
      return NextResponse.json({ error: 'ID de vacación inválido' }, { status: 400 });
    }

    const body = await request.json();
    const { fechaInicio, fechaFin, usuarioId } = body;

    if (!fechaInicio || !fechaFin) {
      return NextResponse.json(
        { error: 'Fecha de inicio y fecha de fin son requeridas' },
        { status: 400 }
      );
    }

    if (!usuarioId || usuarioId.trim() === '') {
      return NextResponse.json(
        { error: 'Usuario es requerido' },
        { status: 400 }
      );
    }

    const startDate = new Date(fechaInicio);
    const endDate = new Date(fechaFin);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Formato de fecha inválido' },
        { status: 400 }
      );
    }

    // Validar que la fecha de fin sea posterior o igual a la de inicio
    if (startDate > endDate) {
      return NextResponse.json(
        { error: 'La fecha de fin debe ser posterior o igual a la fecha de inicio' },
        { status: 400 }
      );
    }

    const db = await dbPromise;

    // Obtener la vacación actual
    const currentVacation = await db.collection<Vacacion>('vacaciones').findOne({
      _id: new ObjectId(id)
    });

    if (!currentVacation) {
      return NextResponse.json({ error: 'Vacación no encontrada' }, { status: 404 });
    }

    // Manejar cambio de usuario si se proporciona
    let newUser = null;
    let updateUserId = currentVacation.usuarioId;
    let updateRolUsuario = currentVacation.rolUsuario;

    if (usuarioId && usuarioId !== currentVacation.usuarioId.toString()) {
      // Validar que el usuarioId sea un ObjectId válido
      if (!ObjectId.isValid(usuarioId)) {
        return NextResponse.json({ error: 'ID de usuario inválido' }, { status: 400 });
      }

      // Validar que el nuevo usuario existe
      newUser = await db.collection<Usuario>('usuarios').findOne({
        _id: new ObjectId(usuarioId)
      });

      if (!newUser) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
      }

      updateUserId = new ObjectId(usuarioId);
      updateRolUsuario = newUser.rol;
    }

    // Calcular diferencia de días (incluyendo festivos dinámicos)
    const oldDays = currentVacation.diasSolicitados || await calculateCalendarDaysAsync(
      db,
      new Date(currentVacation.fechaInicio),
      new Date(currentVacation.fechaFin)
    );
    const newDays = await calculateCalendarDaysAsync(db, startDate, endDate);
    const daysDifference = oldDays - newDays;

    // Preparar actualización de la vacación
    const vacationUpdate: any = {
      fechaInicio: startDate,
      fechaFin: endDate,
      diasSolicitados: newDays,
      updatedAt: new Date()
    };

    // Si cambió el usuario, actualizar usuarioId y rolUsuario
    if (usuarioId && usuarioId !== currentVacation.usuarioId.toString()) {
      vacationUpdate.usuarioId = updateUserId;
      vacationUpdate.rolUsuario = updateRolUsuario;
    }

    // Actualizar la vacación
    await db.collection('vacaciones').updateOne(
      { _id: new ObjectId(id) },
      { $set: vacationUpdate }
    );

    // Ajustar días del usuario solo si la vacación está aprobada
    if (currentVacation.estado === 'aprobada') {
      // Si cambió el usuario, necesitamos manejar ambos usuarios
      if (usuarioId && usuarioId !== currentVacation.usuarioId.toString()) {
        // Restaurar días al usuario anterior
        await db.collection('usuarios').updateOne(
          { _id: new ObjectId(currentVacation.usuarioId) },
          {
            $inc: { diasVacaciones: oldDays },
            $set: { updatedAt: new Date() }
          }
        );

        // Descontar días del nuevo usuario
        await db.collection('usuarios').updateOne(
          { _id: updateUserId },
          {
            $inc: { diasVacaciones: -newDays },
            $set: { updatedAt: new Date() }
          }
        );
      } else {
        // Solo cambió las fechas, ajustar días del mismo usuario
        await db.collection('usuarios').updateOne(
          { _id: new ObjectId(currentVacation.usuarioId) },
          {
            $inc: { diasVacaciones: daysDifference },
            $set: { updatedAt: new Date() }
          }
        );
      }
    }

    // Obtener usuario actualizado (el correcto según si cambió o no)
    const finalUserId = usuarioId && usuarioId !== currentVacation.usuarioId.toString()
      ? updateUserId
      : new ObjectId(currentVacation.usuarioId);

    const user = await db.collection<Usuario>('usuarios').findOne({
      _id: finalUserId
    });

    return NextResponse.json({
      success: true,
      message: 'Vacation updated successfully',
      vacation: {
        _id: id,
        fechaInicio: startDate,
        fechaFin: endDate,
        usuarioId: finalUserId,
        rolUsuario: updateRolUsuario
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

