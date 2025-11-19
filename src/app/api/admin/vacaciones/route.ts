import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbPromise from '@/lib/mongodb';
import { Vacacion, Usuario } from '@/lib/models';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const db = await dbPromise;

    // Get all vacations
    const vacations = await db.collection<Vacacion>('vacaciones')
      .find({})
      .sort({ rolUsuario: 1, createdAt: -1 })
      .toArray();

    // Get all users for reference
    const userIds = vacations.map(v => v.usuarioId);
    const users = await db.collection<Usuario>('usuarios')
      .find({ _id: { $in: userIds.map(id => new ObjectId(id)) } })
      .project({ nombre: 1, email: 1, rol: 1, diasVacaciones: 1 })
      .toArray();

    const usersMap = new Map(
      users.map(u => [u._id.toString(), u])
    );

    // Combine vacation data with user info
    const vacationsWithUsers = vacations.map(vacation => ({
      ...vacation,
      usuario: usersMap.get(vacation.usuarioId.toString())
    }));

    // Group by role
    const groupedByRole = vacationsWithUsers.reduce((acc, vacation) => {
      const role = vacation.rolUsuario;
      if (!acc[role]) {
        acc[role] = [];
      }
      acc[role].push(vacation);
      return acc;
    }, {} as Record<string, typeof vacationsWithUsers>);

    return NextResponse.json(groupedByRole);

  } catch (error) {
    console.error('Get admin vacations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
