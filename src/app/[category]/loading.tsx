import React from 'react'
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'

const loading = () => {
  return (
    <div className="container mx-auto !px-0 py-12">
      <div className="mb-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="relative group">
              <div className="aspect-[9/13] relative">
                <Skeleton height="100%" className="object-cover rounded-xl" style={{ borderRadius: "12px" }} />
              </div>
              <div className="mt-2">
                <Skeleton className="text-lg font-semibold" />
                <Skeleton className="text-md text-gray-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="relative group">
              <div className="aspect-[9/13] relative">
                <Skeleton height="100%" className="object-cover rounded-xl" style={{ borderRadius: "12px" }} />
              </div>
              <div className="mt-2">
                <Skeleton className="text-lg font-semibold" />
                <Skeleton className="text-md text-gray-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default loading;