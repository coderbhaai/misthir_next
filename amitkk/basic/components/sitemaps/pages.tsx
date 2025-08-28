import connectDB from "pages/lib/mongodb";
import Page from "lib/models/basic/Page";
import { cleanBaseUrl, cleanUrl } from "@amitkk/basic/utils/utils";

const pagesSitemap = async ({ res }: { res: any }): Promise<{ props: {} }> => {
  await connectDB();
  const pages = await Page.find({}, "url updatedAt");  
  const webUrl = cleanBaseUrl();

  const urls = [
    ...pages?.map(i => ({
      loc: `${webUrl}/${cleanUrl(i.url)}`,
      lastmod: i.updatedAt?.toISOString() || new Date().toISOString(),
    })),
  ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls?.map((i) =>`<url><loc>${i.loc}</loc><lastmod>${i.lastmod}</lastmod></url>`).join("\n")}
    </urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.write(sitemap);
    res.end();
    return { props: {} };
  };

export default pagesSitemap;