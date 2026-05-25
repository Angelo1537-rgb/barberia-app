// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { crearSupabaseBrowser } from '@/lib/supabase/cliente';

export default function PaginaLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError(null);

    try {
      const supabase = crearSupabaseBrowser();
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError(
          loginError.message === 'Invalid login credentials'
            ? 'Email o contraseña incorrectos'
            : loginError.message
        );
        setCargando(false);
        return;
      }

      // Login exitoso, redirigir al panel
      router.push('/admin');
    } catch (err) {
      setError('Error inesperado. Inténtalo de nuevo.');
      setCargando(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-900 rounded-2xl mb-4">
            <Lock className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-1">
            Panel Admin
          </h1>
          <p className="text-stone-600 text-sm">
            Acceso restringido para barberos
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-stone-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                disabled={cargando}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 disabled:bg-stone-50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-stone-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={cargando}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 disabled:bg-stone-50 transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="flex gap-2 bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={cargando || !email || !password}
            className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {cargando ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-stone-500 mt-6">
          Si olvidaste tu contraseña, contacta al administrador
        </p>
      </div>
    </main>
  );
}
