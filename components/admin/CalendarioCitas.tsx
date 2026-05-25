// components/admin/CalendarioCitas.tsx
'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { crearSupabaseBrowser } from '@/lib/supabase/cliente';
import { formatearFechaLarga, formatearHora, formatearPrecio } from '@/lib/reservas';

interface CitaConDetalles {
  id: string;
  fecha_hora: string;
  estado: string;
  cliente: { nombre: string; telefono: string };
  servicio: { nombre: string; precio_eur: number; duracion_min: number };
}

export default function CalendarioCitas() {
  const [citas, setCitas] = useState<CitaConDetalles[]>([]);
  const [cargando, setCargando] = useState(true);
  const [fechaActual, setFechaActual] = useState(new Date());
  const [filtroEstado, setFiltroEstado] = useState<string>('confirmada');

  useEffect(() => {
    cargarCitas();
  }, [fechaActual, filtroEstado]);

  const cargarCitas = async () => {
  setCargando(true);
  const supabase = crearSupabaseBrowser();

  // Obtener citas del mes actual
  const inicio = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
  const fin = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);

  const { data, error } = await supabase
    .from('citas')
    .select(
      `
      id, fecha_hora, estado,
      cliente:cliente_id ( nombre, telefono ),
      servicio:servicio_id ( nombre, precio_eur, duracion_min )
    `
    )
    .eq('estado', filtroEstado)
    .gte('fecha_hora', inicio.toISOString())
    .lte('fecha_hora', fin.toISOString())
    .order('fecha_hora', { ascending: true });

  if (!error && data) {
    setCitas(data as unknown as CitaConDetalles[]);
  }
  setCargando(false);
};

  const cambiarMes = (direccion: 1 | -1) => {
    setFechaActual(
      new Date(
        fechaActual.getFullYear(),
        fechaActual.getMonth() + direccion,
        1
      )
    );
  };

  const nombreMes = new Intl.DateTimeFormat('es-ES', {
    month: 'long',
    year: 'numeric',
  }).format(fechaActual);

  return (
    <div>
      <h2 className="text-2xl font-bold text-stone-900 mb-6">📅 Calendario de citas</h2>

      {/* Navegación de mes */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => cambiarMes(-1)}
          className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold text-stone-900 capitalize">
          {nombreMes}
        </h3>
        <button
          onClick={() => cambiarMes(1)}
          className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Filtro por estado */}
      <div className="flex gap-2 mb-6">
        {(['confirmada', 'completada', 'cancelada'] as const).map((estado) => (
          <button
            key={estado}
            onClick={() => setFiltroEstado(estado)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filtroEstado === estado
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {estado.charAt(0).toUpperCase() + estado.slice(1)}
          </button>
        ))}
      </div>

      {/* Lista de citas */}
      {cargando ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
        </div>
      ) : citas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-stone-500">No hay citas en este período</p>
        </div>
      ) : (
        <div className="space-y-3">
          {citas.map((cita) => (
            <div
              key={cita.id}
              className="bg-white border border-stone-200 rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-stone-900">
                      {cita.cliente.nombre}
                    </p>
                    <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                      {cita.estado}
                    </span>
                  </div>
                  <p className="text-sm text-stone-600 mb-2">
                    {cita.servicio.nombre} • {cita.servicio.duracion_min} min
                  </p>
                  <div className="flex items-center gap-4 text-sm text-stone-500">
                    <span>{formatearFechaLarga(new Date(cita.fecha_hora))}</span>
                    <span>{formatearHora(cita.fecha_hora)}</span>
                    <span className="font-semibold text-stone-900">
                      {formatearPrecio(cita.servicio.precio_eur)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-stone-500 mb-1">Teléfono:</p>
                  <p className="text-sm font-semibold text-stone-900">
                    {cita.cliente.telefono}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
