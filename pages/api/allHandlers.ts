import { actionHandlers } from "./basic/action";
import { authHandlers } from "./basic/auth";
import { basicHandlers } from "./basic/basic";
import { commentHandlers } from "./basic/comment";
import { mediaHandlers } from "./basic/media";
import { metaHandlers } from "./basic/meta";
import { pageHandlers } from "./basic/page";
import { spatieHandlers } from "./basic/spatie";
import { shortcodeHandlers } from "./basic/shortCode/shortcode";
import { keywordHandlers } from "./basic/keyword";
import { excelHandlers } from "./basic/excel";
import { routingHandlers } from "./basic/routing";

import { genericBlockHandlers } from "./block/genericBlock";
import { blockquoteHandlers } from "./block/blockquote";

import { authorHandlers } from "./blog/author";
import { blogmetaHandlers } from "./blog/blogmeta";
import { blogHandlers } from "./blog/blogs";

import { commissionHandlers } from "./ecom/commission";

export async function getAllHandlers(): Promise<Record<string, any>> {
  const { reviewHandlers } = await import("./basic/review");
  return { 
    ...reviewHandlers,
    ...actionHandlers,
    ...authHandlers,
    ...basicHandlers,
    ...commentHandlers,
    ...mediaHandlers,
    ...metaHandlers,
    ...pageHandlers,
    ...spatieHandlers,
    ...shortcodeHandlers,
    ...authorHandlers,
    ...blogmetaHandlers,
    ...blogHandlers,
    ...basicHandlers,
    ...keywordHandlers,
    ...excelHandlers,
    ...routingHandlers,

    ...blockquoteHandlers,
    ...genericBlockHandlers,

    ...commissionHandlers,
  };
}