import { GetServerSideProps } from "next";
import connectDB from "pages/lib/mongodb";
import Blog from "lib/models/blog/Blog";
import { cleanBaseUrl, cleanUrl, getBaseUrl } from "@amitkk/basic/utils/utils";

export default function RSSFeed() { return null; }

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  await connectDB();
  const blogs = await Blog.find({}, "url name excerpt createdAt").lean();
  
  const webUrl = cleanBaseUrl();

  const rssItems = [ ...blogs]
    ?.map(
      (i) => `
    <item>
    <title>${i.name}</title>
      <link>${webUrl}/blog/${cleanUrl(i.url)}</link>
      <description>${i.excerpt || ""}</description>
      <pubDate>${new Date(i.createdAt).toUTCString()}</pubDate>
    </item>`
    ).join("\n");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0">
    <channel>
      <title>RSS Blogs Feed for ${webUrl}</title>
      <link>${webUrl}</link>
      <description>RSS Blogs Feed for ${webUrl}</description>
      ${rssItems}
    </channel>
  </rss>`;

  res.setHeader("Content-Type", "application/rss+xml");
  res.write(rssFeed);
  res.end();

  return { props: {} };
};