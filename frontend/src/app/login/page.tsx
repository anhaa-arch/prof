'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useApolloClient } from '@apollo/client';
import { LOGIN } from '@/graphql/queries';
import { setAuthTokens } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const apolloClient = useApolloClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [login, { loading }] = useMutation(LOGIN, {
    onCompleted: async (data) => {
      // Clear Apollo cache before setting new user
      await apolloClient.clearStore();
      
      // Only store tokens, not user data
      setAuthTokens(data.login.accessToken, data.login.refreshToken);
      
      // Clear any old user data from localStorage
      localStorage.removeItem('user');
      
      // Navigate to dashboard
      router.push('/dashboard');
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login({
        variables: {
          email,
          password,
        },
      });
    } catch (err) {
      // Error handled by onError
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Нэвтрэх
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            University Research & Credit Management System
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                И-мэйл хаяг
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                placeholder="И-мэйл хаяг"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Нууц үг
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                placeholder="Нууц үг"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
            </button>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p className="mt-4">Анхдагч нэвтрэх мэдээлэл:</p>
            <p className="mt-1 font-mono text-xs">
              admin@university.edu / Admin123!
            </p>
            <p className="mt-1 font-mono text-xs">
              dorj.professor@university.edu / Prof123!
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

