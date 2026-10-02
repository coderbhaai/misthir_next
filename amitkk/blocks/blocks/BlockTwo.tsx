import { GenericBlockProps } from "@amitkk/blocks/types";

export default function BlockTwo({ data = [], detail }: GenericBlockProps) {
    if (!data || data.length === 0) return null;

    return (
        <section className="relative py-16 md:py-24 bg-slate-50 overflow-hidden">
            <div className="container">
                {detail && (
                    <div className="text-center mb-5">
                        {detail.heading && ( <h3>{detail.heading}</h3> )}
                        {detail.content_1 && ( <div className="text-center text-gray-600 text-sm md:text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: detail.content_1.replace(/<\/?blockquote>/g, "") }} /> )}
                    </div>
                )}
                <div className="grid grid-cols-12 gap-6">
                    {data.map((i, index) => (
                        <div key={index} className="col-span-12 md:col-span-4 group relative bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 p-3 md:p-5">
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-600/5 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                            <div className="relative flex flex-col h-full z-10">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold tracking-widest text-blue-600 uppercase">Key Area</span>
                                    <span className="text-4xl font-bold text-gray-200 group-hover:text-blue-200 transition-colors duration-500">{String(index + 1).padStart(2, "0</span>
                                </div>
                                <h3 className="text-base md:text-lg lg:text-xl font-medium text-gray-200 group-hover:text-blue-700 transition-colors duration-300 mb-1 md:mb-2">{i.heading}</h3>
                                <div className="text-sm md:text-base text-gray-600 leading-relaxed mt-auto" dangerouslySetInnerHTML={{ __html: i.content || "" }}/>
                                <div className="h-1 w-12 bg-blue-600 rounded-full scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500  mt-2 md:mt-3"/>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}