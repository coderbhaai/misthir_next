import { GetServerSideProps } from "next";
import connectDB from "pages/lib/mongodb";
import Blog from "lib/models/blog/Blog";
import { cleanBaseUrl, cleanUrl, formatDate, getBaseUrl, stripHtml, trimWords } from "@amitkk/basic/utils/utils";

export default function LLMS() { return null; }

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  await connectDB();
  const posts = await Blog.find( {}, "url name createdAt updatedAt author_id excerpt content" ).populate("author_id", "name").lean();

  const brandName = process.env.BRAND_NAME;
  const webUrl = cleanBaseUrl();

  let textContent = `# ${brandName}
> News, Blog Posts & Articles
## List of Posts`;

  posts.forEach((post) => {
    const publishedDate = formatDate(post.createdAt);
    const lastModified = formatDate(post.updatedAt);
    const author = post.author_id && (post.author_id as any).name? (post.author_id as any).name: brandName;
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