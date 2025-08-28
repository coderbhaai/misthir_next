import mongoose from "mongoose";
import { NextApiRequest } from "next";
import jwt from "jsonwebtoken";
import Page from "lib/models/basic/Page";
import Blog from "lib/models/blog/Blog";
import path from "path";
import fs from "fs";
import { format } from "date-fns";
import { isValidObjectId } from "@amitkk/basic/utils/utils";
import Media from "lib/models/basic/Media";
import connectDB from "pages/lib/mongodb";

export const log = (...args: any[]) => {
  if (process.env.MODE !== 'production') {
    console.log("[LOG]:", ...args);
  }
};

export async function pivotEntry(
  model: mongoose.Model<any>,
  parentId: mongoose.Types.ObjectId | string,
  childIds: (mongoose.Types.ObjectId | string)[] | undefined | null,
  parentKey: string,
  childKey: string
): Promise<void> {
  try {
    const parentObjectId = new mongoose.Types.ObjectId(parentId);
    await model.deleteMany({ [parentKey]: parentObjectId });


    if (Array.isArray(childIds) && childIds.length > 0) {
      const entries = childIds?.map((childId) => ({
        [parentKey]: parentObjectId,
        [childKey]: new mongoose.Types.ObjectId(childId),
        createdAt: new Date(),
      }));

      await model.insertMany(entries);
    }
  } catch (error) {
    log(error);
  }
}


interface AddUpdateMediaParams {
  path: string;
  alt: string;
  media_id?: string | null;
}

export async function addUpdateMediaModel({ path, alt, media_id = null }: AddUpdateMediaParams): Promise<string | null> {
  try {
    if (media_id && isValidObjectId(media_id)) {
      await Media.findByIdAndUpdate(
        media_id,
        { alt: alt, path: path },
        { new: true }
      );

      return media_id;
    } else {
      const entry = await Media.create({ alt: alt, path: path });
      return entry._id.toString();
    }

  } catch (err) { return null; }
}


interface JwtPayload {
  user_id: string;
  [key: string]: any; // for extra fields if needed
}

export function getUserIdFromToken(req: NextApiRequest): string | null {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) { return null; }

    const token = authHeader.split(" ")[1];
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    return decoded?.id || null;
  } catch (error) { log(error); return null; }
}

export interface User {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
}

export function generateJWTToken(user: User): string {
  if (!process.env.JWT_SECRET) { throw new Error('JWT_SECRET is not defined in environment variables'); }

  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    }, process.env.JWT_SECRET, { expiresIn: '7d' }
  );
}

export const generateSitemap =async () => {
  try {
    await connectDB();

 const site = process.env.MODE === 'development' 
  ? process.env.DEV_URL || 'https://tripsandstay.com/' 
  : process.env.PROD_URL || 'https://tripsandstay.com/';

  const pages = await Page.find({ status: 1, sitemap: 1, url: { $ne: "/" } }).select("url");
  const blogs = await Blog.find().select("url name updatedAt"); 

  
    const today = format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX");
    const urlEntry = (loc: string, priority: number) => `
      <url>
        <loc>${loc}</loc>
        <lastmod>${today}</lastmod>
        <priority>${priority}</priority>
      </url>
    `;

    // Main sitemap
    const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${urlEntry(site, 1.0)}
        ${pages?.map(p => urlEntry(`${site}/${p.url}`, 0.90)).join("")}
        ${blogs?.map(b => urlEntry(`${site}/${b.url}`, 0.80)).join("")}
      </urlset>`;

    const sitemapPath = path.join(process.cwd(), "public", "sitemap.xml");
    fs.writeFileSync(sitemapPath, sitemapXML);

    const imageSitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.google.com/schemas/sitemap-image/1.1">
        <!-- Your media loop here -->
      </urlset>`;
    fs.writeFileSync(path.join(process.cwd(), "public", "sitemap-image.xml"), imageSitemapXML);


    const newsSitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.google.com/schemas/sitemap-news/0.9">
        <!-- Your news loop here -->
      </urlset>`;
    fs.writeFileSync(path.join(process.cwd(), "public", "news-sitemap.xml"), newsSitemapXML);


    const urls = [
      `${site}/`,
      ...pages?.map(p => `${site}/${p.url}`),
      ...blogs?.map(b => `${site}/${b.url}`),
      `${site}/sitemap.xml`,
      `${site}/sitemap-image.xml`
    ];

    // const indexNowResponse = await fetch("https://api.indexnow.org/indexnow", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     host: new URL(site).host,
    //     key: "d273395969c44ba5846970e6b8420587",
    //     keyLocation: `${site}/index-now.txt`,
    //     urlList: urls
    //   })
    // });

  } catch (err) { log(err); }

};
