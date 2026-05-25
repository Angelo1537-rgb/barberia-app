// app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Settings, LogOut, Menu, X } from 'lucide-react';
import { crearSupabaseBrowser } from '@/lib/supabase/cliente';
import CalendarioCitas from '@/components/admin/CalendarioCitas';
import GestionServicios from '@/components/admin/GestionServicios';
import GestionHorario from '@/components/admin/GestionHorario';

type Seccion = 'calendario' | 'servicios' | 'horario';

export default function PanelAdmin() {
  const router = useRouter();
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('calendario');
  const [usuarioEmail, setUsuarioEmail] = useState<string>('');
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    const supabase = crearSupabaseBrowser();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setUsuarioEmail(data.user.email);
      }
    });
  }, []);

  const handleLogout = async () => {
    const supabase = crearSupabaseBrowser();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-stone-900">💈 Barbería Admin</h1>

          {/* Menu móvil */}
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="md:hidden p-2 hover:bg-stone-100 rounded-lg"
          >
            {menuAbierto ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Usuario + logout (desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-stone-600">{usuarioEmail}</span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>

        {/* Menu móvil expandido */}
        {menuAbierto && (
          <div className="md:hidden border-t border-stone-200 px-4 py-4 space-y-2">
            <button
              onClick={() => {
                setSeccionActiva('calendario');
                setMenuAbierto(false);
              }}
              className={`block w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                seccionActiva === 'calendario'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              📅 Calendario
            </button>
            <button
              onClick={() => {
                setSeccionActiva('servicios');
                setMenuAbierto(false);
              }}
              className={`block w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                seccionActiva === 'servicios'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              ✂️ Servicios
            </button>
            <button
              onClick={() => {
                setSeccionActiva('horario');
                setMenuAbierto(false);
              }}
              className={`block w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                seccionActiva === 'horario'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              ⏰ Horario
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-lg font-medium"
            >
              Salir
            </button>
          </div>
        )}
      </header>

      <div className="flex">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:block w-64 border-r border-stone-200 bg-white min-h-screen">
          <nav className="p-6 space-y-2">
            <button
              onClick={() => setSeccionActiva('calendario')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                seccionActiva === 'calendario'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Calendar className="w-5 h-5" />
              Calendario
            </button>
            <button
              onClick={() => setSeccionActiva('servicios')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                seccionActiva === 'servicios'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Settings className="w-5 h-5" />
              Servicios
            </button>
            <button
              onClick={() => setSeccionActiva('horario')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                seccionActiva === 'horario'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Settings className="w-5 h-5" />
              Horario
            </button>
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg font-medium"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl">
          {seccionActiva === 'calendario' && <CalendarioCitas />}
          {seccionActiva === 'servicios' && <GestionServicios />}
          {seccionActiva === 'horario' && <GestionHorario />}
        </main>
      </div>
    </div>
  );
}
