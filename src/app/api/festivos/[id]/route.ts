import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { isAdminRole } from '@/lib/permissions';

/**
 * PUT /api/festivos/[id]
 * Actualiza un festivo dinámico (solo admin)
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
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const { fecha, nombre, descripcion } = body;

    if (!fecha || !nombre) {
      return NextResponse.json(
        { error: 'Fecha y nombre son requeridos' },
        { status: 400 }
      );
    }

    const fechaDate = new Date(fecha);
    fechaDate.setHours(12, 0, 0, 0);

    const db = await dbPromise;

    // Verificar que el festivo existe
    const existingFestivo = await db.collection('festivos_dinamicos').findOne({
      _id: new ObjectId(id)
    });

    if (!existingFestivo) {
      return NextResponse.json({ error: 'Festivo no encontrado' }, { status: 404 });
    }

    // Verificar si hay otro festivo en la misma fecha (excluyendo el actual)
    const duplicateFestivo = await db.collection('festivos_dinamicos').findOne({
      _id: { $ne: new ObjectId(id) },
      fecha: {
        $gte: new Date(fechaDate.getFullYear(), fechaDate.getMonth(), fechaDate.getDate(), 0, 0, 0),
        $lt: new Date(fechaDate.getFullYear(), fechaDate.getMonth(), fechaDate.getDate() + 1, 0, 0, 0)
      }
    });

    if (duplicateFestivo) {
      return NextResponse.json(
        { error: 'Ya existe otro festivo en esa fecha' },
        { status: 400 }
      );
    }

    await db.collection('festivos_dinamicos').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          fecha: fechaDate,
          nombre: nombre.trim(),
          descripcion: descripcion?.trim() || null,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Festivo actualizado correctamente'
    });

  } catch (error) {
    console.error('Error updating festivo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/festivos/[id]
 * Elimina un festivo dinámico (solo admin)
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
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const db = await dbPromise;

    // Verificar que el festivo existe
    const existingFestivo = await db.collection('festivos_dinamicos').findOne({
      _id: new ObjectId(id)
    });

    if (!existingFestivo) {
      return NextResponse.json({ error: 'Festivo no encontrado' }, { status: 404 });
    }

    await db.collection('festivos_dinamicos').deleteOne({
      _id: new ObjectId(id)
    });

    return NextResponse.json({
      success: true,
      message: 'Festivo eliminado correctamente'
    });

  } catch (error) {
    console.error('Error deleting festivo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

