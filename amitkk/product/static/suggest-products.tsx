import HeaderCrumbOne from "@amitkk/components/ui/HeaderCrumbOne";
import { SingleProductItem } from "./single-product-item";
import SwiperJS from "@amitkk/basic/static/Swiper";
import { SingleProductItemProps } from "../types";
import { UI_STRINGS } from "@amitkk/basic/utils/config";
import { PageDetailProps } from "@amitkk/basic/types/page";

export interface Props {
  data: SingleProductItemProps[];
  details?: PageDetailProps;
}

export default function SuggestProducts({ data = [], details }: Props) {
  if (!data || data.length === 0) return null;

  const heading = details?.product_title?.trim() || UI_STRINGS.product_title;
  const text = details?.product_text?.trim() || UI_STRINGS.product_text;
  const shouldUseCarousel = data.length >= 4;

return (
    <section className="container py-12">
      <HeaderCrumbOne heading={heading} text={text} url="/shop" url_text="All Products"/>

      {!shouldUseCarousel && (
        <div className="row">
          {data.map((i, index) => ( <div className="col-span-12 md:col-span-3" key={`${i._id ? String(i._id) : "blog"}-${index}`}><SingleProductItem row={i}/></div> ))}
        </div>
      )}

      {shouldUseCarousel && (
        <SwiperJS<SingleProductItemProps>
          items={data}
          getItemKey={(item, index) => `${item._id ? String(item._id) : "blog"}-${index}`}
          renderItem={(item) => <SingleProductItem row={item} />}
          darkControls={true}
          breakpoints={{
            640: { slidesPerView: 1 },
            1024: { slidesPerView: 2 },
            1280: { slidesPerView: 3 },
          }}
        />
      )}
    </section>
  )
}