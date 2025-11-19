'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface VacationWithUser {
  _id: string;
  fechaInicio: string;
  fechaFin: string;
  createdAt: string;
  usuario: {
    nombre: string;
    email: string;
    rol: string;
    diasVacaciones: number;
  };
}

interface GroupedVacations {
  [role: string]: VacationWithUser[];
}

export default function AdminVacacionesPage() {
  const { data: session, status } = useSession();
  const [vacations, setVacations] = useState<GroupedVacations>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user || session.user.role !== 'admin') {
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

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Administración de Vacaciones</h1>
              <p className="text-gray-600">Vista completa de todas las vacaciones por rol</p>
            </div>

            {Object.keys(vacations).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay vacaciones registradas.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(vacations).map(([role, roleVacations]) => (
                  <div key={role} className="border-t pt-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Rol: {role} ({roleVacations.length} vacaciones)
                    </h2>

                    <div className="grid gap-4">
                      {roleVacations.map((vacation) => (
                        <div key={vacation._id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="font-medium text-gray-900">{vacation.usuario.nombre}</p>
                              <p className="text-sm text-gray-600">{vacation.usuario.email}</p>
                              <p className="text-sm text-gray-500">
                                Días restantes: {vacation.usuario.diasVacaciones}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium">
                                {new Date(vacation.fechaInicio).toLocaleDateString()} - {' '}
                                {new Date(vacation.fechaFin).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-500">
                                Solicitado: {new Date(vacation.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Aprobada
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
