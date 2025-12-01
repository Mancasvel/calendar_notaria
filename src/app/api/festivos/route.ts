import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbPromise from '@/lib/mongodb';
import { isAdminRole } from '@/lib/permissions';

export interface FestivoDinamico {
  fecha: Date;
  nombre: string;
  descripcion?: string;
  createdAt: Date;
  createdBy: string;
}

/**
 * GET /api/festivos
 * Obtiene todos los festivos dinámicos (disponible para todos los usuarios autenticados)
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await dbPromise;
    const festivos = await db.collection('festivos_dinamicos')
      .find({})
      .sort({ fecha: 1 })
      .toArray();

    return NextResponse.json(festivos);
  } catch (error) {
    console.error('Error fetching festivos:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/festivos
 * Crea un nuevo festivo dinámico (solo admin)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !isAdminRole(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
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
    fechaDate.setHours(12, 0, 0, 0); // Normalizar hora

    const db = await dbPromise;

    // Verificar si ya existe un festivo en esa fecha
    const existingFestivo = await db.collection('festivos_dinamicos').findOne({
      fecha: {
        $gte: new Date(fechaDate.getFullYear(), fechaDate.getMonth(), fechaDate.getDate(), 0, 0, 0),
        $lt: new Date(fechaDate.getFullYear(), fechaDate.getMonth(), fechaDate.getDate() + 1, 0, 0, 0)
      }
    });

    if (existingFestivo) {
      return NextResponse.json(
        { error: 'Ya existe un festivo en esa fecha' },
        { status: 400 }
      );
    }

    const nuevoFestivo: FestivoDinamico = {
      fecha: fechaDate,
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || undefined,
      createdAt: new Date(),
      createdBy: session.user.id || session.user.email || 'admin'
    };

    const result = await db.collection('festivos_dinamicos').insertOne(nuevoFestivo);

    return NextResponse.json({
      success: true,
      message: 'Festivo creado correctamente',
      festivo: {
        _id: result.insertedId,
        ...nuevoFestivo
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating festivo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

