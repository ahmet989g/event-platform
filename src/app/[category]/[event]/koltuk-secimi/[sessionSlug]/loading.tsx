import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function Loading() {
  return (
    <div className="container mx-auto !px-0 py-8">
      {/* Breadcrumb Skeleton */}
      <div className="mb-8">
        <Skeleton width={400} height={16} className="mb-4" />
        <Skeleton width={200} height={32} />
      </div>

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Sol: Kategori Listesi Skeleton */}
        <div className="space-y-6">
          <div>
            <Skeleton width={200} height={24} className="mb-2" />
            <Skeleton width={300} height={16} />
          </div>

          {/* Category Cards */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-xl bg-white p-6 dark:bg-gray-900"
              >
                <div className="flex items-center gap-6">
                  <div className="flex-1">
                    <Skeleton width={150} height={20} className="mb-2" />
                    <Skeleton width={250} height={14} className="mb-3" />
                    <Skeleton width={100} height={28} />
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton width={44} height={44} borderRadius={8} />
                    <Skeleton width={56} height={44} borderRadius={8} />
                    <Skeleton width={44} height={44} borderRadius={8} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sağ: Sepet Özeti Skeleton */}
        <div className="lg:sticky lg:top-8 lg:h-fit">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <Skeleton width={150} height={24} className="mb-6" />

            {/* Event Info */}
            <div className="mb-6 flex gap-4">
              <Skeleton width={56} height={80} borderRadius={8} />
              <div className="flex-1">
                <Skeleton height={20} className="mb-2" />
                <Skeleton width={200} height={14} />
              </div>
            </div>

            {/* Timer */}
            <div className="mb-6 flex justify-center">
              <Skeleton width={280} height={56} borderRadius={28} />
            </div>

            {/* Divider */}
            <div className="mb-6 border-t border-gray-200 dark:border-gray-800" />

            {/* Empty State */}
            <div className="mb-6 py-6 text-center">
              <Skeleton
                width={64}
                height={64}
                borderRadius={32}
                className="mx-auto mb-3"
              />
              <Skeleton width={150} height={14} className="mx-auto" />
            </div>

            {/* Divider */}
            <div className="mb-6 border-t border-gray-200 dark:border-gray-800" />

            {/* Total */}
            <div className="mb-6 flex items-center justify-between">
              <Skeleton width={80} height={24} />
              <Skeleton width={120} height={32} />
            </div>

            {/* Button */}
            <Skeleton height={48} borderRadius={8} />
          </div>
        </div>
      </div>
    </div>
  );
}