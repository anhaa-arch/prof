'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { SEARCH_WORKS } from '@/graphql/queries';
import Link from 'next/link';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, loading } = useQuery(SEARCH_WORKS, {
    variables: {
      query: searchQuery,
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
                />
                <button type="submit" className="btn btn-primary">
                  Хайх
                </button>
              </div>
            </div>
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

