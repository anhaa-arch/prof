'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_ME, GET_MY_WORKS, GET_MY_TOTAL_CREDITS, GET_MY_CREDITS_BREAKDOWN } from '@/graphql/queries';
import { clearAuthTokens, isAuthenticated } from '@/lib/auth';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [currentYear] = useState(new Date().getFullYear());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
  }, [router]);

  const { data: meData, loading: meLoading } = useQuery(GET_ME, {
    skip: !mounted,
    onCompleted: (data) => {
      // Store user data in localStorage
      if (data?.me && typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(data.me));
      }
    },
    onError: (error) => {
      console.error('GET_ME error:', error);
      // If unauthorized, redirect to login
      if (error.message.includes('Unauthorized')) {
        clearAuthTokens();
        router.push('/login');
      }
    },
  });
  const { data: worksData, loading: worksLoading } = useQuery(GET_MY_WORKS, {
    variables: { page: 1, size: 5 },
    skip: !mounted,
  });
  const { data: creditsData } = useQuery(GET_MY_TOTAL_CREDITS, {
    variables: { year: currentYear },
    skip: !mounted,
  });
  const { data: breakdownData } = useQuery(GET_MY_CREDITS_BREAKDOWN, {
    variables: { year: currentYear },
    skip: !mounted,
  });

  const handleLogout = async () => {
    clearAuthTokens();
    
    // Clear Apollo cache
    const { cache } = await import('@/lib/apollo-wrapper');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    } else {
      router.push('/login');
    }
  };

  // Prevent hydration mismatch by showing loading on server-side
  if (!mounted || meLoading || !meData?.me) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Уншиж байна...</p>
        </div>
      </div>
    );
  }

  const user = meData.me;
  const isESH = user.role === 'ESH' || user.role === 'ADMIN';

  // Get dashboard title based on user role
  const getDashboardTitle = () => {
    switch (user.role) {
      case 'ADMIN':
        return 'Админы хянах самбар';
      case 'ESH':
        return 'ЭША хянах самбар';
      case 'PROFESSOR':
      case 'ASSOC_PROF':
      case 'SENIOR_LECTURER':
      case 'LECTURER':
        return 'Багшийн хянах самбар';
      case 'TRAINEE':
        return 'Дадлагажигчийн хянах самбар';
      default:
        return 'Хянах самбар';
    }
  };

  // Get welcome message based on user role
  const getWelcomeMessage = () => {
    switch (user.role) {
      case 'ADMIN':
        return 'Системийн бүх модулиудад хандах эрхтэй';
      case 'ESH':
        return 'Бүтээл баталгаажуулах эрхтэй';
      case 'PROFESSOR':
        return 'Профессор багш';
      case 'ASSOC_PROF':
        return 'Дэд профессор багш';
      case 'SENIOR_LECTURER':
        return 'Ахлах багш';
      case 'LECTURER':
        return 'Багш';
      case 'TRAINEE':
        return 'Дадлагажигч багш';
      default:
        return user.role;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {getDashboardTitle()}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {user.fullName} · {getWelcomeMessage()}
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
        <nav className="mb-8 flex flex-wrap gap-3">
          <Link href="/dashboard" className="btn btn-primary">
            🏠 Хянах самбар
          </Link>
          
          {/* Багш нарын цэс */}
          {(user.role === 'PROFESSOR' || 
            user.role === 'ASSOC_PROF' || 
            user.role === 'SENIOR_LECTURER' || 
            user.role === 'LECTURER' || 
            user.role === 'TRAINEE') && (
            <>
              <Link href="/works" className="btn btn-secondary">
                📝 Миний бүтээлүүд
              </Link>
              <Link href="/credits" className="btn btn-secondary">
                ⭐ Миний кредит
              </Link>
              <Link href="/reports" className="btn btn-secondary">
                📊 Миний тайлан
              </Link>
            </>
          )}
          
          {/* Admin/ESH цэс */}
          {isESH && (
            <>
              <Link href="/verification" className="btn btn-secondary bg-yellow-100 hover:bg-yellow-200 text-yellow-900 border-yellow-300">
                ✅ Баталгаажуулалт
              </Link>
              <Link href="/works" className="btn btn-secondary">
                📋 Бүх бүтээл
              </Link>
              <Link href="/reports" className="btn btn-secondary">
                📈 Бүх тайлан
              </Link>
            </>
          )}
          
          {/* Бүгдэд харагдах */}
          <Link href="/search" className="btn btn-secondary">
            🔍 Хайх
          </Link>
        </nav>

        {/* Stats - Багш нарын статистик */}
        {!isESH && (
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
        )}

        {/* Stats - Admin/ESH статистик */}
        {isESH && (
          <div className="mb-8">
            <div className="card bg-yellow-50 border-yellow-200">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl">⚠️</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Баталгаажуулалтын алба
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Та бүтээл баталгаажуулах эрхтэй. "Баталгаажуулалт" хуудас руу орж илгээгдсэн бүтээлүүдийг шалгана уу.
                  </p>
                  <div className="mt-3">
                    <Link 
                      href="/verification" 
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-900 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      Баталгаажуулалт руу очих →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent works */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {isESH ? 'Системийн бүтээлүүд' : 'Миний сүүлийн бүтээлүүд'}
            </h2>
            {!isESH && (
              <Link href="/works/new" className="btn btn-primary text-sm">
                + Шинэ бүтээл
              </Link>
            )}
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

