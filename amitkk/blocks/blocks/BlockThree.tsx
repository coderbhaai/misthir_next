import Image from "next/image";
import { BlockDetailProps, GenericBlock } from "@amitkk/basic/types/blocks";
import { useGlobalModal } from "contexts/GlobalModalContext";
import { Button } from '@amitkk/components/button/button';
import { MediaProps } from "lib/models/types";

interface BlockThreeProps {
    data: GenericBlock;
    buttonText?: string;
    detail: BlockDetailProps;
    module_id?: string;
}

export default function BlockThree({ data, buttonText = "Consult Specialists", detail, module_id = "" }: BlockThreeProps) {
    if (!data) return null;

    const { openGlobalModal } = useGlobalModal();
    const hasImage = Boolean((data?.media_id as unknown as MediaProps)?.path);

    return (
        <section className="relative py-16 md:py-24 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50"/>
            <div className="container relative z-10">
                <div className="grid grid-cols-12 gap-8 items-center">
                    <div className="col-span-12 lg:col-span-6 relative">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                            {hasImage && (
                                <Image unoptimized src={(data?.media_id as unknown as MediaProps)?.path || "/images/static/default.jpg"} alt={(data?.media_id as unknown as MediaProps)?.alt || data.heading || "treatment image"} width={900} height={700} className="w-full h-full object-cover"/>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"/>
                        </div>
                    </div>
                    <div className="col-span-12 lg:col-span-6">
                        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-6 md:p-10 shadow-xl">                            
                            <span className="inline-block text-xs tracking-widest uppercase font-semibold text-blue-600 mb-2">Treatment Overview</span>
                            <h2 className="text-xl md:text-2xl xl:text-3xl font-semibold text-gray-900 mb-4 leading-snug">{data.heading}</h2>

                            <div className="text-sm md:text-base text-gray-600 leading-relaxed space-y-4" dangerouslySetInnerHTML={{ __html: data.content || "" }}/>

                            <div className="mt-6 md:mt-8 flex flex-wrap gap-4">
                                <Button onClick={() => openGlobalModal("lead", { module_id }) }>{buttonText}</Button>
                                <button onClick={() => openGlobalModal("lead", { module_id }) } className="px-6 py-3 rounded-full border border-blue-600 text-blue-600 text-sm font-medium hover:bg-blue-600 hover:text-white transition-all duration-300">Get Cost Estimate</button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}


