'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_MY_WORKS, SEARCH_WORKS_ADVANCED } from '@/graphql/queries';
import { isAuthenticated } from '@/lib/auth';
import Link from 'next/link';

function useDebouncedValue<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

const workTypeOptions = [
  { value: '', label: 'Бүх төрөл' },
  { value: 'JOURNAL_ARTICLE', label: 'Өгүүлэл' },
  { value: 'CONFERENCE_PAPER', label: 'Бага хурлын өгүүлэл' },
  { value: 'MONOGRAPH', label: 'Ном/Монограф' },
  { value: 'THESIS', label: 'Диссертаци' },
  { value: 'PATENT', label: 'Патент' },
  { value: 'TEACHING_MATERIAL', label: 'Сургалтын материал' },
  { value: 'OTHER', label: 'Бусад' },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_RANGE = 15;
const yearOptions = Array.from({ length: YEAR_RANGE }, (_, index) => CURRENT_YEAR - index);

export default function WorksPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [queryInput, setQueryInput] = useState('');
  const [authorInput, setAuthorInput] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const debouncedQuery = useDebouncedValue(queryInput, 400);
  const debouncedAuthor = useDebouncedValue(authorInput, 400);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, debouncedAuthor, selectedType, selectedYear]);

  const filters = useMemo(() => {
    const next: Record<string, unknown> = {};
    if (selectedType) {
      next.type = selectedType;
    }
    if (selectedYear) {
      next.year = Number(selectedYear);
    }

    return Object.keys(next).length > 0 ? next : undefined;
  }, [selectedType, selectedYear]);

  const variables = useMemo(() => {
    const trimmedQuery = debouncedQuery.trim();
    const trimmedAuthor = debouncedAuthor.trim();
    const base: Record<string, unknown> = {
      page,
      size: pageSize,
    };

    if (trimmedQuery) {
      base.query = trimmedQuery;
    }
    if (trimmedAuthor) {
      base.authorName = trimmedAuthor;
    }
    if (filters) {
      base.filters = filters;
    }

    return base;
  }, [debouncedAuthor, debouncedQuery, filters, page, pageSize]);

  const hasFilters =
    queryInput.trim().length > 0 ||
    authorInput.trim().length > 0 ||
    Boolean(selectedType) ||
    Boolean(selectedYear);

  const {
    data: myWorksData,
    loading: myWorksLoading,
    error: myWorksError,
  } = useQuery(GET_MY_WORKS, {
    variables: { page, size: pageSize },
    skip: !mounted || hasFilters,
  });

  const {
    data: advancedData,
    loading: advancedLoading,
    error: advancedError,
  } = useQuery(SEARCH_WORKS_ADVANCED, {
    variables,
    skip: !mounted || !hasFilters,
  });

  const loading = hasFilters ? advancedLoading : myWorksLoading;
  const error = hasFilters ? advancedError : myWorksError;
  const connection = hasFilters
    ? advancedData?.searchWorksAdvanced
    : myWorksData?.myWorks;

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

  const works = connection?.data ?? [];
  const totalPages = connection?.totalPages ?? 0;
  const isInitialLoading = loading && !connection;

  const handleResetFilters = () => {
    setQueryInput('');
    setAuthorInput('');
    setSelectedType('');
    setSelectedYear('');
    setPage(1);
  };

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
        <div className="card mb-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <label htmlFor="query" className="block text-sm font-medium text-gray-700">
                Гарчиг/түлхүүр үг
              </label>
              <input
                id="query"
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                className="mt-1 input"
                placeholder="Гарчиг, хураангуй, DOI..."
              />
            </div>

            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                Зохиогч
              </label>
              <input
                id="author"
                type="text"
                value={authorInput}
                onChange={(e) => setAuthorInput(e.target.value)}
                className="mt-1 input"
                placeholder="Жишээ: Б. Сарангэрэл"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Төрөл
              </label>
              <select
                id="type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="mt-1 input"
              >
                {workTypeOptions.map((option) => (
                  <option key={option.value || 'all'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                Он
              </label>
              <select
                id="year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="mt-1 input"
              >
                <option value="">Бүх он</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              Нийт: {connection?.total ?? 0} бүтээл
            </div>
            {hasFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-secondary"
              >
                Шүүлтүүр арилгах
              </button>
            )}
          </div>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error.message}</p>
            </div>
          )}

          {isInitialLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : works.length === 0 ? (
            hasFilters ? (
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p className="mt-4 text-gray-500">
                  Та өгөгдөл шүүх параметрүүдээ өөрчилж дахин оролдоно уу.
                </p>
              </div>
            ) : (
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
            )
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Гарчиг
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Зохиогчид
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
                    {works.map((work: any) => (
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
                          {work.authors && work.authors.length > 0
                            ? work.authors.map((author: any) => author.authorName).join(', ')
                            : '-'}
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

              {loading && connection && (
                <p className="mt-4 text-sm text-gray-500">
                  Хайлт шинэчилж байна...
                </p>
              )}

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
                    Хуудас {connection?.page ?? page} / {totalPages}
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
