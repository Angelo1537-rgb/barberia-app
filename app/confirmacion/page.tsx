// PÁGINA 4: Confirmación de la reserva
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Calendar, Clock, Euro, Scissors, Home } from 'lucide-react';
import {
  formatearFechaLarga,
  formatearHora,
  formatearPrecio,
  formatearDuracion,
} from '@/lib/reservas';
import type { ResultadoReserva } from '@/types/database';

export default function PaginaConfirmacion() {
  const router = useRouter();
  const [reserva, setReserva] = useState<ResultadoReserva | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('reservaConfirmada');
    if (!data) {
      router.push('/');
      return;
    }
    setReserva(JSON.parse(data));
  }, [router]);

  if (!reserva) return null;

  const fecha = new Date(reserva.fecha_hora);

  return (
    <main className="mx-auto max-w-xl px-4 py-8 sm:py-16">
      {/* Icono de éxito */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-500">
          <CheckCircle2 className="w-12 h-12 text-emerald-600" strokeWidth={2} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-2">
          ¡Cita confirmada!
        </h1>
        <p className="text-stone-600">
          Te hemos guardado el sitio 💈
        </p>
      </div>

      {/* Detalles */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
        <h2 className="text-xs uppercase tracking-wider text-stone-500 mb-4">
          Detalles de tu cita
        </h2>

        <div className="space-y-4">
          <DetalleItem
            icon={<Scissors className="w-5 h-5" />}
            label="Servicio"
            value={reserva.servicio_nombre}
          />
          <DetalleItem
            icon={<Calendar className="w-5 h-5" />}
            label="Fecha"
            value={formatearFechaLarga(fecha)}
          />
          <DetalleItem
            icon={<Clock className="w-5 h-5" />}
            label="Hora"
            value={`${formatearHora(fecha)} (${formatearDuracion(reserva.duracion_min)})`}
          />
          <DetalleItem
            icon={<Euro className="w-5 h-5" />}
            label="Precio"
            value={formatearPrecio(reserva.precio)}
          />
        </div>
      </div>

      {/* Aviso */}
      <div className="bg-stone-100 rounded-2xl p-4 mb-6 text-sm text-stone-700">
        <p>
          📱 En breve recibirás un mensaje de confirmación. Si necesitas cancelar
          la cita, contacta directamente con la barbería.
        </p>
      </div>

      {/* Botones */}
      <button
        onClick={() => router.push('/')}
        className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
      >
        <Home className="w-5 h-5" />
        Volver al inicio
      </button>
    </main>
  );
}

function DetalleItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-stone-400 mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-stone-500 uppercase tracking-wider">{label}</p>
        <p className="font-semibold text-stone-900">{value}</p>
      </div>
    </div>
  );
}
