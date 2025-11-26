import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbPromise from '@/lib/mongodb';
import { Usuario } from '@/lib/models';
import { ObjectId } from 'mongodb';
import { isAdminRole } from '@/lib/permissions';
import bcrypt from 'bcryptjs';

/**
 * PUT /api/admin/usuarios/[id]
 * Actualiza un usuario existente
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
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const body = await request.json();
    const { email, nombre, rol, despacho, diasVacaciones, password } = body;

    // Validaciones
    if (!email || !nombre || !rol) {
      return NextResponse.json(
        { error: 'Email, nombre and rol are required' },
        { status: 400 }
      );
    }

    const db = await dbPromise;

    // Verificar que el usuario existe
    const existingUser = await db.collection<Usuario>('usuarios').findOne({
      _id: new ObjectId(id)
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Si se cambió el email, verificar que no exista otro usuario con ese email
    if (email !== existingUser.email) {
      const emailExists = await db.collection('usuarios').findOne({
        email,
        _id: { $ne: new ObjectId(id) }
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    // Preparar actualización
    const updateData: any = {
      email,
      nombre,
      rol,
      despacho: despacho || null,
      diasVacaciones: diasVacaciones ?? existingUser.diasVacaciones,
      updatedAt: new Date()
    };

    // Si se proporciona una nueva contraseña, hashearla
    if (password && password.trim() !== '') {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    // Actualizar usuario
    await db.collection('usuarios').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: {
        _id: id,
        email,
        nombre,
        rol,
        despacho,
        diasVacaciones: updateData.diasVacaciones
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/usuarios/[id]
 * Elimina un usuario y todas sus vacaciones
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
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // No permitir que el admin se elimine a sí mismo
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const db = await dbPromise;

    // Verificar que el usuario existe
    const user = await db.collection<Usuario>('usuarios').findOne({
      _id: new ObjectId(id)
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Eliminar todas las vacaciones del usuario
    const vacationsDeleted = await db.collection('vacaciones').deleteMany({
      usuarioId: new ObjectId(id)
    });

    // Eliminar el usuario
    await db.collection('usuarios').deleteOne({
      _id: new ObjectId(id)
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      vacationsDeleted: vacationsDeleted.deletedCount
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

