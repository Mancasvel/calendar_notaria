import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbPromise from '@/lib/mongodb';
import { Usuario } from '@/lib/models';
import { isAdminRole } from '@/lib/permissions';
import bcrypt from 'bcryptjs';

/**
 * GET /api/admin/usuarios
 * Obtiene la lista de todos los usuarios
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !isAdminRole(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const db = await dbPromise;

    // Obtener todos los usuarios (sin el hash de contraseña)
    const users = await db.collection<Usuario>('usuarios')
      .find({})
      .project({ passwordHash: 0 }) // Excluir el hash de contraseña
      .sort({ nombre: 1 })
      .toArray();

    return NextResponse.json(users);

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/usuarios
 * Crea un nuevo usuario
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !isAdminRole(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { email, nombre, rol, despacho, password, diasVacaciones } = body;

    // Validaciones
    if (!email || !nombre || !rol || !password) {
      return NextResponse.json(
        { error: 'Email, nombre, rol and password are required' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const db = await dbPromise;

    // Verificar que el email no exista
    const existingUser = await db.collection('usuarios').findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 12);

    // Crear usuario
    const newUser = {
      email,
      nombre,
      rol,
      despacho: despacho || null,
      passwordHash,
      diasVacaciones: diasVacaciones || 20,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('usuarios').insertOne(newUser);

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        _id: result.insertedId,
        email,
        nombre,
        rol,
        despacho,
        diasVacaciones: newUser.diasVacaciones
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

