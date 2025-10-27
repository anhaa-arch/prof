'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { SEARCH_WORKS_ADVANCED } from '@/graphql/queries';
import Link from 'next/link';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [workType, setWorkType] = useState('');
  const [journalIndex, setJournalIndex] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { data, loading } = useQuery(SEARCH_WORKS_ADVANCED, {
    variables: {
      query: searchQuery,
      authorName: authorName || undefined,
      filters: {
        type: workType || undefined,
        journalIndex: journalIndex || undefined,
        yearFrom: yearFrom ? parseInt(yearFrom) : undefined,
        yearTo: yearTo ? parseInt(yearTo) : undefined,
      },
      page: 1,
      size: 20,
    },
    skip: !searchQuery,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Өгүүлэл хайх
            </h1>
            <Link href="/dashboard" className="btn btn-secondary">
              Буцах
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search form */}
        <div className="card mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Хайлтын үг
              </label>
              <div className="mt-1 flex space-x-2">
                <input
                  type="text"
                  id="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="input flex-1"
                  placeholder="Гарчиг, хураангуй, сэтгүүлийн нэр, DOI..."
                  required
                />
                <button type="submit" className="btn btn-primary">
                  Хайх
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                * Гарчиг, хураангуй, сэтгүүлийн нэр, DOI-гоор хайна
              </p>
            </div>

            {/* Advanced search toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-primary-600 hover:text-primary-800"
              >
                {showAdvanced ? '▼ Нарийвчилсан хайлт хаах' : '▶ Нарийвчилсан хайлт нээх'}
              </button>
            </div>

            {/* Advanced search fields */}
            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label htmlFor="authorName" className="block text-sm font-medium text-gray-700">
                    Зохиогчийн нэр
                  </label>
                  <input
                    type="text"
                    id="authorName"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="input mt-1"
                    placeholder="Зохиогчийн нэрээр хайх"
                  />
                </div>

                <div>
                  <label htmlFor="workType" className="block text-sm font-medium text-gray-700">
                    Төрөл
                  </label>
                  <select
                    id="workType"
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value)}
                    className="input mt-1"
                  >
                    <option value="">Бүгд</option>
                    <option value="ARTICLE">Өгүүлэл</option>
                    <option value="BOOK">Ном</option>
                    <option value="CONFERENCE">Хурлын эмхэтгэл</option>
                    <option value="THESIS">Диссертаци</option>
                    <option value="OTHER">Бусад</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="journalIndex" className="block text-sm font-medium text-gray-700">
                    Сэтгүүлийн индекс
                  </label>
                  <select
                    id="journalIndex"
                    value={journalIndex}
                    onChange={(e) => setJournalIndex(e.target.value)}
                    className="input mt-1"
                  >
                    <option value="">Бүгд</option>
                    <option value="SCI">SCI</option>
                    <option value="SCIE">SCIE</option>
                    <option value="SSCI">SSCI</option>
                    <option value="SCOPUS">SCOPUS</option>
                    <option value="INDEX_MEDICUS">INDEX_MEDICUS</option>
                    <option value="LOCAL">LOCAL</option>
                    <option value="NONE">NONE</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="yearFrom" className="block text-sm font-medium text-gray-700">
                      Он (эхлэх)
                    </label>
                    <input
                      type="number"
                      id="yearFrom"
                      value={yearFrom}
                      onChange={(e) => setYearFrom(e.target.value)}
                      className="input mt-1"
                      placeholder="2020"
                      min="1900"
                      max="2100"
                    />
                  </div>
                  <div>
                    <label htmlFor="yearTo" className="block text-sm font-medium text-gray-700">
                      Он (дуусах)
                    </label>
                    <input
                      type="number"
                      id="yearTo"
                      value={yearTo}
                      onChange={(e) => setYearTo(e.target.value)}
                      className="input mt-1"
                      placeholder="2024"
                      min="1900"
                      max="2100"
                    />
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Results */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        )}

        {searchQuery && !loading && (
          <div className="card">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Хайлтын үр дүн ({data?.searchWorks?.total || 0})
              </h2>
            </div>

            {data?.searchWorks?.data?.length === 0 ? (
              <p className="text-center py-8 text-gray-500">
                Үр дүн олдсонгүй
              </p>
            ) : (
              <div className="space-y-4">
                {data?.searchWorks?.data?.map((work: any) => (
                  <div
                    key={work.id}
                    className="border border-gray-200 rounded-lg p-6 hover:border-primary-300 transition-colors"
                  >
                    <Link href={`/works/${work.id}`}>
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600">
                        {work.title}
                      </h3>
                    </Link>
                    
                    {work.abstract && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {work.abstract}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {work.type}
                      </span>
                      {work.journalIndex && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          {work.journalIndex}
                        </span>
                      )}
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                        {work.year}
                      </span>
                    </div>

                    {work.authors && work.authors.length > 0 && (
                      <div className="mt-3 text-sm text-gray-600">
                        <span className="font-medium">Зохиогчид:</span>{' '}
                        {work.authors
                          .map((a: any) => a.authorName)
                          .join(', ')}
                      </div>
                    )}

                    {work.journalName && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Сэтгүүл:</span> {work.journalName}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!searchQuery && (
          <div className="text-center py-12 text-gray-500">
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
            <p className="mt-4 text-lg">
              Өгүүлэл, бүтээл хайхын тулд дээрх хайлтын талбарт бичнэ үү
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

