'use client';

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

// Import Swiper styles (core + autoplay)
import 'swiper/css';
import 'swiper/css/autoplay';

const trajets = [
  {
    nom: 'Sarah J.',
    poste: 'CPGE → EMI',
    image: '/images/sarah.jpeg',
    quote:
      '"The grid helped me bypass the standard confusion. Found exactly the prep materials I needed without the fluff."',
  },
  {
    nom: 'Omar T.',
    poste: 'LYCÉE → INSA',
    image: '/images/omar.jpeg',
    quote:
      '"Total visibility on the application process. The peer reviews were crucial. Avoided major pitfalls."',
  },
  {
    nom: 'Mehdi R.',
    poste: 'SELF-TAUGHT → 1337',
    image: '/images/mehdi.jpeg',
    quote: '"Raw data. No BS. Kharita gave me the coordinates, I just had to execute the plan."',
  },
  {
    nom: 'Ayoub T.',
    poste: 'CPGE → INPT',
    image: '/images/ayoub.jpeg',
    quote: '"Bac Sciences avec 15.16. Ingénieur d\'État en Systèmes Embarqués."',
  },
  {
    nom: 'Fatihi H.',
    poste: '1337 → SOFTWARE ENGINEER',
    image: '/images/fatihi.jpeg',
    quote: '"Formation intensive, projets concrets. Aujourd\'hui software engineer chez Fatihi."',
  },
];

export default function TrajetCarousel() {
  return (
    <Swiper
      modules={[Autoplay]}
      spaceBetween={24} // gap between slides
      slidesPerView={1}
      loop={true}
      autoplay={{
        delay: 5000,
        disableOnInteraction: false, // keeps autoplay running after user interaction
      }}
      breakpoints={{
        640: { slidesPerView: 1 },   // mobile
        768: { slidesPerView: 2 },   // tablet
        1024: { slidesPerView: 3 },  // desktop
      }}
      className="w-full"
    >
      {trajets.map((trajet, i) => (
        <SwiperSlide key={i}>
          <div className="border-2 border-(--color-text) shadow-[4px_4px_0_0_var(--color-text)] bg-(--color-surface) h-full flex flex-col">
            {/* header */}
            <div className="bg-(--color-text) text-(--color-bg) px-4 py-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide">
                {trajet.poste}
              </span>
              <span className="text-(--color-accent-soft)">{'</>'}</span>
            </div>

            {/* body */}
            <div className="p-6 flex flex-col flex-1">
              <div className="relative w-16 h-16 rounded-full border-2 border-(--color-text) mb-4 overflow-hidden">
                <Image
                  src={trajet.image}
                  alt={trajet.nom}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-black uppercase mb-4">{trajet.nom}</h3>
              <p className="text-sm border-l-2 border-(--color-text) pl-3 italic flex-1">
                {trajet.quote}
              </p>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}