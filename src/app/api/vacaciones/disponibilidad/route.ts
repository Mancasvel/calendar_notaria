import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbPromise from '@/lib/mongodb';
import { checkRoleAvailability, calculateCalendarDays } from '@/lib/helpers';
import { Usuario } from '@/lib/models';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');

    if (!startParam || !endParam) {
      return NextResponse.json(
        { error: 'Missing start or end date' },
        { status: 400 }
      );
    }

    const start = new Date(startParam);
    const end = new Date(endParam);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    const db = await dbPromise;

    // Get user data to check vacation days
    const user = await db.collection<Usuario>('usuarios').findOne({
      _id: new ObjectId(session.user.id)
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check role availability
    const roleAvailable = await checkRoleAvailability(
      db,
      user.rol,
      start,
      end
    );

    // Check if user has enough vacation days
    const requestedDays = calculateCalendarDays(start, end);
    const hasEnoughDays = user.diasVacaciones >= requestedDays;

    const isAvailable = roleAvailable && hasEnoughDays;

    return NextResponse.json({
      available: isAvailable,
      roleAvailable,
      hasEnoughDays,
      requestedDays,
      remainingDays: user.diasVacaciones
    });

  } catch (error) {
    console.error('Disponibilidad error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
