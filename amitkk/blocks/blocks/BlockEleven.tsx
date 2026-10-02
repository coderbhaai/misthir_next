"use client";

import { useState, useEffect } from "react";
import ResponsiveImage from "@amitkk/components/ui/ResponsiveImage";
import { useGlobalModal } from "contexts/GlobalModalContext";
import { Button } from "@amitkk/components/button/button";
import { GenericBlockProps } from "@amitkk/blocks/types";

export default function BlockEleven({data = [], module_id = ""}: GenericBlockProps) {
    if (!data || data.length === 0) { return null; }

    const { openGlobalModal } = useGlobalModal();
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (!data?.length) return;

        const timer = setInterval(() => {
        setIndex((prev) => (prev + 1) % data.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [data]);

    return (
        <div className="relative w-full h-[300px] overflow-hidden">
        {data.map((slide, i) => (
            <div key={String(slide._id)} className={`absolute inset-0 transition-opacity duration-1000 ${i === index ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
            <div className="absolute inset-0 w-full h-full">
                <ResponsiveImage media={slide.media_id} className="h-full w-full object-cover" priority={i === 0}/>
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.6)_20%,rgba(0,0,0,0.2)_80%)]"/>
                <div className="relative z-20 h-full flex flex-col justify-center text-white max-w-full md:max-w-[85%] px-3 md:px-8">
                <h3 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium text-center md:text-left mb-2 md:mb-3">{slide.heading || "Untitled Block"}</h3>
                {slide.content && (
                    <div className="text-sm md:text-base text-white/85 text-center md:text-left mb-3 md:mb-5 lg:mb-10" dangerouslySetInnerHTML={{__html: slide.content}}/>
                )}

                <Button onClick={() => openGlobalModal("lead", { module_id })} className="w-fit px-6 md:px-8 py-3 md:py-4 mt-2 md:mt-4 text-sm md:text-base font-semibold tracking-wide rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/30 transition-all duration-300">Consult Specialists</Button>
                </div>
            </div>
            </div>
        ))}
        </div>
    );
}