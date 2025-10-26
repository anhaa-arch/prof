'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { GET_WORK, SUBMIT_WORK, UPDATE_WORK } from '@/graphql/queries';
import { isAuthenticated } from '@/lib/auth';
import Link from 'next/link';

export default function WorkDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const { data, loading, error, refetch } = useQuery(GET_WORK, {
    variables: { id: params.id },
    skip: !mounted,
  });

  const [submitWork, { loading: submitting }] = useMutation(SUBMIT_WORK, {
    onCompleted: () => {
      alert('Бүтээл амжилттай илгээгдлээ!');
      refetch();
    },
    onError: (error) => {
      alert('Алдаа гарлаа: ' + error.message);
    },
  });

  const [updateWork, { loading: updating }] = useMutation(UPDATE_WORK, {
    onCompleted: () => {
      alert('Бүтээл амжилттай шинэчлэгдлээ!');
      setIsEditing(false);
      refetch();
    },
    onError: (error) => {
      alert('Алдаа гарлаа: ' + error.message);
    },
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Бүтээл уншиж байна...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Алдаа гарлаа</div>
          <p className="text-gray-600">{error.message}</p>
          <Link href="/works" className="mt-4 inline-block btn btn-primary">
            Буцах
          </Link>
        </div>
      </div>
    );
  }

  const work = data?.work;

  if (!work) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">Бүтээл олдсонгүй</div>
          <Link href="/works" className="mt-4 inline-block btn btn-primary">
            Буцах
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmitForVerification = async () => {
    if (confirm('Та энэ бүтээлийг шалгалтанд илгээхдээ итгэлтэй байна уу?')) {
      await submitWork({ variables: { id: params.id } });
    }
  };

  const handleUpdate = async () => {
    await updateWork({
      variables: {
        id: params.id,
        input: editData,
      },
    });
  };

  const handleEditChange = (field: string, value: any) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  };

  const startEditing = () => {
    setEditData({
      title: work.title,
      abstract: work.abstract,
      language: work.language,
      type: work.type,
      journalName: work.journalName,
      journalIndex: work.journalIndex,
      doi: work.doi,
      issn: work.issn,
      volume: work.volume,
      issue: work.issue,
      pages: work.pages,
      year: work.year,
      publishedDate: work.publishedDate,
    });
    setIsEditing(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'VERIFIED':
        return 'bg-blue-100 text-blue-800';
      case 'SUBMITTED':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'Ноорог';
      case 'SUBMITTED':
        return 'Илгээсэн';
      case 'VERIFIED':
        return 'Баталгаажсан';
      case 'REJECTED':
        return 'Татгалзсан';
      case 'PUBLISHED':
        return 'Нийтлэгдсэн';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Бүтээлийн дэлгэрэнгүй
            </h1>
            <Link href="/works" className="btn btn-secondary">
              Буцах
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Status and Actions */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(
                    work.status
                  )}`}
                >
                  {getStatusText(work.status)}
                </span>
              </div>
              <div className="flex space-x-3">
                {work.status === 'DRAFT' && !isEditing && (
                  <>
                    <button onClick={startEditing} className="btn btn-secondary">
                      Засах
                    </button>
                    <button
                      onClick={handleSubmitForVerification}
                      disabled={submitting}
                      className="btn btn-primary"
                    >
                      {submitting ? 'Илгээж байна...' : 'Шалгалтанд илгээх'}
                    </button>
                  </>
                )}
                {isEditing && (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="btn btn-secondary"
                    >
                      Болих
                    </button>
                    <button
                      onClick={handleUpdate}
                      disabled={updating}
                      className="btn btn-primary"
                    >
                      {updating ? 'Хадгалж байна...' : 'Хадгалах'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Үндсэн мэдээлэл
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Гарчиг
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.title || ''}
                    onChange={(e) => handleEditChange('title', e.target.value)}
                    className="input w-full"
                    placeholder="Гарчиг оруулах"
                  />
                ) : (
                  <p className="text-gray-900">{work.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Товч агуулга
                </label>
                {isEditing ? (
                  <textarea
                    value={editData.abstract || ''}
                    onChange={(e) => handleEditChange('abstract', e.target.value)}
                    rows={4}
                    className="input w-full"
                    placeholder="Товч агуулга оруулах"
                  />
                ) : (
                  <p className="text-gray-700">{work.abstract || 'Байхгүй'}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Төрөл
                  </label>
                  {isEditing ? (
                    <select
                      value={editData.type || ''}
                      onChange={(e) => handleEditChange('type', e.target.value)}
                      className="input w-full"
                      aria-label="Төрөл"
                    >
                      <option value="JOURNAL_ARTICLE">Сэтгүүлийн өгүүлэл</option>
                      <option value="CONFERENCE_PAPER">Хурлын өгүүлэл</option>
                      <option value="THESIS">Зэрэг горилох бүтээл</option>
                      <option value="MONOGRAPH">Монографи</option>
                      <option value="PATENT">Патент</option>
                      <option value="TEACHING_MATERIAL">Сургалтын материал</option>
                      <option value="OTHER">Бусад</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{work.type}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Хэл
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.language || ''}
                      onChange={(e) => handleEditChange('language', e.target.value)}
                      className="input w-full"
                      placeholder="Хэл"
                    />
                  ) : (
                    <p className="text-gray-900">{work.language}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Он
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editData.year || ''}
                      onChange={(e) =>
                        handleEditChange('year', parseInt(e.target.value))
                      }
                      className="input w-full"
                      placeholder="Он"
                    />
                  ) : (
                    <p className="text-gray-900">{work.year}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Кредит
                  </label>
                  <p className="text-gray-900">{work.creditBase}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Journal Information */}
          {(work.journalName || isEditing) && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Сэтгүүлийн мэдээлэл
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Сэтгүүлийн нэр
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.journalName || ''}
                      onChange={(e) =>
                        handleEditChange('journalName', e.target.value)
                      }
                      className="input w-full"
                      placeholder="Сэтгүүлийн нэр"
                    />
                  ) : (
                    <p className="text-gray-900">{work.journalName || 'Байхгүй'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Индекс
                  </label>
                  {isEditing ? (
                    <select
                      value={editData.journalIndex || ''}
                      onChange={(e) =>
                        handleEditChange('journalIndex', e.target.value)
                      }
                      className="input w-full"
                      aria-label="Индекс"
                    >
                      <option value="">Сонгох</option>
                      <option value="SCI">SCI</option>
                      <option value="SCIE">SCIE</option>
                      <option value="SSCI">SSCI</option>
                      <option value="SCOPUS">SCOPUS</option>
                      <option value="INDEX_MEDICUS">INDEX MEDICUS</option>
                      <option value="LOCAL">LOCAL</option>
                      <option value="NONE">NONE</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{work.journalIndex || 'Байхгүй'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DOI
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.doi || ''}
                      onChange={(e) => handleEditChange('doi', e.target.value)}
                      className="input w-full"
                      placeholder="DOI"
                    />
                  ) : (
                    <p className="text-gray-900">{work.doi || 'Байхгүй'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ISSN
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.issn || ''}
                      onChange={(e) => handleEditChange('issn', e.target.value)}
                      className="input w-full"
                      placeholder="ISSN"
                    />
                  ) : (
                    <p className="text-gray-900">{work.issn || 'Байхгүй'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Боть
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.volume || ''}
                      onChange={(e) => handleEditChange('volume', e.target.value)}
                      className="input w-full"
                      placeholder="Боть"
                    />
                  ) : (
                    <p className="text-gray-900">{work.volume || 'Байхгүй'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дугаар
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.issue || ''}
                      onChange={(e) => handleEditChange('issue', e.target.value)}
                      className="input w-full"
                      placeholder="Дугаар"
                    />
                  ) : (
                    <p className="text-gray-900">{work.issue || 'Байхгүй'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Хуудас
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.pages || ''}
                      onChange={(e) => handleEditChange('pages', e.target.value)}
                      className="input w-full"
                      placeholder="Хуудас"
                    />
                  ) : (
                    <p className="text-gray-900">{work.pages || 'Байхгүй'}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Authors */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Зохиогчид
            </h2>
            <div className="space-y-3">
              {work.authors?.map((author: any) => (
                <div
                  key={author.id}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {author.order}. {author.authorName}
                      {author.isCorresponding && (
                        <span className="ml-2 text-xs text-blue-600">
                          (Харилцагч зохиогч)
                        </span>
                      )}
                    </p>
                    {author.user && (
                      <p className="text-sm text-gray-500">{author.user.fullName}</p>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">
                    {author.contributionPercent}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Files */}
          {work.files && work.files.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Файлууд</h2>
              <div className="space-y-2">
                {work.files.map((file: any) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{file.fileName}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <span className="text-sm text-gray-600">
                      {new Date(file.uploadedAt).toLocaleDateString('mn-MN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Нэмэлт мэдээлэл
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Үүсгэсэн:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(work.createdAt).toLocaleString('mn-MN')}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Шинэчилсэн:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(work.updatedAt).toLocaleString('mn-MN')}
                </span>
              </div>
              {work.creator && (
                <div>
                  <span className="text-gray-600">Үүсгэгч:</span>
                  <span className="ml-2 text-gray-900">
                    {work.creator.fullName}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

