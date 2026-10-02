"use client";

import React from "react";

const services = [
    {
        title: "Treatment Planning",
        desc: "Expert assessment, second opinions, and customized treatment roadmap aligned to your medical needs."
    },
    {
        title: "Hospital & Doctor Coordination",
        desc: "Access internationally accredited hospitals and top specialists with seamless appointment management."
    },
    {
        title: "Travel & Visa Assistance",
        desc: "End-to-end support including medical visa guidance, flight planning, and documentation assistance."
    },
    {
        title: "Accommodation & Local Support",
        desc: "Curated stay options, airport pickup, and dedicated care coordinators throughout your medical journey."
    },
    {
        title: "Interpreter & Assistance Services",
        desc: "Multilingual support ensuring clear communication between patients, families, and clinicians."
    },
    {
        title: "Post-Treatment Follow-Up",
        desc: "Continuous recovery monitoring, remote consultations, and support for long-term care planning."
    },
];

export default function ServicesOffered() {
    return (
        <div className="container py-10 md:py-16">
            <div className="text-center mb-10 max-w-3xl mx-auto">
                <div className="text-xs md:text-sm font-semibold tracking-wider bg-action text-white inline-block rounded px-3 md:px-6 py-1 mb-2">OUR SERVICES</div>
                <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium text-action">Healing Beyond Borders</h2>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed mt-3">MedTreeva bridges you to world-class healthcare, coordinating every step — from medical evaluation and travel to treatment, recovery, and return home — so you focus solely on healing.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {services.map((s) => (
                <div key={s.title} className="group bg-white rounded-xl shadow-md transition-all duration-700 hover:bg-primary hover:text-white hover:-translate-y-1 cursor-pointer p-2 md:p-3 lg:p-5">
                    <h3 className="text-sm md:text-base lg:text-lg xl:text-xl font-medium group-hover:text-white mb-2">{s.title}</h3>
                    <p className="text-sm md:text-base text-gray-600 group-hover:text-white leading-relaxed">{s.desc}</p>
                </div>
                ))}
            </div>
        </div>
    );
}
