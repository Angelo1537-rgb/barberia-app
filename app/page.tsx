// PÁGINA 1: Catálogo de servicios
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scissors, Clock, Euro, ArrowRight } from 'lucide-react';
import { obtenerServicios, formatearPrecio, formatearDuracion } from '@/lib/reservas';
import type { Servicio } from '@/types/database';

export default function PaginaInicio() {
  const router = useRouter();
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    obtenerServicios()
      .then(setServicios)
      .catch((err) => {
        console.error(err);
        setError('No se han podido cargar los servicios. Comprueba la conexión.');
      })
      .finally(() => setCargando(false));
  }, []);

  const seleccionarServicio = (servicioId: string) => {
    // Guardamos el servicio elegido en sessionStorage para el siguiente paso
    sessionStorage.setItem('servicioId', servicioId);
    router.push('/reservar');
  };

  const nombreBarberia = process.env.NEXT_PUBLIC_NOMBRE_BARBERIA ?? 'Barbería';

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      {/* Cabecera */}
      <header className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-900 rounded-2xl mb-4">
          <Scissors className="w-8 h-8 text-white" strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-2">
          {nombreBarberia}
        </h1>
        <p className="text-stone-600">
          Reserva tu cita en menos de 1 minuto
        </p>
      </header>

      {/* Listado de servicios */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-4 px-2">
          Elige un servicio
        </h2>

        {cargando && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-white rounded-2xl border border-stone-200 animate-pulse"
              />
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 text-sm">
            {error}
          </div>
        )}

        {!cargando && !error && (
          <div className="space-y-3">
            {servicios.map((servicio) => (
              <button
                key={servicio.id}
                onClick={() => seleccionarServicio(servicio.id)}
                className="group w-full text-left bg-white hover:bg-stone-50 rounded-2xl border border-stone-200 hover:border-stone-300 p-5 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-stone-900 mb-1">
                      {servicio.nombre}
                    </h3>
                    {servicio.descripcion && (
                      <p className="text-sm text-stone-600 mb-3">
                        {servicio.descripcion}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-stone-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatearDuracion(servicio.duracion_min)}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-stone-900">
                        <Euro className="w-4 h-4" />
                        {formatearPrecio(servicio.precio_eur).replace('€', '').trim()}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-stone-900 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <footer className="text-center mt-10 text-xs text-stone-500">
        💈 Sistema de reservas online
      </footer>
    </main>
  );
}
