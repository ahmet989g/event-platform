"use client"
import { FC, useMemo, useState } from 'react'

import { Swiper, type SwiperClass } from 'swiper/react';
// import Swiper core and required modules
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import { SwiperContainerType } from '@/types/swiper.types';



const SwiperContainer: FC<SwiperContainerType> = ({
  children,
  breakpoints,
  autoplay = true,
  navigation = true,
  pagination = true,
  loop = true,
  speed = 500,
  grabCursor = true,
  spaceBetween = 20,
  slidesPerView,
  direction = 'horizontal',
  onMouseEnter,
  onMouseLeave,
  itemCount = null
}) => {
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const paginationConfig = useMemo(() => {
    if (typeof pagination === 'object' && pagination.type === 'custom') {
      return false;
    }

    if (typeof pagination === 'object') {
      return pagination;
    }

    return pagination || false;
  }, [pagination]);

  return (
    <section>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        breakpoints={breakpoints}
        autoplay={autoplay}
        navigation={navigation}
        pagination={paginationConfig}
        loop={loop}
        speed={speed}
        grabCursor={grabCursor}
        spaceBetween={spaceBetween}
        slidesPerView={slidesPerView}
        direction={direction}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onSwiper={(onSwiper: SwiperClass) => setSwiper(onSwiper)}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
      >
        {children}
        {itemCount && typeof pagination === 'object' && pagination.type === 'custom' && swiper && (
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: itemCount }).map((_, i) => (
              <span
                key={i}
                className={`block h-2 rounded-full transition-all duration-500 ${i === activeIndex
                  ? "w-8 bg-primary opacity-100"
                  : "w-3 bg-primary/40 opacity-50 hover:opacity-80"
                  }`}
              />
            ))}
          </div>
        )}
      </Swiper>
    </section>
  )
}

export default SwiperContainer;