import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbPromise from '@/lib/mongodb';
import { Reporte } from '@/lib/models';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { incidencia, comoPaso } = body;

    // Validar campos requeridos
    if (!incidencia || !comoPaso) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: incidencia y comoPaso' },
        { status: 400 }
      );
    }

    // Validar que los campos no estén vacíos
    if (incidencia.trim().length === 0 || comoPaso.trim().length === 0) {
      return NextResponse.json(
        { error: 'Los campos incidencia y comoPaso no pueden estar vacíos' },
        { status: 400 }
      );
    }

    const db = await dbPromise;

    // Crear el reporte
    const reporteData: Reporte = {
      usuarioId: new ObjectId(session.user.id),
      incidencia: incidencia.trim(),
      comoPaso: comoPaso.trim(),
      fechaIncidencia: new Date(), // Fecha automática actual
      createdAt: new Date()
    };

    const result = await db.collection<Reporte>('reportes').insertOne(reporteData);

    return NextResponse.json({
      success: true,
      reporteId: result.insertedId,
      message: 'Reporte creado exitosamente'
    });

  } catch (error) {
    console.error('Crear reporte error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
