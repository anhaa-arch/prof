'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_MY_CREDITS_BREAKDOWN } from '@/graphql/queries';
import { isAuthenticated } from '@/lib/auth';
import Link from 'next/link';

export default function ReportsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const { data, loading } = useQuery(GET_MY_CREDITS_BREAKDOWN, {
    variables: { year },
    skip: !mounted,
  });

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Уншиж байна...</p>
        </div>
      </div>
    );
  }

  const breakdown = data?.myCreditsBreakdown;
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Тайлан
            </h1>
            <Link href="/dashboard" className="btn btn-secondary">
              Буцах
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Year selector */}
        <div className="mb-6">
          <label htmlFor="year" className="block text-sm font-medium text-gray-700">
            Он сонгох
          </label>
          <select
            id="year"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="mt-1 input"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="card">
                <h3 className="text-sm font-medium text-gray-500">
                  Нийт кредит
                </h3>
                <p className="mt-2 text-3xl font-bold text-primary-600">
                  {breakdown?.totalCredits?.toFixed(2) || '0.00'}
                </p>
              </div>

              <div className="card">
                <h3 className="text-sm font-medium text-gray-500">
                  SCI
                </h3>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {breakdown?.byIndex?.SCI || 0}
                </p>
              </div>

              <div className="card">
                <h3 className="text-sm font-medium text-gray-500">
                  SCOPUS
                </h3>
                <p className="mt-2 text-3xl font-bold text-blue-600">
                  {breakdown?.byIndex?.SCOPUS || 0}
                </p>
              </div>

              <div className="card">
                <h3 className="text-sm font-medium text-gray-500">
                  LOCAL
                </h3>
                <p className="mt-2 text-3xl font-bold text-gray-600">
                  {breakdown?.byIndex?.LOCAL || 0}
                </p>
              </div>
            </div>

            {/* Detailed breakdown */}
            <div className="card">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                {year} оны дэлгэрэнгүй
              </h2>

              {breakdown?.credits?.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  {year} онд кредит байхгүй байна
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Бүтээл
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Кредит
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Огноо
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {breakdown?.credits?.map((credit: any) => (
                        <tr key={credit.id}>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {credit.work?.title || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-primary-600">
                            {Number(credit.creditValue).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(credit.calculatedAt).toLocaleDateString('mn-MN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

