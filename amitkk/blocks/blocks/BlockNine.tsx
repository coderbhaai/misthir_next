import React, { useState, useRef } from "react";
import gsap from "gsap";
import { BlockDetailProps, GenericBlock } from "@amitkk/basic/types/blocks";
import { MediaProps } from "@amitkk/basic/types/media";

interface BlockNineProps {
  data: GenericBlock[];
  detail: BlockDetailProps;
}

export default function BlockNine({ data, detail }: BlockNineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  if (!data || data.length === 0) return null;

  const toggleReadMore = (index: number) => {
    const isExpanded = !!expandedItems[index];
    const targetEl = contentRefs.current[index];

    if (targetEl) {
      if (!isExpanded) {
        gsap.to(targetEl, {
          height: "auto",
          duration: 0.4,
          ease: "power2.out",
        });
      } else {
        gsap.to(targetEl, {
          height: "auto",
          duration: 0.4,
          ease: "power2.inOut",
        });
      }
    }

    setExpandedItems((prev) => ({
      ...prev,
      [index]: !isExpanded,
    }));
  };

  return (
    <section className="bg-primary text-white p-6 md:p-12 overflow-hidden">
      <div className="container mx-auto py-4">
        {detail && (
          <div className="text-center mb-12">
            {detail.heading && (
              <h3 className="text-xl md:text-2xl xl:text-3xl font-semibold text-white leading-snug mb-3">{detail.heading}</h3>
            )}
            {detail.content_1 && (
              <div className="text-sm md:text-base text-gray-200 mx-auto" dangerouslySetInnerHTML={{ __html: detail.content_1 || "" }}/>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row transition-all duration-700 ease-in-out gap-4">
        {data.map((i, index) => { const isExpanded = !!expandedItems[index];

          return (
            <div key={index} className={`flex-1 overflow-hidden transition-all duration-500 ease-out rounded-xl group mb-4 md:mb-0 ${isExpanded ? "md:flex-[2]" : "hover:md:flex-[1.5]"}`}>
              <div className="relative w-full h-[420px] md:h-[520px] bg-cover bg-center bg-no-repeat rounded-xl overflow-hidden shadow-lg transition-transform duration-500 group-hover:scale-[1.01]"
                style={{ backgroundImage: `url(${(i?.media_id as unknown as MediaProps)?.path || "/images/static/default.jpg"})`}}>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/95 via-black/60 to-transparent z-0 transition-opacity duration-300 group-hover:opacity-90"></div>
                <div className="absolute bottom-0 inset-x-0 p-6 z-10 flex flex-col justify-end">
                  {i.heading && ( <h4 className="text-lg md:text-xl font-bold text-blue-400 mb-2 drop-shadow-sm">{i.heading}</h4>)}
                  {i.content && (
                    <div className="relative">
                      <div ref={(el) => { contentRefs.current[index] = el; }} className={`text-sm md:text-base text-gray-300 leading-relaxed ${ !isExpanded ? "line-clamp-3" : "" }`}>
                        <span dangerouslySetInnerHTML={{ __html: i.content || "" }} />
                      </div>
                      <button onClick={() => toggleReadMore(index)} className="inline-flex items-center gap-1 mt-2 text-xs md:text-sm font-semibold text-blue-300 hover:text-white transition-colors duration-200 cursor-pointer focus:outline-none" aria-expanded={isExpanded}>
                        {isExpanded ? (
                          <>
                            Read Less <span className="text-xs">▲</span>
                          </>
                        ) : (
                          <>
                            Read More <span className="text-xs">▼</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}