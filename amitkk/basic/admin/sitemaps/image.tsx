import { apiRequest } from "@amitkk/basic/utils/my-utils/admin-utils";

interface MediaItem {
  path?: string;
  alt?: string;
}

const imageSitemap = async ({ res }: { res: any }): Promise<{ props: {} }> => {
  const apiResponse = await apiRequest("GET", "basic/media?function=get_all_media");
  const media: MediaItem[] = apiResponse?.data || apiResponse || [];
  const urls = media.map((i) => ({ loc: i.path || "", alt: i.alt || "Image" })).filter((i) => Boolean(i.loc));

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    ${urls.map((i) => `<url><loc>${i.loc}</loc><image:image><image:loc>${i.loc}</image:loc><image:caption>${i.alt}</image:caption></image:image></url>`).join("\n")}
  </urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.write(sitemap);
  res.end();

  return { props: {} };
};

export default imageSitemap;