import { apiRequest } from "@amitkk/basic/utils/my-utils/admin-utils";
import { cleanBaseUrl, cleanUrl } from "@amitkk/basic/utils/my-utils/client-utils";

interface BlogItem {
  url: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

const blogsSitemap = async ({ res }: { res: any }): Promise<{ props: {} }> => {
  const webUrl = cleanBaseUrl();
  const apiResponse = await apiRequest("GET", "basic/blog?function=get_all_blogs");
  const blogs: BlogItem[] = apiResponse?.data || apiResponse || [];

  const urls = blogs.map((b) => ({
    loc: `${webUrl}/blog/${cleanUrl(b.url)}`,
    publication_date: new Date(b.updatedAt || b.createdAt || Date.now()).toISOString().split("T")[0],
    title: b.name,
  }));

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls?.map((i) =>`<url><loc>${i.loc}</loc><lastmod>${i.publication_date}</lastmod></url>`).join("\n")}
    </urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.write(sitemap);
    res.end();
    return { props: {} };
};

export default blogsSitemap;