const TREATMENTS = [
    { title: "Cardiology", description: "Diagnosis and treatment of heart-related conditions and diseases.", icon: "cardiology.svg", url: "/treatment/cardiology" },
    { title: "Orthopaedics", description: "Bone, joint, spine and musculoskeletal system treatments.", icon: "orthopaedics.svg", url: "/treatment/orthopaedics" },
    { title: "Neurology", description: "Brain, spinal cord and nervous system disorder treatments.", icon: "neurology.svg", url: "/treatment/neurology" },
    { title: "Oncology", description: "Cancer diagnosis, treatment and long-term care.", icon: "oncology.svg", url: "/treatment/oncology" },
    { title: "Gastroenterology", description: "Digestive system, liver and gastrointestinal treatments.", icon: "gastroenterology.svg", url: "/treatment/gastroenterology" },
    { title: "Urology", description: "Kidney, bladder and urinary tract treatments.", icon: "urology.svg", url: "/treatment/urology" },
    { title: "Nephrology", description: "Kidney disease diagnosis and advanced care solutions.", icon: "nephrology.svg", url: "/treatment/nephrology" },
    { title: "Pulmonology", description: "Lung, respiratory and breathing disorder treatments.", icon: "pulmonology.svg", url: "/treatment/pulmonology" },
];
export default function HomeOurTreatments() {
    return (
        <section className="bg-gray py-6 md:py-12">
            <div className="container mx-auto px-4">
                <div className="text-center mb-6 lg:mb-12">
                    <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium mb-2">Comprehensive Multi-Specialty Care</h2>
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed mt-3">We support all treatments, from elective procedures to life-changing surgeries.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pb-3 md:pb-6">
                    {TREATMENTS.map((t, index) => (
                        <a key={index} href={t.url} className="flex items-center gap-4 bg-white rounded-lg p-6 h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary">
                            <img src={`/images/icons/treatments/${t.icon}`} alt={t.title} className="w-12 h-12 shrink-0" />
                            <div>
                                <h3 className="text-base md:text-lg lg:text-xl font-medium mb-1">{t.title}</h3>
                                <p className="text-sm md:text-base text-gray-600 line-clamp-2">{t.description}</p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
