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
  }, [session, status, router]);

  const fetchVacations = async () => {
    try {
      const response = await fetch('/api/admin/vacaciones');
      if (response.ok) {
        const data = await response.json();

        // Convertir los datos para el calendario
        const calendarVacations: VacationEvent[] = Object.values(data)
          .flat()
          .map((vacation: any) => ({
            id: vacation._id,
            usuarioNombre: vacation.usuario.nombre,
            usuarioEmail: vacation.usuario.email,
            rol: vacation.usuario.rol,
            fechaInicio: new Date(vacation.fechaInicio),
            fechaFin: new Date(vacation.fechaFin),
            diasVacaciones: vacation.usuario.diasVacaciones
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
            <p className="text-gray-600">Vista general de todas las vacaciones del equipo</p>
          </div>

          <VacationCalendar vacations={vacations} />
        </div>
      </div>
    </div>
  );
}

