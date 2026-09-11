'use client'
import { useTranslations } from "next-intl"
import { useRef, useState } from "react"
import { LuPlus, LuChevronLeft, LuChevronRight, LuCheck, LuX, LuArrowRight, LuTrash } from "react-icons/lu"
import { Swiper, SwiperSlide } from "swiper/react"
import type { Swiper as SwiperType } from "swiper"
import "swiper/css"

const actionButtonStyle = "flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-(--color-text) font-semibold uppercase text-sm cursor-pointer hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)]"

// hardcoded to be deleted later
const pendingUniversities = [
    {
        id: 1,
        name: "Université Mohammed VI Polytechnique",
        description: "Requested integration for 5 engineering programs. Documentation attached.",
    },
    {
        id: 2,
        name: "Université Hassan II de Casablanca",
        description: "New faculty of medicine and pharmacy programs pending review.",
    },
    {
        id: 3,
        name: "Al Akhawayn University",
        description: "Requested update to computer science department curriculum data.",
    },
    {
        id: 4,
        name: "Université Cadi Ayyad",
        description: "Submitted 3 new business school programs for approval.",
    },
    {
        id: 5,
        name: "ENSIAS - Ecole Nationale Supérieure d'Informatique",
        description: "Requested integration of software engineering master's program.",
    },
]

// hardcoded to be deleted later
const allUniversities = [
    {
        id: 1,
        name: "Université Mohammed V de Rabat",
        description: "42 programs across 6 faculties. Active since 2019.",
    },
    {
        id: 2,
        name: "Université Ibn Zohr - Agadir",
        description: "18 programs across 4 faculties. Active since 2020.",
    },
    {
        id: 3,
        name: "EMI - Ecole Mohammadia d'Ingénieurs",
        description: "9 engineering programs. Active since 2018.",
    },
    {
        id: 4,
        name: "Université Abdelmalek Essaadi - Tanger",
        description: "22 programs across 5 faculties. Active since 2021.",
    },
    {
        id: 5,
        name: "INPT - Institut National des Postes et Télécommunications",
        description: "6 engineering programs. Active since 2019.",
    },
]

