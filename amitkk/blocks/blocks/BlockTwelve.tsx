import { BlockDetailProps, GenericBlock } from "@amitkk/basic/types/blocks";
import Image from "next/image";

interface BlockTwelveProps { data: GenericBlock[]; detail: BlockDetailProps; }

export default function BlockTwelve({ data, detail }: BlockTwelveProps) {
    if (!data || data.length === 0) return null;

    return (
    <section className="relative py-6 md:py-12 bg-white">
      <div>
        {detail && (
          <div className="max-w-3xl mb-6 md:mb-8">
            {detail.heading && (
              <h2 className="text-xl md:text-2xl xl:text-3xl font-normal text-gray-900 leading-snug mb-2">{detail.heading}</h2>
            )}
            {detail.content_1 && (
              <div className="text-sm md:text-base leading-relaxed text-gray-600" dangerouslySetInnerHTML={{ __html: detail.content_1 }}/>
            )}
          </div>
        )}

        {/* ITEMS */}
        <div className="row border border-gray-200 rounded-xl p-5 bg-blue-50">
          {data.map((item) => (
            <div key={item._id} className="row col-span-12 md:col-span-6 items-start p-5 ">
                            
                <div className="col-span-2 sm:col-span-2">
                    {item.media_id?.path && (
                    <div className="relative">
                        {item.media_id?.path && (
                            <div className="relative shrink-0">
                                <Image src={item.media_id.path} alt={"Block"} fill unoptimized style={{ objectFit: "contain" }}/>
                            </div>
                        )}
                    </div>
                    )}
                </div>

                <div className="col-span-10 sm:col-span-10">
                    <h4 className="text-xl font-semibold text-gray-900 mb-1">{item.heading}</h4>
                    {item.content && (
                        <div className="content text-base text-gray-500" dangerouslySetInnerHTML={{ __html: item.content }}/>
                    )}
                </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
