// components/admin/GestionHorario.tsx
'use client';

import { useEffect, useState } from 'react';
import { Loader2, AlertCircle, Save } from 'lucide-react';
import { crearSupabaseBrowser } from '@/lib/supabase/cliente';
import type { HorarioSemanal } from '@/types/database';

const DIAS = [
  { numero: 0, nombre: 'Domingo' },
  { numero: 1, nombre: 'Lunes' },
  { numero: 2, nombre: 'Martes' },
  { numero: 3, nombre: 'Miércoles' },
  { numero: 4, nombre: 'Jueves' },
  { numero: 5, nombre: 'Viernes' },
  { numero: 6, nombre: 'Sábado' },
];

export default function GestionHorario() {
  const [horarios, setHorarios] = useState<HorarioSemanal[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    cargarHorarios();
  }, []);

  const cargarHorarios = async () => {
    setCargando(true);
    const supabase = crearSupabaseBrowser();
    const { data, error: err } = await supabase
      .from('horario_semanal')
      .select('*')
      .order('dia_semana', { ascending: true });

    if (!err && data) {
      setHorarios(data);
    }
    setCargando(false);
  };

  const actualizarHorario = (index: number, campo: string, valor: any) => {
    const nuevos = [...horarios];
    if (campo === 'abierto') {
      nuevos[index] = { ...nuevos[index], abierto: valor };
      if (!valor) {
        nuevos[index] = {
          ...nuevos[index],
          hora_apertura: null,
          hora_cierre: null,
          hora_pausa_ini: null,
          hora_pausa_fin: null,
        };
      }
    } else {
      nuevos[index] = { ...nuevos[index], [campo]: valor };
    }
    setHorarios(nuevos);
  };

  const handleGuardar = async () => {
    setGuardando(true);
    setError(null);
    setExito(false);

    const supabase = crearSupabaseBrowser();

    try {
      for (const horario of horarios) {
        const { error: err } = await supabase
          .from('horario_semanal')
          .update({
            abierto: horario.abierto,
            hora_apertura: horario.abierto ? horario.hora_apertura : null,
            hora_cierre: horario.abierto ? horario.hora_cierre : null,
            hora_pausa_ini: horario.abierto ? horario.hora_pausa_ini : null,
            hora_pausa_fin: horario.abierto ? horario.hora_pausa_fin : null,
          })
          .eq('dia_semana', horario.dia_semana);

        if (err) throw err;
      }

      setExito(true);
      setTimeout(() => setExito(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-stone-900 mb-6">⏰ Horario de atención</h2>

      {error && (
        <div className="flex gap-2 bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {exito && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 mb-6">
          ✅ Horario guardado correctamente
        </div>
      )}

      <div className="space-y-4">
        {horarios.map((horario, index) => {
          const dia = DIAS.find((d) => d.numero === horario.dia_semana)!;
          return (
            <div
              key={horario.dia_semana}
              className="bg-white border border-stone-200 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stone-900">{dia.nombre}</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={horario.abierto}
                    onChange={(e) => actualizarHorario(index, 'abierto', e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300"
                  />
                  <span className="text-sm text-stone-600">
                    {horario.abierto ? 'Abierto' : 'Cerrado'}
                  </span>
                </label>
              </div>

              {horario.abierto && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-stone-600 mb-1">
                      Abre
                    </label>
                    <input
                      type="time"
                      value={horario.hora_apertura ?? '10:00'}
                      onChange={(e) =>
                        actualizarHorario(index, 'hora_apertura', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-stone-600 mb-1">
                      Cierra
                    </label>
                    <input
                      type="time"
                      value={horario.hora_cierre ?? '20:00'}
                      onChange={(e) =>
                        actualizarHorario(index, 'hora_cierre', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-stone-600 mb-1">
                      Pausa ini
                    </label>
                    <input
                      type="time"
                      value={horario.hora_pausa_ini ?? '14:00'}
                      onChange={(e) =>
                        actualizarHorario(index, 'hora_pausa_ini', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-stone-600 mb-1">
                      Pausa fin
                    </label>
                    <input
                      type="time"
                      value={horario.hora_pausa_fin ?? '16:00'}
                      onChange={(e) =>
                        actualizarHorario(index, 'hora_pausa_fin', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleGuardar}
        disabled={guardando}
        className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white rounded-lg font-medium transition-colors"
      >
        {guardando ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            Guardar cambios
          </>
        )}
      </button>
    </div>
  );
}
