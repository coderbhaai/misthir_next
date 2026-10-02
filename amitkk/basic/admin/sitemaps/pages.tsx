import { apiRequest } from "@amitkk/basic/utils/my-utils/admin-utils";
import { cleanBaseUrl, cleanUrl } from "@amitkk/basic/utils/my-utils/client-utils";

interface PageItem {
  url: string;
  updatedAt?: string | Date;
}

const pagesSitemap = async ({ res }: { res: any }): Promise<{ props: {} }> => {
  const apiResponse = await apiRequest("GET", "basic/page?function=get_filtered_pages");
  const pages: PageItem[] = apiResponse?.data || apiResponse || [];
  const webUrl = cleanBaseUrl();

  const urls = pages.map((i) => ({
    loc: `${webUrl}/${cleanUrl(i.url)}`,
    lastmod: i.updatedAt ? new Date(i.updatedAt).toISOString() : new Date().toISOString(),
  }));

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.map((i) => `<url><loc>${i.loc}</loc><lastmod>${i.lastmod}</lastmod></url>`).join("\n")}
  </urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.write(sitemap);
  res.end();

  return { props: {} };
};

export default pagesSitemap;