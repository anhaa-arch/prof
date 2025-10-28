'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PENDING_VERIFICATIONS, APPROVE_WORK, REJECT_WORK } from '@/graphql/queries';
import { isAuthenticated, hasRole } from '@/lib/auth';
import Link from 'next/link';

export default function VerificationPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated() || !hasRole(['ESH', 'ADMIN'])) {
      router.push('/dashboard');
    }
  }, [router]);

  const { data, loading, refetch } = useQuery(GET_PENDING_VERIFICATIONS, {
    variables: { page: 1, size: 20 },
  });

  const [approveWork] = useMutation(APPROVE_WORK, {
    onCompleted: () => {
      alert('Амжилттай батлагдлаа');
      refetch();
    },
    onError: (error) => {
      alert('Алдаа: ' + error.message);
    },
  });

  const [rejectWork] = useMutation(REJECT_WORK, {
    onCompleted: () => {
      alert('Татгалзлаа');
      refetch();
    },
    onError: (error) => {
      alert('Алдаа: ' + error.message);
    },
  });

  const handleApprove = (workId: string) => {
    if (confirm('Энэ бүтээлийг баталгаажуулах уу?')) {
      const note = prompt('Тэмдэглэл (заавал биш):');
      approveWork({
        variables: {
          input: {
            workId,
            note,
          },
        },
      });
    }
  };

  const handleReject = (workId: string) => {
    if (confirm('Энэ бүтээлийг татгалзах уу?')) {
      const note = prompt('Татгалзсан шалтгаан:');
      if (note) {
        rejectWork({
          variables: {
            input: {
              workId,
              note,
            },
          },
        });
      }
    }
  };

  // Prevent hydration mismatch
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
              Баталгаажуулалт
            </h1>
            <Link href="/dashboard" className="btn btn-secondary">
              Буцах
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Хүлээгдэж буй бүтээлүүд ({data?.pendingVerifications?.total || 0})
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="overflow-hidden">
              {data?.pendingVerifications?.data?.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  Хүлээгдэж буй бүтээл байхгүй
                </p>
              ) : (
                <div className="space-y-4">
                  {data?.pendingVerifications?.data?.map((work: any) => (
                    <div
                      key={work.id}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {work.title}
                          </h3>
                          <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Зохиогч:</span>{' '}
                              {work.creator.fullName}
                            </div>
                            <div>
                              <span className="font-medium">Тэнхим:</span>{' '}
                              {work.creator.department?.name || '-'}
                            </div>
                            <div>
                              <span className="font-medium">Төрөл:</span> {work.type}
                            </div>
                            <div>
                              <span className="font-medium">Индекс:</span>{' '}
                              {work.journalIndex || '-'}
                            </div>
                            <div>
                              <span className="font-medium">Сэтгүүл:</span>{' '}
                              {work.journalName || '-'}
                            </div>
                            <div>
                              <span className="font-medium">Он:</span> {work.year}
                            </div>
                          </div>
                          <div className="mt-3">
                            <span className="font-medium text-sm text-gray-700">
                              Хамтран зохиогчид:
                            </span>
                            <div className="mt-1">
                              {work.authors.map((author: any, idx: number) => (
                                <span
                                  key={idx}
                                  className="inline-block mr-3 text-sm text-gray-600"
                                >
                                  {author.authorName} ({author.contributionPercent}%)
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex space-x-3">
                        <Link
                          href={`/works/${work.id}`}
                          className="btn btn-secondary text-sm"
                        >
                          Дэлгэрэнгүй
                        </Link>
                        <button
                          onClick={() => handleApprove(work.id)}
                          className="btn btn-primary text-sm"
                        >
                          Батлах
                        </button>
                        <button
                          onClick={() => handleReject(work.id)}
                          className="btn btn-danger text-sm"
                        >
                          Татгалзах
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

