import { Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import { checkNullValue, logError } from '../utils';
import UserPermission from 'lib/models/spatie/UserPermission';
import { uploadMedia } from './media';
import { createApiHandler, ExtendedRequest } from '../apiHandler';
import { APIHandlers } from '../../../lib/server/middleware';
import { buildFilterQuery } from 'lib/server/plugins/buildFilterQuery';
import Menu from 'lib/models/spatie/Menu';
import Page from 'lib/models/basic/Page';
import UrlRegistry from 'lib/models/basic/UrlRegistry';
import { getUserIdFromToken } from 'pages/api/basic/auth';

interface IMenu {
  _id: Types.ObjectId | string;
  status: boolean;
  permission_id?: Types.ObjectId | string;
  parent_id?: Types.ObjectId | string | null;
  media_id?: any;
  [key: string]: any;
}

interface NestedMenu {
  _id: string;
  name: string;
  url?: string;
  status?: boolean;
  displayOrder?: number;
  permission_id?: {
    _id: string;
    name: string;
  } | null;
  media_id?: { path?: string } | null;
  parent_id?: string | null;
  depth?: number;
  children?: NestedMenu[];
}

// Menu
export async function create_update_menu(req: ExtendedRequest, res: NextApiResponse) {
  try {
    const data = req.body;
    if (!data?.name) { return res.status(400).json({ message: "Name and URL are required" }); }
    const parent_id = data.parent_id && Types.ObjectId.isValid(data.parent_id) ? data.parent_id : null;

    let media_id = data.media_id ?? null;
    const file = Array.isArray(req.files?.image) ? req.files.image[0] : req.files?.image;
    if (file) {
      media_id = await uploadMedia({ file, name: data.name, pathType: "menu", media_id: data.media_id ?? null, user_id: null, });
    }

    const segment = await extractSegment(data.url);
    const resolved = await resolvePath(parent_id, segment);
    const newPath = resolved.path;
    const newDepth = resolved.depth;
    
    if (data._id) {
      const menu = await Menu.findById(data._id);
      if (!menu) return res.status(404).json({ message: "Menu not found" });
      
      const parentChanged = String(menu.parent_id ?? null) !== String(parent_id ?? null);

      if (parentChanged) {
        const oldPath = menu.path;

        await Menu.updateMany(
          { path: { $regex: `^${oldPath}/` } },
          [
            {
              $set: {
                path: {
                  $concat: [
                    newPath,
                    {
                      $substrCP: ["$path", oldPath.length, { $strLenCP: "$path" }],
                    },
                  ],
                },
                depth: {
                  $add: [newDepth, { $subtract: ["$depth", menu.depth] }],
                },
              },
            },
          ]
        );
      }

      menu.set({
        name: data.name,
        url: data.url,
        parent_id,
        path: newPath,
        depth: newDepth,
        status: data.status ?? menu.status,
        permission_id: data.permission_id ?? null,
        displayOrder: checkNullValue(data.displayOrder),
        media_id,
      });

      await menu.save();

      // Return full updated menu so frontend can fetch it
      return res.status(200).json({ message: "Menu updated", data: menu });
    }

    const menu = await Menu.create({
      name: data.name,
      url: data.url,
      parent_id,
      path: resolved.path,
      depth: resolved.depth,
      status: data.status ?? true,
      permission_id: data.permission_id ?? null,
      displayOrder: checkNullValue(data.displayOrder),
      media_id,
    });

    // Return created menu with _id
    return res.status(201).json({ message: "Menu created", data: menu });
  } catch (error) {
    await logError(error, { function: "create_update_menu", payload: req.body });
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function extractSegment(url: string): Promise<string | null> {
  if (!url) return null;
  const segments = url.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  return segments.length > 0 ? segments[segments.length - 1] : "";
}

export async function get_filtered_menus(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { filters = {}, page = 0, limit = 100 } = req.body || {};

    const { matchQuery } = buildFilterQuery(filters, { 
      page, 
      limit, 
      defaultLimit: 100, 
      maxLimit: 500, 
      searchableFields: ["name"] 
    });

    // Explicit generic on .lean<IMenu[]>() resolves the TS error
    const menus = await Menu.find(matchQuery)
      .populate([
        { path: "permission_id", select: "_id name" }, 
        { path: "media_id", select: "_id path alt" }
      ])
      .sort({ displayOrder: 1 })
      .lean<IMenu[]>();

    const tree = buildMenuTree(menus);

    return res.status(200).json({ message: "Fetched menus (grouped)", data: tree });
  } catch (error) {
    await logError(error, { function: "get_filtered_menus", payload: req.body });
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

function buildMenuTree(menus: IMenu[], parentId: string | null = null, depth = 0): NestedMenu[] {
  return menus
    .filter(menu => (menu.parent_id ? menu.parent_id.toString() : null) === parentId)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    .map(menu => {
      const permission = menu.permission_id as { _id: Types.ObjectId | string; name: string } | undefined;
      const media = menu.media_id as { path: string } | undefined;

      return {
        _id: menu._id.toString(),
        name: menu.name,
        url: menu.url,
        status: menu.status,
        displayOrder: checkNullValue(menu.displayOrder),
        parent_id: menu.parent_id?.toString() ?? null,
        permission_id: permission?._id
          ? {
              _id: permission._id.toString(),
              name: permission.name,
            }
          : null,
        media_id: media?.path ? { path: media.path } : null,
        depth,
        children: buildMenuTree(menus, menu._id.toString(), depth + 1),
      };
    });
}

export async function resolvePath(parent_id: Types.ObjectId | null, urlSegment?: string | null) {
  const segment = (urlSegment || "").trim();
  if (!parent_id) { return { path: segment, depth: segment ? 0 : 0 }; }

  const parent = await Menu.findById(parent_id).select("path depth");
  if (!parent) throw new Error("Parent not found");

  const newPath = segment ? `${parent.path}/${segment}` : parent.path;
  return { path: newPath, depth: parent.depth + (segment ? 1 : 0) };
}

export async function get_single_menu(req: NextApiRequest, res: NextApiResponse) {
  try {
    const id = (req.method === "GET" ? req.query.id : req.body.id) as string;
    if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: "Invalid or missing ID" }); }

    const menu = await Menu.findById(id).populate([
                    { path: "permission_id", select: "_id name" },
                    { path: "media_id", select: "_id path alt" }
                  ]).lean<IMenu>();

    if (!menu) { return res.status(404).json({ message: "Menu not found" }); }
    const pathSegments = menu.path?.split(".") ?? [];
    const path_segment = pathSegments[pathSegments.length - 1] ?? "";

    // optional: immediate children (read-only info)
    const children = await Menu.find({ parent_id: id }).populate([
                        { path: "permission_id", select: "_id name" },
                        { path: "media_id", select: "_id path alt" }
                      ]).sort({ displayOrder: 1 }).lean<IMenu>();

    return res.status(200).json({
      message: "Menu fetched",
      data: {
        _id: menu._id,
        name: menu.name,
        url: menu.url,
        status: menu.status,
        displayOrder: menu.displayOrder ?? 0,
        permission_id: menu.permission_id ?? null,
        media_id: menu.media_id ?? null,
        parent_id: menu.parent_id ?? null,
        path: path_segment,
        depth: menu.depth,
        children
      }
    });
  } catch (error) { await logError(error, { function: "get_single_menu", payload: req.body }); return res.status(500).json({ message: "Internal Server Error", data: null }); }
}

export async function get_parent_menus(req: NextApiRequest, res: NextApiResponse) {
  try {
    const excludeId = (req.method === "GET" ? req.query.exclude : req.body.exclude) as string;
    const query: any = { status: true };

    if (excludeId && Types.ObjectId.isValid(excludeId)) {
      query._id = { $ne: excludeId };
    }

    const menus = await Menu.find(query).select("_id name parent_id depth displayOrder path").sort({ path: 1, displayOrder: 1 }).lean();
    
    const map = new Map<string, any>();
    menus.forEach((m: { _id: any; }) => { map.set(String(m._id), { ...m, children: [] }); });
    
    const roots: any[] = [];
    map.forEach(node => {
      if (node.parent_id && map.has(String(node.parent_id))) {
        map.get(String(node.parent_id)).children.push(node);
      } else {
        roots.push(node);
      }
    });
    
    const flattened: any[] = [];

    const traverse = (nodes: any[], depth = 0) => {
      nodes.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
        .forEach(node => {
          flattened.push({
            _id: node._id,
            name: node.name,
            depth,
          });

          if (node.children?.length) {
            traverse(node.children, depth + 1);
          }
        });
    };

    traverse(roots);

    return res.status(200).json({ message: "Parent menus fetched", data: flattened, }); 
  } catch (error) {
    await logError(error, { function: "get_parent_menus", payload: req.body });
    return res.status(500).json({ message: "Internal Server Error", data: null });
  }
}

export async function get_admin_menu(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user_id = await getUserIdFromToken(req);
    const userPermissions = await UserPermission.find({ user_id }).select("permission_id").lean<{ permission_id?: Types.ObjectId | string }[]>().exec();
    const permissionIds = userPermissions.map((p) => p.permission_id).filter(Boolean);
    const permittedMenus = await Menu.find({ status: true, permission_id: { $in: permissionIds } }).populate("media_id", "path alt").lean<IMenu[]>();
    const allMenusMap = new Map<string, IMenu>();

    async function addMenuWithParents(menu: IMenu) {
      if (!menu || !menu._id) return;

      const menuIdStr = menu._id.toString();
      if (allMenusMap.has(menuIdStr)) return;

      allMenusMap.set(menuIdStr, menu);

      if (menu.parent_id) {
        const parent = await Menu.findById(menu.parent_id).populate("media_id", "path alt").lean<IMenu>();
        if (parent && parent.status) {
          await addMenuWithParents(parent);
        }
      }
    }

    for (const menu of permittedMenus) {
      await addMenuWithParents(menu);
    }

    const allMenus = Array.from(allMenusMap.values());
    const adminLinks: NestedMenu[] = buildMenuTree(allMenus, null);
    const userSubmenus: NestedMenu[] = [];

    return res.status(200).json({ message: "Fetched Menus", data: { adminLinks, userSubmenus } });
  } catch (error) {
    await logError(error, { function: "get_admin_menu", payload: req.body });
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function get_menu_links(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [menuPages] = await Promise.all([
      Page.find({ status: true, module: "Page", url: { $in: ["our-technology", "our-services", "our-portfolio", "blogs", "our-clients", "contact-us", "about-us", "sitemap", "terms-and-conditions", "privacy-policy"] } }).lean(),
    ]);

    return res.status(200).json({
      message: "Fetched Menu Links",
      data: {
        pages: menuPages,
      },
    });
  } catch (error) {
    await logError(error, { function: "get_menu_links", payload: req.body });
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
}

// Menu

export const functions: APIHandlers = {
  create_update_menu : { middlewares: [ "checkUserId", "checkPostMethod", { name: "validateInput", options: { requiredFields: [ "name", "status" ] }} ] },
  get_filtered_menus : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  get_single_menu : { middlewares: [ "checkUserId", ] },
  get_parent_menus : { middlewares: [ "checkUserId", ] },
  get_admin_menu : { middlewares: [ "checkUserId", ] },
  get_menu_links : { middlewares: [] },
}

export const menuHandlers = {

  create_update_menu,
  get_filtered_menus,
  get_single_menu,
  get_parent_menus,
  get_admin_menu,
  get_menu_links,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions, menuHandlers);