/**
 * Event Not Found Page
 * Event bulunamadığında gösterilen sayfa
 */

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-gray-100 p-6 dark:bg-gray-800">
              <svg
                className="h-16 w-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Başlık */}
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            Etkinlik Bulunamadı
          </h1>

          {/* Açıklama */}
          <p className="mb-8 text-lg">
            Aradığınız etkinlik mevcut değil veya kaldırılmış olabilir.
          </p>

          {/* Butonlar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Ana Sayfaya Dön
            </Link>
            <Link
              href="/tiyatro"
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Tiyatro Etkinlikleri
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}