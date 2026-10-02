"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

const destinations = [
    {
        country: "India",
        city: "New Delhi, Mumbai, Chennai, Bangalore",
        flag: "images/static/flags/india.svg",
        desc: "Globally trusted for advanced surgeries, oncology, transplants & cardiac care with world-leading specialists."
    },
    {
        country: "Turkey",
        city: "Istanbul, Ankara",
        flag: "images/static/flags/turkey.svg",
        desc: "Renowned for cosmetic procedures, eye treatments, orthopedics, and premium medical hospitality."
    },
    {
        country: "Thailand",
        city: "Bangkok, Phuket",
        flag: "images/static/flags/thailand.svg",
        desc: "Exceptional patient experience and cutting-edge facilities for elective surgeries & wellness treatments."
    },
    {
        country: "UAE",
        city: "Dubai, Abu Dhabi",
        flag: "images/static/flags/uae.svg",
        desc: "High-precision medical technology, luxury care experience, and top-tier specialized consultants."
    },
    {
        country: "Singapore",
        city: "Singapore City",
        flag: "images/static/flags/singapore.svg",
        desc: "World-leading medical standards and research-backed care for complex and critical illnesses."
    },
];

export default function GlobalPresence() {
    return (
        <div className="container py-10 md:py-16">
            <div className="text-center max-w-3xl mx-auto mb-10">
                <div className="text-xs md:text-sm font-semibold tracking-wider bg-action text-white inline-block rounded px-3 md:px-6 py-1 mb-2">GLOBAL PRESENCE</div>
                <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium text-action">Top Medical Destinations</h2>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed mt-3">Access carefully curated medical tourism hubs known for clinical excellence, affordable care, and world-renowned specialists.</p>
            </div>

                <Swiper modules={[Autoplay, FreeMode]} freeMode={true} loop={true} slidesPerView={1.5} spaceBetween={2} autoplay={{ delay: 0, disableOnInteraction: false }} speed={6500} breakpoints={{ 640: { slidesPerView: 2.5 }, 1024: { slidesPerView: 3.5 }, 1280: { slidesPerView: 4.5 },}} className="w-full">
                    {destinations.map((item) => (
                        <SwiperSlide key={item.country}>
                            <div className="h-full pb-6 md:pb-12">
                                <div className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 p-2 md:p-3 m-2 md:m-3">
                                    <div className="flex items-center space-x-3">
                                        <img src={item.flag} alt={item.country} className="w-6 md:w-8 h-6 md:h-8 object-cover shadow-xl" />
                                        <div>
                                            <h3 className="text-sm md:text-base font-medium">{item.country}</h3>
                                            <p className="text-xs md:text-sm text-gray-500">{item.city}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed mt-1 md:mt-2">{item.desc}</p>
                                </div>
                            </div>
                        </SwiperSlide>

                    ))}
                </Swiper>
        </div>
    );
}
