import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-4xl font-bold mb-4">Kategori Bulunamadı</h1>
      <p className="text-gray-600 mb-8">Aradığınız kategori mevcut değil.</p>
      <Link href="/" className="text-primary hover:underline">
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}