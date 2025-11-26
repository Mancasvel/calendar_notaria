'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { isAdminRole } from '@/lib/permissions';

/**
 * Componente Navbar principal de la aplicación
 * 
 * Funcionalidades:
 * - Muestra el nombre del usuario autenticado
 * - Navegación a las páginas principales (Mis Vacaciones, Solicitar Vacaciones)
 * - Para usuarios con rol admin o polizas: acceso al Panel de Administración
 * - Botón de cerrar sesión
 */
export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // No mostrar navbar en la página de login
  if (pathname === '/login' || status === 'loading' || !session) {
    return null;
  }

  const isAdmin = isAdminRole(session.user.role);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo / Título */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Sistema de Vacaciones
              </h1>
            </div>
          </div>

          {/* Navegación central */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            <button
              onClick={() => router.push('/mis-vacaciones')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/mis-vacaciones')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Mis Vacaciones
            </button>

            <button
              onClick={() => router.push('/solicitar-vacaciones')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/solicitar-vacaciones')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Solicitar Vacaciones
            </button>

            <button
              onClick={() => router.push('/calendario')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/calendario')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Calendario
            </button>

            <button
              onClick={() => router.push('/festivos')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/festivos')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Festivos
            </button>

            {/* Links de admin solo para roles admin y polizas */}
            {isAdmin && (
              <>
                <button
                  onClick={() => router.push('/admin/vacaciones')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/admin/vacaciones')
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                  }`}
                >
                  Panel Admin
                </button>
                <button
                  onClick={() => router.push('/admin/usuarios')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/admin/usuarios')
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                  }`}
                >
                  Usuarios
                </button>
              </>
            )}
          </div>

          {/* Usuario y cerrar sesión */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex sm:items-center sm:space-x-2">
              <span className="text-sm text-gray-700">
                {session.user.name || session.user.email}
              </span>
              {isAdmin && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Admin
                </span>
              )}
            </div>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Navegación móvil */}
        <div className="sm:hidden pb-3 space-y-1">
          <button
            onClick={() => router.push('/mis-vacaciones')}
            className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
              isActive('/mis-vacaciones')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Mis Vacaciones
          </button>

          <button
            onClick={() => router.push('/solicitar-vacaciones')}
            className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
              isActive('/solicitar-vacaciones')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Solicitar Vacaciones
          </button>

          <button
            onClick={() => router.push('/calendario')}
            className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
              isActive('/calendario')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Calendario
          </button>

          <button
            onClick={() => router.push('/festivos')}
            className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
              isActive('/festivos')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Festivos
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => router.push('/admin/vacaciones')}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/admin/vacaciones')
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                Panel Admin
              </button>
              <button
                onClick={() => router.push('/admin/usuarios')}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/admin/usuarios')
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                Usuarios
              </button>
            </>
          )}

          {/* Info de usuario en móvil */}
          <div className="px-3 py-2 text-sm text-gray-700 border-t border-gray-200 mt-2 pt-2">
            <div>{session.user.name || session.user.email}</div>
            {isAdmin && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                Admin
              </span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

