import type { SingleBlogProps } from "@amitkk/basic/types/shared";
import type { PageDetailProps } from "@amitkk/basic/types/page";
import SingleBlogItem from "@amitkk/blog/static/single-blog-item";
import HeaderCrumbOne from "@amitkk/components/ui/HeaderCrumbOne";
import SwiperJS from "@amitkk/basic/static/Swiper";
import { UI_STRINGS } from "@amitkk/basic/utils/config";

export interface Props {
  data: SingleBlogProps[];
  details?: PageDetailProps;
}

export default function SuggestBlogs({data = [], details }: Props) {
  if (!data?.length) return null;

  const heading = details?.blog_title?.trim() || UI_STRINGS.blog_title;
  const text = details?.blog_text?.trim() || UI_STRINGS.blog_text;
  const shouldUseCarousel = data.length >= 4;

  return (
    <section className="container py-12">
      <HeaderCrumbOne heading={heading} text={text} url="/blogs" url_text="All Blogs"/>

      {!shouldUseCarousel && (
        <div className="row">
          {data.map((i, index) => ( <div className="col-span-12 md:col-span-3" key={`${i._id ? String(i._id) : "blog"}-${index}`}><SingleBlogItem row={i}/></div> ))}
        </div>
      )}

      {shouldUseCarousel && (
        <SwiperJS<SingleBlogProps>
          items={data}
          getItemKey={(item, index) => `${item._id ? String(item._id) : "blog"}-${index}`}
          renderItem={(item) => <SingleBlogItem row={item} />}
          darkControls={true}
          breakpoints={{
            640: { slidesPerView: 1 },
            1024: { slidesPerView: 2 },
            1280: { slidesPerView: 3 },
          }}
        />
      )}
    </section>
  );
}