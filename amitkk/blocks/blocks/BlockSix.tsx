import ResponsiveImage from "@amitkk/components/ui/ResponsiveImage";
import { BlockDetailProps, GenericBlock } from "@amitkk/basic/types/blocks";

interface BlockSixProps { 
    data: GenericBlock[];
    detail: BlockDetailProps;
}

export default function BlockSix({ data, detail }: BlockSixProps) {
    if (!data || data.length === 0) return null;

    return (
        <section className="py-16 md:py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {detail?.heading && <h2 className="text-center text-xl md:text-2xl xl:text-3xl font-normal text-gray-900 leading-snug mb-3 md:mb-5 lg:mb-10">{detail.heading}</h2>}
                <div className="grid grid-cols-12 gap-6">
                    {data.map((i) => {
                        return (
                            <div key={String(i._id)} className="col-span-12 sm:col-span-6 lg:col-span-4">
                                <div className="group relative h-64 rounded-xl overflow-hidden bg-gray-200">
                                <ResponsiveImage media={i.media_id}/>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                                <div className="absolute bottom-0 p-5">
                                    <h4 className="text-white text-sm md:text-base font-thin">{i.heading}</h4>
                                </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
