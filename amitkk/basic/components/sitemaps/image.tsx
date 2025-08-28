import connectDB from "pages/lib/mongodb";
import Media from "lib/models/basic/Media";

const imageSitemap = async ({ res }: { res: any }): Promise<{ props: {} }> => {
  await connectDB();
  const media = await Media.find({}, "path alt").lean();

  const urls = media.map((i: any) => {
    return {
      loc: i.path,
      alt: i.alt || "Image",
    };
  }).filter(i => i.loc);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    ${urls.map( (i) => `<url><loc>${i.loc}</loc><image:image><image:loc>${i.loc}</image:loc><image:caption>${i.alt}</image:caption></image:image></url>`).join("\n")}
  </urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.write(sitemap);
  res.end();

  return { props: {} };
};

export default imageSitemap;