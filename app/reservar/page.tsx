// PÁGINAS 2 + 3: Elegir fecha/hora y rellenar datos
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import {
  obtenerServicios,
  obtenerHuecosDisponibles,
  reservarCita,
  formatearPrecio,
  formatearDuracion,
  formatearFechaLarga,
  formatearFechaCorta,
  formatearHora,
} from '@/lib/reservas';
import type { Servicio, Hueco } from '@/types/database';

type Paso = 'fecha-hora' | 'datos';

export default function PaginaReserva() {
  const router = useRouter();
  const [servicio, setServicio] = useState<Servicio | null>(null);
  const [paso, setPaso] = useState<Paso>('fecha-hora');

  // Estado fecha/hora
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null);
  const [huecos, setHuecos] = useState<Hueco[]>([]);
  const [huecoSeleccionado, setHuecoSeleccionado] = useState<Hueco | null>(null);
  const [cargandoHuecos, setCargandoHuecos] = useState(false);

  // Estado formulario
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [aceptaPolitica, setAceptaPolitica] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  // Cargar servicio desde sessionStorage
  useEffect(() => {
    const servicioId = sessionStorage.getItem('servicioId');
    if (!servicioId) {
      router.push('/');
      return;
    }

    obtenerServicios().then((servicios) => {
      const encontrado = servicios.find((s) => s.id === servicioId);
      if (encontrado) {
        setServicio(encontrado);
      } else {
        router.push('/');
      }
    });
  }, [router]);

  // Cargar huecos cuando cambia la fecha
  useEffect(() => {
    if (!fechaSeleccionada || !servicio) return;

    setCargandoHuecos(true);
    setHuecoSeleccionado(null);
    obtenerHuecosDisponibles(fechaSeleccionada, servicio.id)
      .then(setHuecos)
      .catch((err) => {
        console.error(err);
        setHuecos([]);
      })
      .finally(() => setCargandoHuecos(false));
  }, [fechaSeleccionada, servicio]);

  if (!servicio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  // --- ENVÍO DE RESERVA ---
  const enviarReserva = async () => {
    if (!huecoSeleccionado || !nombre.trim() || !telefono.trim() || !aceptaPolitica) {
      return;
    }
    setEnviando(true);
    setErrorEnvio(null);

    try {
      const resultado = await reservarCita({
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        email: email.trim(),
        servicioId: servicio.id,
        fechaHora: new Date(huecoSeleccionado.hora_inicio),
      });

      // Guardar para mostrar en la página de confirmación
      sessionStorage.setItem('reservaConfirmada', JSON.stringify(resultado));
      sessionStorage.removeItem('servicioId');
      router.push('/confirmacion');
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error desconocido';
      setErrorEnvio(mensaje);
      setEnviando(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      {/* Botón volver */}
      <button
        onClick={() => (paso === 'datos' ? setPaso('fecha-hora') : router.push('/'))}
        className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-4 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>

      {/* Resumen del servicio */}
      <div className="bg-stone-900 text-white rounded-2xl p-5 mb-6">
        <p className="text-xs uppercase tracking-wider text-stone-400 mb-1">
          Servicio seleccionado
        </p>
        <h1 className="text-xl font-bold mb-2">{servicio.nombre}</h1>
        <div className="flex items-center gap-4 text-sm text-stone-300">
          <span>{formatearDuracion(servicio.duracion_min)}</span>
          <span>•</span>
          <span className="font-semibold text-white">
            {formatearPrecio(servicio.precio_eur)}
          </span>
        </div>
      </div>

      {paso === 'fecha-hora' ? (
        <PasoFechaHora
          fechaSeleccionada={fechaSeleccionada}
          setFechaSeleccionada={setFechaSeleccionada}
          huecos={huecos}
          huecoSeleccionado={huecoSeleccionado}
          setHuecoSeleccionado={setHuecoSeleccionado}
          cargandoHuecos={cargandoHuecos}
          onContinuar={() => setPaso('datos')}
        />
      ) : (
        <PasoDatos
          huecoSeleccionado={huecoSeleccionado!}
          nombre={nombre}
          setNombre={setNombre}
          telefono={telefono}
          setTelefono={setTelefono}
          email={email}
          setEmail={setEmail}
          aceptaPolitica={aceptaPolitica}
          setAceptaPolitica={setAceptaPolitica}
          enviando={enviando}
          errorEnvio={errorEnvio}
          onEnviar={enviarReserva}
        />
      )}
    </main>
  );
}

// =============================================
// COMPONENTE: Paso 1 - Fecha y hora
// =============================================
function PasoFechaHora({
  fechaSeleccionada,
  setFechaSeleccionada,
  huecos,
  huecoSeleccionado,
  setHuecoSeleccionado,
  cargandoHuecos,
  onContinuar,
}: {
  fechaSeleccionada: Date | null;
  setFechaSeleccionada: (f: Date) => void;
  huecos: Hueco[];
  huecoSeleccionado: Hueco | null;
  setHuecoSeleccionado: (h: Hueco) => void;
  cargandoHuecos: boolean;
  onContinuar: () => void;
}) {
  // Generar los próximos 14 días para el selector horizontal
  const [diaInicio, setDiaInicio] = useState(0);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const dias = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(d.getDate() + i + diaInicio);
    return d;
  });

  const esMismaFecha = (a: Date | null, b: Date) => {
    if (!a) return false;
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  return (
    <>
      <section className="mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Elige el día
        </h2>

        {/* Navegación de semanas */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setDiaInicio(Math.max(0, diaInicio - 7))}
            disabled={diaInicio === 0}
            className="p-2 rounded-lg hover:bg-stone-100 disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-stone-600">
            {formatearFechaLarga(dias[0]).split(' de ').slice(1).join(' de ')}
          </span>
          <button
            onClick={() => setDiaInicio(Math.min(21, diaInicio + 7))}
            disabled={diaInicio >= 21}
            className="p-2 rounded-lg hover:bg-stone-100 disabled:opacity-30"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Tarjetas de días */}
        <div className="grid grid-cols-7 gap-2">
          {dias.slice(0, 7).map((dia) => {
            const seleccionado = esMismaFecha(fechaSeleccionada, dia);
            return (
              <button
                key={dia.toISOString()}
                onClick={() => setFechaSeleccionada(dia)}
                className={`p-2 rounded-xl text-center transition-all ${
                  seleccionado
                    ? 'bg-stone-900 text-white'
                    : 'bg-white border border-stone-200 hover:border-stone-400'
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider opacity-70">
                  {new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(dia)}
                </div>
                <div className="text-lg font-bold mt-0.5">{dia.getDate()}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Huecos disponibles */}
      {fechaSeleccionada && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {formatearFechaCorta(fechaSeleccionada)}
          </h2>

          {cargandoHuecos ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-stone-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : huecos.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-sm text-center">
              No hay huecos disponibles este día. Prueba otra fecha.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {huecos.map((hueco) => {
                const seleccionado =
                  huecoSeleccionado?.hora_inicio === hueco.hora_inicio;
                return (
                  <button
                    key={hueco.hora_inicio}
                    onClick={() => setHuecoSeleccionado(hueco)}
                    className={`py-3 rounded-xl font-medium transition-all ${
                      seleccionado
                        ? 'bg-stone-900 text-white'
                        : 'bg-white border border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    {formatearHora(hueco.hora_inicio)}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Botón continuar */}
      {huecoSeleccionado && (
        <button
          onClick={onContinuar}
          className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-4 rounded-2xl transition-colors"
        >
          Continuar
        </button>
      )}
    </>
  );
}

// =============================================
// COMPONENTE: Paso 2 - Datos del cliente
// =============================================
function PasoDatos({
  huecoSeleccionado,
  nombre,
  setNombre,
  telefono,
  setTelefono,
  email,
  setEmail,
  aceptaPolitica,
  setAceptaPolitica,
  enviando,
  errorEnvio,
  onEnviar,
}: {
  huecoSeleccionado: Hueco;
  nombre: string;
  setNombre: (s: string) => void;
  telefono: string;
  setTelefono: (s: string) => void;
  email: string;
  setEmail: (s: string) => void;
  aceptaPolitica: boolean;
  setAceptaPolitica: (b: boolean) => void;
  enviando: boolean;
  errorEnvio: string | null;
  onEnviar: () => void;
}) {
  const valido =
    nombre.trim().length >= 2 &&
    telefono.trim().length >= 9 &&
    aceptaPolitica;

  return (
    <>
      <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-6 text-sm">
        <p className="text-stone-500 text-xs uppercase tracking-wider mb-1">
          Hora seleccionada
        </p>
        <p className="font-semibold text-stone-900">
          {formatearFechaLarga(new Date(huecoSeleccionado.hora_inicio))}
        </p>
        <p className="text-stone-700">
          a las {formatearHora(huecoSeleccionado.hora_inicio)}
        </p>
      </div>

      <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-4">
        Tus datos
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Teléfono <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="612 345 678"
            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
          />
          <p className="text-xs text-stone-500 mt-1">
            Para enviarte la confirmación por WhatsApp
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Email <span className="text-stone-400 font-normal">(opcional)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
          />
        </div>

        <label className="flex items-start gap-3 cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={aceptaPolitica}
            onChange={(e) => setAceptaPolitica(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-stone-300"
          />
          <span className="text-sm text-stone-600">
            Acepto que mis datos se usen para gestionar la cita y enviar
            confirmaciones.
          </span>
        </label>

        {errorEnvio && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-sm">
            {errorEnvio}
          </div>
        )}

        <button
          onClick={onEnviar}
          disabled={!valido || enviando}
          className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
        >
          {enviando ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Reservando...
            </>
          ) : (
            'Confirmar reserva'
          )}
        </button>
      </div>
    </>
  );
}
