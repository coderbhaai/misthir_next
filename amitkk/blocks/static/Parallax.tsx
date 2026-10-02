'use client';

import LeadModal from '@amitkk/basic/admin/lead/LeadModal';
import { useState } from 'react';

export default function Parallax() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <section className="relative w-full h-[250px] md:h-[450px] bg-fixed bg-center bg-cover flex flex-col items-center justify-center text-center" style={{ backgroundImage: "url('/images/static/parallax/home-parallax.jpg')" }}>
                <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium text-white leading-tight drop-shadow-lg mb-3 md:mb-5">World-Class Cancer Treatment Without Borders</h1>
                <p className="text-sm md:text-base text-white leading-relaxed mb-6 md:mb-12 max-w-3xl px-4">Access internationally renowned oncologists, advanced therapies and seamless medical travel support.</p>
                <button onClick={() => setOpen(true)} className="btn">Start Your Treatment Journey</button>
            </section>
            <LeadModal open={open} onClose={() => setOpen(false)} module_id={null}/>
        </>
    );
}
