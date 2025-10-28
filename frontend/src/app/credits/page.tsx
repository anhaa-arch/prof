'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_MY_CREDITS } from '@/graphql/queries';
import { isAuthenticated } from '@/lib/auth';
import Link from 'next/link';

export default function CreditsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const { data, loading } = useQuery(GET_MY_CREDITS, {
    variables: { page: 1, size: 50 },
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Миний кредитүүд
            </h1>
            <Link href="/dashboard" className="btn btn-secondary">
              Буцах
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="card">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Нийт: {data?.myCredits?.total || 0} кредит
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {data?.myCredits?.data?.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Кредит байхгүй байна</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Огноо
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Бүтээл
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Кредит
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Дэлгэрэнгүй
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {data?.myCredits?.data?.map((credit: any) => (
                        <tr key={credit.id}>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(credit.calculatedAt).toLocaleDateString('mn-MN')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {credit.work?.title || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-primary-600">
                            {Number(credit.creditValue).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {credit.calculationDetail ? (
                              <div className="space-y-1">
                                <div>Суурь кр: {credit.calculationDetail.baseCredit}</div>
                                <div>Оролцоо: {credit.calculationDetail.contributionPercent}%</div>
                              </div>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}