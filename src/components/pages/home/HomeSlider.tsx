"use client"
import SwiperContainer from '@/components/swiper/SwiperContainer'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { SwiperClass, SwiperSlide } from 'swiper/react'

const SliderItems = [
  { id: 1, content: 'Spor Banner', link: '/spor', text: 'Spor Etkinlikleri', img: `${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL}spor-banner-3.jpg` },
  { id: 2, content: 'Tiyatro Banner', link: '/tiyatro', text: 'Tiyatro Etkinlikleri', img: `${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL}tiyatro-banner-2.jpg` },
  { id: 3, content: 'Konser Banner', link: '/konser', text: 'Konser Etkinlikleri', img: `${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL}konser-banner-1.jpg` },
]

const HomeSlider = () => {
  const pagination = {
    clickable: true,
    type: 'custom' as const,
    renderCustom: (swiper: SwiperClass, current: number, total: number) => {
      // Pagination bullet formatında olsun fakat kare şeklinde olsun ve geçişlerde akarmış gibi bir animasyon olsun
      let bullets = '';
      for (let i = 1; i <= total; i++) {
        if (i === current) {
          bullets += `<span class="inline-block w-6 h-2 mx-1 bg-white rounded-full opacity-100 transition-all duration-500"></span>`;
        } else {
          bullets += `<span class="inline-block w-4 h-2 mx-1 bg-white rounded-full opacity-50 hover:opacity-75 transition-all duration-500"></span>`;
        }
      }
      return bullets;
    }
  };
  return (
    <SwiperContainer
      navigation={false}
      pagination={pagination}
      itemCount={SliderItems.length}
    >
      {
        SliderItems.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="relative aspect-[15/6]">
              <Image
                src={item.img}
                alt={item.content}
                fill quality={100}
                loading="lazy"
                className="rounded-xl"
              />
              <div className="absolute inset-0 flex flex-col justify-center items-center text-white bg-black/20 bg-opacity-20 rounded-xl">
                <h2 className="text-2xl font-semibold">{item.text}</h2>
                <Link href={item.link} className="mt-2 px-4 py-2 bg-primary-500 rounded-full">Detaylar</Link>
              </div>
            </div>
          </SwiperSlide>
        ))
      }
    </SwiperContainer >
  )
}

export default HomeSlider