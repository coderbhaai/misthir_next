import { formatDate, getBaseUrl } from "@amitkk/basic/utils/utils";
import connectDB from "pages/lib/mongodb";

const indexSitemap = async ({ res }: { res: any }): Promise<{ props: {} }> => {
  const baseUrl = getBaseUrl();

  await connectDB();
  const apiRes = await fetch(`${baseUrl}/api/basic/meta?function=get_sitemap_links`);
  const { data } = await apiRes.json();

  const lastPageUpdate = data.pages.length? new Date(Math.max(...data.pages.map((p: any) => new Date(p.updatedAt || p.createdAt || Date.now()).getTime()))): new Date();
  const lastBlogUpdate = data.blogs.length? new Date(Math.max(...data.blogs.map((b: any) => new Date(b.updatedAt || b.createdAt || Date.now()).getTime()))): new Date();

  const xml   = `<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="/sitemap-index-style.xsl"?>
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