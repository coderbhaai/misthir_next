import { GetServerSideProps } from "next";
import Blog from "lib/models/blog/Blog";
import { formatDate } from "@amitkk/basic/utils/my-utils/admin-utils";
import connectDB from "lib/server/mongodb";
import { cleanBaseUrl, trimWords, cleanUrl } from "@amitkk/basic/utils/my-utils/client-utils";

export default function LLMS() { return null; }

const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>?/gm, "");
};

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  await connectDB();
  const posts = await Blog.find( {}, "url name createdAt updatedAt author_id excerpt content" ).populate("author_id", "name").lean();

  const brandName = process.env.BRAND_NAME;
  const webUrl = cleanBaseUrl();

  let textContent = `# ${brandName}
> News, Blog Posts & Articles
## List of Posts`;

  posts.forEach((post: { createdAt: string | Date | null | undefined; updatedAt: string | Date | null | undefined; author_id: any; excerpt: any; content: any; name: any; url: string; }) => {
    const publishedDate = formatDate(post.createdAt);
    const lastModified = formatDate(post.updatedAt);
    const author = post.author_id && (post.author_id).name? (post.author_id).name: brandName;
    const excerpt = post.excerpt? post.excerpt: trimWords(stripHtml(post.content || ""), 150);

    textContent += `
- [${post.name}](${webUrl}/${cleanUrl(post.url)})
  - Published: ${publishedDate}
  - Last Modified: ${lastModified}
  - Author: ${author}
  - Excerpt: ${excerpt}`;
  });

  res.setHeader("Content-Type", "text/plain");
  res.write(textContent);
  res.end();

  return { props: {} };
};