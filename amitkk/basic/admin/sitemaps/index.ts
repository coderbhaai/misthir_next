import { apiRequest, formatDate } from "@amitkk/basic/utils/my-utils/admin-utils";
import { getBaseUrl } from "@amitkk/basic/utils/my-utils/client-utils";

interface SitemapItem {
  updatedAt?: string | Date;
  createdAt?: string | Date;
}

interface SitemapResponse {
  pages?: SitemapItem[];
  blogs?: SitemapItem[];
}

const indexSitemap = async ({ res }: { res: any }): Promise<{ props: {} }> => {
  const baseUrl = getBaseUrl();

  const apiRes: SitemapResponse = await apiRequest("GET", "basic/basic?function=get_sitemap_links");
  const data = apiRes || {};

  const pages = data.pages || [];
  const blogs = data.blogs || [];

  const lastPageUpdate = pages.length? new Date(Math.max(...pages.map((p) => new Date(p.updatedAt || p.createdAt || Date.now()).getTime()))) : new Date();
  const lastBlogUpdate = blogs.length? new Date(Math.max(...blogs.map((b) => new Date(b.updatedAt || b.createdAt || Date.now()).getTime()))) : new Date();

  const xml = `<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="/sitemap-index-style.xsl"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <sitemap><loc>${baseUrl}/sitemap-pages.xml</loc><lastmod>${formatDate(lastPageUpdate)}</lastmod></sitemap>
      <sitemap><loc>${baseUrl}/sitemap-blogs.xml</loc><lastmod>${formatDate(lastBlogUpdate)}</lastmod></sitemap>
    </sitemapindex>`;

  res.setHeader("Content-Type", "application/xml");
  res.write(xml);
  res.end();

  return { props: {} };
};

export default indexSitemap;