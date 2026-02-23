'use client';
import React, { useState } from 'react';
import pb from '../../../lib/pocketbase';
import Navbar from '../../../components/Navbar';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    try {
      await pb.collection('users').create({ email, password, passwordConfirm: confirmPassword });
      await pb.collection('users').authWithPassword(email, password);
      // establecer cookie para que el middleware detecte la sesión
      document.cookie = 'pb_auth=1; Path=/; Max-Age=2592000';
      window.location.href = '/';
    } catch (err) {
      setError('No se pudo registrar');
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-gray-900/70 backdrop-blur border border-gray-700 rounded-xl p-6 sm:p-8 shadow-xl">
            <h1 className="text-2xl font-bold text-white mb-6">Crear cuenta</h1>
            {error && <div className="text-red-400 text-sm mb-3">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none" />
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirmar contraseña" className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none" />
              <button type="submit" className="w-full rounded-md bg-gray-800 hover:bg-gray-700 px-3 py-2 text-white">Registrar</button>
            </form>
          </div>
        </div>
      </main>
  );
}
