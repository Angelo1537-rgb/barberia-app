// components/admin/GestionServicios.tsx
'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { crearSupabaseBrowser } from '@/lib/supabase/cliente';
import { formatearPrecio, formatearDuracion } from '@/lib/reservas';
import type { Servicio } from '@/types/database';

export default function GestionServicios() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostraFormulario, setMostraFormulario] = useState(false);
  const [editando, setEditando] = useState<Servicio | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [duracion, setDuracion] = useState('30');
  const [precio, setPrecio] = useState('15');

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    setCargando(true);
    const supabase = crearSupabaseBrowser();
    const { data, error: err } = await supabase
      .from('servicios')
      .select('*')
      .order('orden', { ascending: true });

    if (!err) {
      setServicios(data ?? []);
    }
    setCargando(false);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nombre.trim() || !duracion || !precio) {
      setError('Rellena todos los campos obligatorios');
      return;
    }

    const supabase = crearSupabaseBrowser();

    try {
      if (editando) {
        // Actualizar
        const { error: err } = await supabase
          .from('servicios')
          .update({
            nombre: nombre.trim(),
            descripcion: descripcion.trim() || null,
            duracion_min: parseInt(duracion),
            precio_eur: parseFloat(precio),
          })
          .eq('id', editando.id);

        if (err) throw err;
      } else {
        // Crear
        const { error: err } = await supabase.from('servicios').insert({
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
          duracion_min: parseInt(duracion),
          precio_eur: parseFloat(precio),
          orden: servicios.length,
        });

        if (err) throw err;
      }

      // Limpiar y recargar
      setNombre('');
      setDescripcion('');
      setDuracion('30');
      setPrecio('15');
      setEditando(null);
      setMostraFormulario(false);
      await cargarServicios();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar este servicio?')) return;

    const supabase = crearSupabaseBrowser();
    const { error: err } = await supabase
      .from('servicios')
      .delete()
      .eq('id', id);

    if (!err) {
      await cargarServicios();
    }
  };

  const handleEditar = (servicio: Servicio) => {
    setEditando(servicio);
    setNombre(servicio.nombre);
    setDescripcion(servicio.descripcion ?? '');
    setDuracion(servicio.duracion_min.toString());
    setPrecio(servicio.precio_eur.toString());
    setMostraFormulario(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-stone-900">✂️ Servicios</h2>
        <button
          onClick={() => {
            setEditando(null);
            setNombre('');
            setDescripcion('');
            setDuracion('30');
            setPrecio('15');
            setMostraFormulario(!mostraFormulario);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo servicio
        </button>
      </div>

      {/* Formulario */}
      {mostraFormulario && (
        <form
          onSubmit={handleGuardar}
          className="bg-white border border-stone-200 rounded-xl p-6 mb-6 space-y-4"
        >
          {error && (
            <div className="flex gap-2 bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Corte de pelo"
              className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción opcional"
              rows={2}
              className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Duración (min) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                min="5"
                max="480"
                step="5"
                className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Precio (€) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                min="0"
                step="0.50"
                className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-medium transition-colors"
            >
              {editando ? 'Actualizar' : 'Crear'}
            </button>
            <button
              type="button"
              onClick={() => setMostraFormulario(false)}
              className="flex-1 px-4 py-2 border border-stone-200 hover:bg-stone-50 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista */}
      {cargando ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
        </div>
      ) : (
        <div className="grid gap-3">
          {servicios.map((servicio) => (
            <div
              key={servicio.id}
              className="bg-white border border-stone-200 rounded-xl p-4 flex items-start justify-between"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-stone-900">{servicio.nombre}</h3>
                {servicio.descripcion && (
                  <p className="text-sm text-stone-600 mt-1">{servicio.descripcion}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-stone-500 mt-2">
                  <span>{formatearDuracion(servicio.duracion_min)}</span>
                  <span>•</span>
                  <span className="font-semibold text-stone-900">
                    {formatearPrecio(servicio.precio_eur)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditar(servicio)}
                  className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-5 h-5 text-stone-600" />
                </button>
                <button
                  onClick={() => handleEliminar(servicio.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