const UniversitiesTab = () => {
    const t = useTranslations('dashboard')

    const pendingSwiperRef = useRef<SwiperType | null>(null)
    const [pendingIsBeginning, setPendingIsBeginning] = useState<boolean>(true)
    const [pendingIsEnd, setPendingIsEnd] = useState<boolean>(false)
    const [pendingSwiperReady, setPendingSwiperReady] = useState<boolean>(false)
    const allSwiperRef = useRef<SwiperType | null>(null)
    const [allIsBeginning, setAllIsBeginning] = useState<boolean>(true)
    const [allIsEnd, setAllIsEnd] = useState<boolean>(false)
    const [allSwiperReady, setAllSwiperReady] = useState<boolean>(false)

    const handleApproveUniversity = (university_id: number) => {

    }

    const handleRejectUniversity = (university_id: number) => {

    }

    const handleViewUniversity = (university_id: number) => {

    }

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-(--color-text) bg-(--color-surface) p-5">
                    <p className="text-xs md:text-sm font-semibold uppercase tracking-wide">{t('universities.totalUniversities')}</p>
                    <p className="text-xl md:text-4xl font-bold mt-2">128</p>
                </div>
                <div className="border-2 border-(--color-text) bg-(--color-surface) p-5">
                    <p className="text-xs md:text-sm font-semibold uppercase tracking-wide">{t('universities.pendingApproval')}</p>
                    <p className="text-xl md:text-4xl font-bold mt-2">{pendingUniversities.length}</p>
                </div>
            </div>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">{t('universities.pendingUniversities')}</h2>
                    <div className="flex gap-2">
                        <button onClick={() => pendingSwiperRef.current?.slidePrev()}
                            disabled={pendingIsBeginning}
                            className="border-2 border-(--color-text) p-2 cursor-pointer bg-(--color-accent-soft) disabled:cursor-not-allowed disabled:bg-transparent disabled:border-gray-300 disabled:text-gray-300">
                            <LuChevronLeft size={20} className="rtl:rotate-180"/>
                        </button>
                        <button onClick={() => pendingSwiperRef.current?.slideNext()}
                            disabled={pendingIsEnd}
                            className="border-2 border-(--color-text) p-2 cursor-pointer bg-(--color-accent-soft) disabled:cursor-not-allowed disabled:bg-transparent disabled:border-gray-300 disabled:text-gray-300">
                            <LuChevronRight size={20} className="rtl:rotate-180"/>
                        </button>
                    </div>
                </div>
                <Swiper
                    onSwiper={(swiper) => {
                        pendingSwiperRef.current = swiper
                        setPendingIsBeginning(swiper.isBeginning)
                        setPendingIsEnd(swiper.isEnd)
                        setPendingSwiperReady(true)
                    }}
                    className={`transition-opacity duration-200 ${pendingSwiperReady ? 'opacity-100' : 'opacity-0'}`}
                    onSlideChange={(swiper) => {
                        setPendingIsBeginning(swiper.isBeginning)
                        setPendingIsEnd(swiper.isEnd)
                    }}
                    spaceBetween={16}
                    slidesPerView={3}
                    breakpoints={{
                        0: { slidesPerView: 1 },
                        1000: { slidesPerView: 2 },
                        1500: { slidesPerView: 3 },
                        2100: { slidesPerView: 4 }
                    }}>
                    {pendingUniversities.map((uni) => (
                        <SwiperSlide key={uni.id}>
                            <div className="border-2 border-(--color-text) bg-(--color-surface) p-5 h-full flex flex-col">
                                <p className="font-bold text-base md:text-lg">{uni.name}</p>
                                <p className="text-xs md:text-sm mt-1 flex-1">{uni.description}</p>
                                <div className="flex gap-3 mt-4">
                                    <button onClick={() => handleApproveUniversity(uni.id)}
                                        className={`${actionButtonStyle} rtl:flex-row-reverse`}>
                                        <p className="hidden md:block">{t('universities.approve')}</p>
                                        <LuCheck size={16} className="stroke-[3px] md:stroke-2"/>
                                    </button>
                                    <button onClick={() => handleRejectUniversity(uni.id)}
                                        className={`${actionButtonStyle} bg-red-900 text-white rtl:flex-row-reverse`}>
                                        <p className="hidden md:block">{t('universities.reject')}</p>
                                        <LuX size={16} className="stroke-[3px] md:stroke-2"/>
                                    </button>
                                    <button onClick={() => handleViewUniversity(uni.id)}
                                        className={`${actionButtonStyle} bg-[#ccee00] text-black`}>
                                        <p className="hidden md:block">{t('universities.view')}</p>
                                        <LuArrowRight size={16} className="stroke-[3px] md:stroke-2 rtl:rotate-180"/>
                                    </button>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">{t('universities.allUniversities')}</h2>
                    <div className="flex gap-2">
                        <button onClick={() => allSwiperRef.current?.slidePrev()}
                            disabled={allIsBeginning}
                            className="border-2 border-(--color-text) p-2 cursor-pointer bg-(--color-accent-soft) disabled:cursor-not-allowed disabled:bg-transparent disabled:border-gray-300 disabled:text-gray-300">
                            <LuChevronLeft size={20} className="rtl:rotate-180"/>
                        </button>
                        <button onClick={() => allSwiperRef.current?.slideNext()}
                            disabled={allIsEnd}
                            className="border-2 border-(--color-text) p-2 cursor-pointer bg-(--color-accent-soft) disabled:cursor-not-allowed disabled:bg-transparent disabled:border-gray-300 disabled:text-gray-300">
                            <LuChevronRight size={20} className="rtl:rotate-180"/>
                        </button>
                    </div>
                </div>
                <Swiper
                    onSwiper={(swiper) => {
                        allSwiperRef.current = swiper
                        setAllIsBeginning(swiper.isBeginning)
                        setAllIsEnd(swiper.isEnd)
                        setAllSwiperReady(true)
                    }}
                    className={`transition-opacity duration-200 ${allSwiperReady ? 'opacity-100' : 'opacity-0'}`}
                    onSlideChange={(swiper) => {
                        setAllIsBeginning(swiper.isBeginning)
                        setAllIsEnd(swiper.isEnd)
                    }}
                    spaceBetween={16}
                    slidesPerView={3}
                    breakpoints={{
                        0: { slidesPerView: 1 },
                        1000: { slidesPerView: 2 },
                        1500: { slidesPerView: 3 },
                        2100: { slidesPerView: 4 }
                    }}
                >
                    {allUniversities.map((uni) => (
                        <SwiperSlide key={uni.id}>
                            <div className="border-2 border-(--color-text) bg-(--color-surface) p-5 h-full flex flex-col">
                                <p className="font-bold text-base md:text-lg">{uni.name}</p>
                                <p className="text-xs md:text-sm mt-1 flex-1">{uni.description}</p>
                                <div className="flex gap-3 mt-4">
                                    <button onClick={() => handleViewUniversity(uni.id)}
                                        className={`${actionButtonStyle} bg-[#ccee00] text-black`}>
                                        <p className="hidden md:block">{t('universities.view')}</p>
                                        <LuArrowRight size={16} className="stroke-[3px] md:stroke-2 rtl:rotate-180"/>
                                    </button>
                                    <button onClick={() => handleViewUniversity(uni.id)}
                                        className={`${actionButtonStyle} bg-red-900 text-white rtl:flex-row-reverse`}>
                                        <p className="hidden md:block">{t('universities.remove')}</p>
                                        <LuTrash size={16} className="stroke-[3px] md:stroke-2"/>
                                    </button>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
            <button className="fixed bottom-8 right-8 border-2 border-(--color-text) p-3 cursor-pointer bg-(--color-accent-soft) hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)]">
                <LuPlus size={24} />
            </button>
        </div>
    )
}

export default UniversitiesTab