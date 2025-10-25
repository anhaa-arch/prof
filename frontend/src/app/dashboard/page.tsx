'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_ME, GET_MY_WORKS, GET_MY_TOTAL_CREDITS, GET_MY_CREDITS_BREAKDOWN } from '@/graphql/queries';
import { getUser, clearAuthTokens, isAuthenticated } from '@/lib/auth';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [currentYear] = useState(new Date().getFullYear());
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    setUser(getUser());
  }, [router]);

  const { data: meData } = useQuery(GET_ME);
  const { data: worksData, loading: worksLoading } = useQuery(GET_MY_WORKS, {
    variables: { page: 1, size: 5 },
  });
  const { data: creditsData } = useQuery(GET_MY_TOTAL_CREDITS, {
    variables: { year: currentYear },
  });
  const { data: breakdownData } = useQuery(GET_MY_CREDITS_BREAKDOWN, {
    variables: { year: currentYear },
  });

  const handleLogout = () => {
    clearAuthTokens();
    router.push('/login');
  };

  // Prevent hydration mismatch by showing loading on server-side
  if (!mounted || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Уншиж байна...</p>
        </div>
      </div>
    );
  }

  const isESH = user.role === 'ESH' || user.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Хянах самбар
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {meData?.me?.fullName} ({meData?.me?.role})
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
            >
              Гарах
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation */}
        <nav className="mb-8 flex space-x-4">
          <Link href="/dashboard" className="btn btn-primary">
            Хянах самбар
          </Link>
          <Link href="/works" className="btn btn-secondary">
            Миний бүтээлүүд
          </Link>
          <Link href="/credits" className="btn btn-secondary">
            Кредитүүд
          </Link>
          <Link href="/reports" className="btn btn-secondary">
            Тайлан
          </Link>
          {isESH && (
            <Link href="/verification" className="btn btn-secondary">
              Баталгаажуулалт
            </Link>
          )}
          <Link href="/search" className="btn btn-secondary">
            Хайх
          </Link>
        </nav>

        {/* Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500">
              Нийт бүтээл
            </h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {worksData?.myWorks?.total || 0}
            </p>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-gray-500">
              {currentYear} оны кредит
            </h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">
              {creditsData?.myTotalCredits?.toFixed(2) || '0.00'}
            </p>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-gray-500">
              Өндөр импакттай
            </h3>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {((breakdownData?.myCreditsBreakdown?.byIndex?.SCI || 0) +
                (breakdownData?.myCreditsBreakdown?.byIndex?.SCOPUS || 0)).toFixed(2)}
            </p>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-gray-500">
              Локал
            </h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {breakdownData?.myCreditsBreakdown?.byIndex?.LOCAL || 0}
            </p>
          </div>
        </div>

        {/* Recent works */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Сүүлийн бүтээлүүд
            </h2>
            <Link href="/works/new" className="btn btn-primary text-sm">
              + Шинэ бүтээл
            </Link>
          </div>

          {worksLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="overflow-hidden">
              {worksData?.myWorks?.data?.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  Бүтээл байхгүй байна
                </p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Гарчиг
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Төрөл
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Индекс
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Он
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Статус
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {worksData?.myWorks?.data?.map((work: any) => (
                      <tr key={work.id}>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <Link
                            href={`/works/${work.id}`}
                            className="font-medium hover:text-primary-600"
                          >
                            {work.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {work.type}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {work.journalIndex || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {work.year}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              work.status === 'PUBLISHED'
                                ? 'bg-green-100 text-green-800'
                                : work.status === 'VERIFIED'
                                ? 'bg-blue-100 text-blue-800'
                                : work.status === 'SUBMITTED'
                                ? 'bg-yellow-100 text-yellow-800'
                                : work.status === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {work.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

