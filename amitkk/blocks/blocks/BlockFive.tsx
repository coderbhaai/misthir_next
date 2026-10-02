import { useGlobalModal } from "contexts/GlobalModalContext";
import { BlockDetailProps, GenericBlock } from "@amitkk/basic/types/blocks";

interface BlockFiveProps { data: GenericBlock; detail: BlockDetailProps; module_id?: string; }

export default function BlockFive({ data, detail, module_id = "" }: BlockFiveProps) {
    if (!data) return null;

    const { openGlobalModal } = useGlobalModal();
    const backgroundImage = data.media_id?.path;

    return (
        <section className="relative py-20 md:py-28">
            {backgroundImage && <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${backgroundImage})` }} />}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-900/70 to-indigo-900/90" />
            <div className="relative mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-xl md:text-2xl xl:text-3xl font-normal text-white leading-snug mb-1 md:mb-2">{data.heading}</h2>
                {data.content && <div className="text-sm md:text-base lg:text-lg text-blue-100 leading-relaxed mx-auto mb-3 md:mb-5 lg:mb-10" dangerouslySetInnerHTML={{ __html: data.content }} />}
                <button onClick={() => openGlobalModal("lead", { module_id }) } className="text-sm md:text-base font-semibold text-blue-900 inline-flex items-center justify-center rounded-md bg-white hover:bg-blue-100 transition-colors duration-300 ease-in-out px-8 md:px-12 py-2 md:py-3 ">
                Contact Us
                </button>
            </div>
        </section>
    );
}
