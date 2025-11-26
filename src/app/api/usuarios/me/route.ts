import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbPromise from '@/lib/mongodb';
import { Usuario } from '@/lib/models';
import { ObjectId } from 'mongodb';

/**
 * GET /api/usuarios/me
 * Obtiene la información actualizada del usuario actual (incluyendo días de vacaciones)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await dbPromise;

    // Obtener usuario actualizado de la base de datos
    const user = await db.collection<Usuario>('usuarios').findOne({
      _id: new ObjectId(session.user.id)
    }, {
      projection: {
        _id: 1,
        email: 1,
        nombre: 1,
        rol: 1,
        despacho: 1,
        diasVacaciones: 1
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id.toString(),
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
      despacho: user.despacho,
      diasVacaciones: user.diasVacaciones
    });

  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

