'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_MY_WORKS } from '@/graphql/queries';
import { isAuthenticated } from '@/lib/auth';
import Link from 'next/link';

export default function WorksPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const { data, loading, refetch } = useQuery(GET_MY_WORKS, {
    variables: { page, size: pageSize },
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

  const totalPages = Math.ceil((data?.myWorks?.total || 0) / pageSize);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Миний бүтээлүүд
            </h1>
            <div className="flex space-x-3">
              <Link href="/works/new" className="btn btn-primary">
                + Шинэ бүтээл
              </Link>
              <Link href="/dashboard" className="btn btn-secondary">
                Буцах
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="card">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Нийт: {data?.myWorks?.total || 0} бүтээл
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {data?.myWorks?.data?.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="mt-4 text-gray-500">Бүтээл байхгүй байна</p>
                  <Link
                    href="/works/new"
                    className="mt-4 inline-block btn btn-primary"
                  >
                    Эхний бүтээлээ нэмэх
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
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
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Үйлдэл
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {data?.myWorks?.data?.map((work: any) => (
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
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <Link
                              href={`/works/${work.id}`}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              Дэлгэрэнгүй
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    Өмнөх
                  </button>
                  <span className="text-sm text-gray-700">
                    Хуудас {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    Дараах
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

