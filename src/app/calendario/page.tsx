'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import VacationCalendar from '@/components/vacation-calendar';

interface VacationEvent {
  id: string;
  usuarioNombre: string;
  usuarioEmail: string;
  rol: string;
  fechaInicio: Date;
  fechaFin: Date;
  diasVacaciones: number;
}

export default function CalendarioGeneralPage() {
  const { data: session, status } = useSession();
  const [vacations, setVacations] = useState<VacationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.push('/login');
      return;
    }

    fetchVacations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, router]);

  const fetchVacations = async () => {
    if (!session?.user?.role) return;

    try {
      // Obtener las vacaciones del rol del usuario actual
      const response = await fetch(`/api/vacaciones/rol?rol=${session.user.role}`);
      if (response.ok) {
        const data = await response.json();

        // Convertir los datos para el calendario
        const calendarVacations: VacationEvent[] = data.map((vacation: any) => ({
          id: vacation._id,
          usuarioNombre: vacation.usuario ? vacation.usuario.nombre : 'Usuario desconocido',
          usuarioEmail: vacation.usuario ? vacation.usuario.email : 'N/A',
          rol: session.user.role,
          fechaInicio: new Date(vacation.fechaInicio),
          fechaFin: new Date(vacation.fechaFin),
          diasVacaciones: 0 // No mostrar días de otros usuarios
        }));

        setVacations(calendarVacations);
      }
    } catch (error) {
      console.error('Error fetching vacations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Calendario de Vacaciones</h1>
            <p className="text-gray-600">
              Vista de vacaciones del rol: <span className="font-semibold capitalize">{session.user.role}</span>
            </p>
          </div>

          <VacationCalendar vacations={vacations} />
        </div>
      </div>
    </div>
  );
}

