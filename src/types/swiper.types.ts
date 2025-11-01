import { SwiperClass } from "swiper/react";

export type SwiperContainerType = {
  // Define any props if needed
  children: React.ReactNode;
  breakpoints?: breakpointsType;
  autoplay?: boolean | autoplayType;
  navigation?: boolean | navigationType;
  pagination?: boolean | paginationType;
  loop?: boolean;
  speed?: number;
  grabCursor?: boolean;
  spaceBetween?: number;
  slidesPerView?: number;
  direction?: 'horizontal' | 'vertical';
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  itemCount?: number | null;
};

type navigationType = {
 nextEl: string;
 prevEl: string;
}

type paginationType = {
  clickable?: boolean; 
  enabled?: boolean; 
  type?: 'bullets' | 'fraction' | 'progressbar' | 'custom'; 
  className?: string; 
  position?: 'top' | 'bottom'; 
  renderCustom?: (swiper: SwiperClass, current: number, total: number) => string
}

type breakpointsType = {
  [key: number]: {
    slidesPerView: number;
    spaceBetween?: number;
    slidesPerGroup?: number;
  }
}

type autoplayType = {
  delay: number;
  disableOnInteraction: boolean;
  pauseOnMouseEnter?: boolean;
}