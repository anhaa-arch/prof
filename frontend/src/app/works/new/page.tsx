'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { CREATE_WORK } from '@/graphql/queries';
import { isAuthenticated } from '@/lib/auth';
import Link from 'next/link';

interface Author {
  authorName: string;
  contributionPercent: number;
  order: number;
  isCorresponding: boolean;
}

export default function NewWorkPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [language, setLanguage] = useState('en');
  const [type, setType] = useState('JOURNAL_ARTICLE');
  const [journalName, setJournalName] = useState('');
  const [journalIndex, setJournalIndex] = useState('');
  const [doi, setDoi] = useState('');
  const [issn, setIssn] = useState('');
  const [volume, setVolume] = useState('');
  const [issue, setIssue] = useState('');
  const [pages, setPages] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [authors, setAuthors] = useState<Author[]>([
    { authorName: '', contributionPercent: 100, order: 1, isCorresponding: true },
  ]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const [createWork, { loading }] = useMutation(CREATE_WORK, {
    onCompleted: (data) => {
      setSuccess('Бүтээл амжилттай үүслээ!');
      setTimeout(() => {
        router.push(`/works`);
      }, 1500);
    },
    onError: (error) => {
      console.error('GraphQL Error:', error);
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const gqlError = error.graphQLErrors[0];
        setError(`Алдаа: ${gqlError.message}`);
      } else {
        setError(`Алдаа: ${error.message}`);
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!title.trim()) {
      setError('Гарчиг оруулна уу');
      return;
    }

    const totalPercent = authors.reduce((sum, a) => sum + Number(a.contributionPercent), 0);
    if (Math.abs(totalPercent - 100) > 0.01) {
      setError(`Хувь нийлбэр 100% байх ёстой (одоо: ${totalPercent}%)`);
      return;
    }

    if (authors.some((a) => !a.authorName.trim())) {
      setError('Бүх зохиогчийн нэр оруулна уу');
      return;
    }

    try {
      await createWork({
        variables: {
          input: {
            title,
            abstract: abstract || undefined,
            language,
            type,
            journalName: journalName || undefined,
            journalIndex: journalIndex && journalIndex !== '' ? journalIndex : undefined,
            doi: doi || undefined,
            issn: issn || undefined,
            volume: volume || undefined,
            issue: issue || undefined,
            pages: pages || undefined,
            year,
            authors: authors.map((a) => ({
              authorName: a.authorName,
              contributionPercent: Number(a.contributionPercent),
              order: a.order,
              isCorresponding: a.isCorresponding,
            })),
          },
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const addAuthor = () => {
    setAuthors([
      ...authors,
      {
        authorName: '',
        contributionPercent: 0,
        order: authors.length + 1,
        isCorresponding: false,
      },
    ]);
  };

  const removeAuthor = (index: number) => {
    if (authors.length === 1) {
      setError('Хамгийн багадаа 1 зохиогч байх ёстой');
      return;
    }
    setAuthors(authors.filter((_, i) => i !== index));
  };

  const updateAuthor = (index: number, field: keyof Author, value: any) => {
    const newAuthors = [...authors];
    newAuthors[index] = { ...newAuthors[index], [field]: value };
    setAuthors(newAuthors);
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Шинэ бүтээл нэмэх</h1>
            <Link href="/works" className="btn btn-secondary">
              Буцах
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="card">
          {/* Error/Success messages */}
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Үндсэн мэдээлэл</h2>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Гарчиг <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 input"
                required
                placeholder="Бүтээлийн гарчиг"
              />
            </div>

            <div>
              <label htmlFor="abstract" className="block text-sm font-medium text-gray-700">
                Хураангуй
              </label>
              <textarea
                id="abstract"
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                rows={4}
                className="mt-1 input"
                placeholder="Бүтээлийн хураангуй"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                  Хэл
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="mt-1 input"
                >
                  <option value="en">English</option>
                  <option value="mn">Монгол</option>
                  <option value="ru">Русс</option>
                  <option value="other">Бусад</option>
                </select>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Төрөл <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="mt-1 input"
                  required
                >
                  <option value="JOURNAL_ARTICLE">Өгүүлэл</option>
                  <option value="CONFERENCE_PAPER">Бага хурлын өгүүлэл</option>
                  <option value="MONOGRAPH">Ном/Монограф</option>
                  <option value="THESIS">Диссертаци</option>
                  <option value="PATENT">Патент</option>
                  <option value="TEACHING_MATERIAL">Сургалтын материал</option>
                  <option value="OTHER">Бусад</option>
                </select>
              </div>

              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                  Он <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="year"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="mt-1 input"
                  required
                  min="1900"
                  max="2100"
                />
              </div>

              <div>
                <label htmlFor="journalIndex" className="block text-sm font-medium text-gray-700">
                  Индекс
                </label>
                <select
                  id="journalIndex"
                  value={journalIndex}
                  onChange={(e) => setJournalIndex(e.target.value)}
                  className="mt-1 input"
                >
                  <option value="">Сонгох...</option>
                  <option value="SCI">SCI</option>
                  <option value="SCIE">SCIE</option>
                  <option value="SSCI">SSCI</option>
                  <option value="SCOPUS">SCOPUS</option>
                  <option value="INDEX_MEDICUS">INDEX MEDICUS</option>
                  <option value="LOCAL">LOCAL</option>
                  <option value="NONE">NONE</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="journalName" className="block text-sm font-medium text-gray-700">
                Сэтгүүлийн нэр
              </label>
              <input
                type="text"
                id="journalName"
                value={journalName}
                onChange={(e) => setJournalName(e.target.value)}
                className="mt-1 input"
                placeholder="Journal of Science"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label htmlFor="doi" className="block text-sm font-medium text-gray-700">
                  DOI
                </label>
                <input
                  type="text"
                  id="doi"
                  value={doi}
                  onChange={(e) => setDoi(e.target.value)}
                  className="mt-1 input"
                  placeholder="10.1234/example"
                />
              </div>

              <div>
                <label htmlFor="issn" className="block text-sm font-medium text-gray-700">
                  ISSN
                </label>
                <input
                  type="text"
                  id="issn"
                  value={issn}
                  onChange={(e) => setIssn(e.target.value)}
                  className="mt-1 input"
                  placeholder="1234-5678"
                />
              </div>

              <div>
                <label htmlFor="volume" className="block text-sm font-medium text-gray-700">
                  Volume
                </label>
                <input
                  type="text"
                  id="volume"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  className="mt-1 input"
                  placeholder="15"
                />
              </div>

              <div>
                <label htmlFor="issue" className="block text-sm font-medium text-gray-700">
                  Issue
                </label>
                <input
                  type="text"
                  id="issue"
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  className="mt-1 input"
                  placeholder="3"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="pages" className="block text-sm font-medium text-gray-700">
                  Хуудас
                </label>
                <input
                  type="text"
                  id="pages"
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  className="mt-1 input"
                  placeholder="45-67"
                />
              </div>
            </div>
          </div>

          {/* Authors Section */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Зохиогчид <span className="text-red-500">*</span>
              </h2>
              <button
                type="button"
                onClick={addAuthor}
                className="btn btn-secondary text-sm"
              >
                + Зохиогч нэмэх
              </button>
            </div>

            {authors.map((author, index) => (
              <div key={index} className="rounded-lg border border-gray-200 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Зохиогч #{index + 1}</h3>
                  {authors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAuthor(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Устгах
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Нэр <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={author.authorName}
                      onChange={(e) => updateAuthor(index, 'authorName', e.target.value)}
                      className="mt-1 input"
                      required
                      placeholder="Овог нэр"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Хувь (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={author.contributionPercent}
                      onChange={(e) =>
                        updateAuthor(index, 'contributionPercent', Number(e.target.value))
                      }
                      className="mt-1 input"
                      required
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Эрэмбэ
                    </label>
                    <input
                      type="number"
                      value={author.order}
                      onChange={(e) => updateAuthor(index, 'order', Number(e.target.value))}
                      className="mt-1 input"
                      min="1"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={author.isCorresponding}
                        onChange={(e) =>
                          updateAuthor(index, 'isCorresponding', e.target.checked)
                        }
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Харилцагч зохиогч (Corresponding author)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-md bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                💡 Зөвлөмж: Бүх зохиогчийн хувь нийлбэр 100% байх ёстой
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex items-center justify-end space-x-3">
            <Link href="/works" className="btn btn-secondary">
              Болих
            </Link>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Хадгалж байна...' : 'Бүтээл үүсгэх'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
