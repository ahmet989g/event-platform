import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
      <div className="container mx-auto !px-0 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Hakkında */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">EventPlatform</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Türkiye&apos;nin en kapsamlı etkinlik biletleme platformu.
            </p>
          </div>

          {/* Kategoriler */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Kategoriler</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/tiyatro"
                  className="text-gray-600 hover:text-primary-600 dark:text-gray-400"
                >
                  Tiyatro
                </Link>
              </li>
              <li>
                <Link
                  href="/konser"
                  className="text-gray-600 hover:text-primary-600 dark:text-gray-400"
                >
                  Konser
                </Link>
              </li>
              <li>
                <Link
                  href="/spor"
                  className="text-gray-600 hover:text-primary-600 dark:text-gray-400"
                >
                  Spor
                </Link>
              </li>
            </ul>
          </div>

          {/* Kurumsal */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Kurumsal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/hakkimizda"
                  className="text-gray-600 hover:text-primary-600 dark:text-gray-400"
                >
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link
                  href="/iletisim"
                  className="text-gray-600 hover:text-primary-600 dark:text-gray-400"
                >
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Yardım */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Yardım</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/sss"
                  className="text-gray-600 hover:text-primary-600 dark:text-gray-400"
                >
                  Sıkça Sorulan Sorular
                </Link>
              </li>
              <li>
                <Link
                  href="/iptal-iade"
                  className="text-gray-600 hover:text-primary-600 dark:text-gray-400"
                >
                  İptal ve İade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-600 dark:border-gray-800 dark:text-gray-400">
          ©  EventPlatform. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}