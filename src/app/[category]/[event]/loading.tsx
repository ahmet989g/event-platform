/**
 * Event Detail Loading State
 * Skeleton loader
 */

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function Loading() {
  return (
    <div className="container mx-auto !px-0 py-12">
      {/* Event Header Skeleton */}
      <div className="mb-12">
        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
          {/* Poster Skeleton */}
          <div className="aspect-[9/13] overflow-hidden rounded-xl">
            <Skeleton height="100%" style={{ borderRadius: '12px' }} />
          </div>

          {/* Info Skeleton */}
          <div className="flex flex-col justify-center">
            <Skeleton width={120} height={28} className="mb-4" />
            <Skeleton height={48} className="mb-4" />
            <Skeleton height={28} width={300} className="mb-6" />
            <Skeleton count={3} height={24} className="mb-2" />
          </div>
        </div>
      </div>

      {/* Sessions List Skeleton */}
      <div>
        <Skeleton width={150} height={32} className="mb-6" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
            >
              <Skeleton height={48} width={48} className="mb-4" />
              <Skeleton height={24} className="mb-2" />
              <Skeleton height={20} width={200} className="mb-4" />
              <Skeleton height={48} width={48} className="mb-4" />
              <Skeleton height={24} className="mb-2" />
              <Skeleton height={20} width={150} className="mb-6" />
              <Skeleton height={48} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}