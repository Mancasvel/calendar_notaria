import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbPromise from '@/lib/mongodb';
import { Vacacion, Usuario } from '@/lib/models';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedRole = searchParams.get('rol');

    if (!requestedRole) {
      return NextResponse.json(
        { error: 'Missing rol parameter' },
        { status: 400 }
      );
    }

    // Check if user can access this role's data
    const isAdmin = session.user.role === 'admin';
    const isOwnRole = session.user.role === requestedRole;

    if (!isAdmin && !isOwnRole) {
      return NextResponse.json(
        { error: 'Unauthorized to access this role\'s data' },
        { status: 403 }
      );
    }

    const db = await dbPromise;

    // Get vacations for the role
    const vacations = await db.collection<Vacacion>('vacaciones')
      .find({ rolUsuario: requestedRole })
      .sort({ createdAt: -1 })
      .toArray();

    // Get user details for each vacation
    const userIds = vacations.map(v => v.usuarioId);
    const users = await db.collection<Usuario>('usuarios')
      .find({ _id: { $in: userIds.map(id => new ObjectId(id)) } })
      .project({ nombre: 1, email: 1 })
      .toArray();

    const usersMap = new Map(
      users.map(u => [u._id.toString(), { nombre: u.nombre, email: u.email }])
    );

    // Combine vacation data with user info
    const vacationsWithUsers = vacations.map(vacation => ({
      ...vacation,
      usuario: usersMap.get(vacation.usuarioId.toString())
    }));

    return NextResponse.json(vacationsWithUsers);

  } catch (error) {
    console.error('Get vacations by role error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
