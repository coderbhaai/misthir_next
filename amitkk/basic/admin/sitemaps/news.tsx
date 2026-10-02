// amitkk > basic > admin > sitemaps > news.ts

import { apiRequest } from "@amitkk/basic/utils/my-utils/admin-utils";
import { cleanBaseUrl, cleanUrl } from "@amitkk/basic/utils/my-utils/client-utils";

interface BlogItem {
  url: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

const newsSitemap = async ({ res }: { res: any }): Promise<{ props: {} }> => {
  const brandName = process.env.NEXT_BRAND_NAME || "";
  const webUrl = cleanBaseUrl();
  const apiResponse = await apiRequest("GET", "basic/blog?function=get_all_blogs");
  const blogs: BlogItem[] = apiResponse?.data || apiResponse || [];

  const urls = blogs.map((b) => ({
    loc: `${webUrl}/blog/${cleanUrl(b.url)}`,
    publication_date: new Date(b.updatedAt || b.createdAt || Date.now()).toISOString().split("T")[0],
    title: b.name,
  }));

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
          xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
    ${urls
      .map(
        (u) => `
      <url>
        <loc>${u.loc}</loc>
        <news:news>
          <news:publication><news:name>${brandName}</news:name><news:language>en</news:language></news:publication>
          <news:publication_date>${u.publication_date}</news:publication_date>
          <news:title>${u.title}</news:title>
        </news:news>
      </url>`
      )
      .join("\n")}
  </urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.write(sitemap);
  res.end();

  return { props: {} };
};

export default newsSitemap;