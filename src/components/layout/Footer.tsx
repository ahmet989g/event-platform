"use client";
import Link from "next/link";
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const hideFooter = pathname.includes('koltuk-secimi');
  if (hideFooter) return null;
  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
      <div className="container mx-auto !px-0 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Hakkında */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">EventPlatform</h3>
            <p className="text-sm">
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
                  className="hover:text-primary"
                >
                  Tiyatro
                </Link>
              </li>
              <li>
                <Link
                  href="/konser"
                  className="hover:text-primary"
                >
                  Konser
                </Link>
              </li>
              <li>
                <Link
                  href="/spor"
                  className="hover:text-primary"
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
                  className="hover:text-primary"
                >
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link
                  href="/iletisim"
                  className="hover:text-primary"
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
                  className="hover:text-primary"
                >
                  Sıkça Sorulan Sorular
                </Link>
              </li>
              <li>
                <Link
                  href="/iptal-iade"
                  className="hover:text-primary"
                >
                  İptal ve İade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm dark:border-gray-800">
          ©  EventPlatform. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}