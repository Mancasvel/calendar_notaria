'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Vacation {
  _id: string;
  fechaInicio: string;
  fechaFin: string;
  createdAt: string;
}

export default function MisVacacionesPage() {
  const { data: session, status } = useSession();
  const [vacations, setVacations] = useState<Vacation[]>([]);
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
      const response = await fetch('/api/vacaciones/mias');
      if (response.ok) {
        const data = await response.json();
        setVacations(data);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mis Vacaciones</h1>
                <p className="text-gray-600">
                  Días de vacaciones restantes: {session.user.diasVacaciones}
                </p>
              </div>
              <button
                onClick={() => router.push('/solicitar-vacaciones')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Solicitar Vacaciones
              </button>
            </div>

            {vacations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No tienes vacaciones registradas.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Historial de Vacaciones</h2>
                <div className="grid gap-4">
                  {vacations.map((vacation) => (
                    <div key={vacation._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">
                            {new Date(vacation.fechaInicio).toLocaleDateString()} - {' '}
                            {new Date(vacation.fechaFin).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Solicitado: {new Date(vacation.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
