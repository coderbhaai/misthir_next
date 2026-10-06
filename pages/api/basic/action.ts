import mongoose, { Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createApiHandler, ExtendedRequest } from '../apiHandler';
import Action from 'lib/models/basic/Action';
import { logError } from '../utils';
import { APIHandlers } from '../../../lib/server/middleware';
import SpatieRole from 'lib/models/spatie/SpatieRole';
import SpatiePermission from 'lib/models/spatie/SpatiePermission';
import Menu from 'lib/models/spatie/Menu';
import { extractSegment, resolvePath } from './menu';
import UrlRegistry from 'lib/models/basic/UrlRegistry';
import { slugify, syncUrlRegistry, upsertMeta } from 'pages/api/basic/meta';
import Page from 'lib/models/basic/Page';
import CartSku from 'lib/models/ecom/CartSku';
import CartSkuDetail from 'lib/models/ecom/CartSkuDetail';
import Cart from 'lib/models/ecom/Cart';

// Actions
  export async function initAction(module: string, module_id: Types.ObjectId | string) {
    try {
      let action = await Action.findOneAndUpdate(
        { module, module_id },
        { status: false },
        { upsert: true, new: true }
      );

      return action._id;
    } catch (error) { await logError(error, { function: "initAction", payload: {module, module_id} }); }
  }

  export async function closeAction(action_id?: string) {
    try {
      const action = await Action.findOne({ _id: action_id, status: false });
      if (!action) return;

      action.status = true;
      await action.save();
    } catch (error) { await logError(error, { function: "closeAction", payload: {action_id} }); }
  }

  export async function cleanActions() {
    try {
      const pending = await Action.find({ status: false });
      if (!pending.length) return;

      for (const action of pending) {
        await closeAction(action._id.toString());
      }
    } catch (error) { await logError(error, { function: "cleanActions", payload: {} }); }
  }

  export async function deleteAction(action_id?: string) { await Action.deleteOne({ _id: action_id }); }
  export async function deleteActionByModuleId(module_id: string) { await Action.deleteOne({ module_id }); }

  export async function getSingleAction(module: string) {
    const action = await Action.findOne({ module });
    return action;
  }
// Actions

export async function test(req: ExtendedRequest, res: NextApiResponse) {
  try {
    // const result = await init_registry();

    const response = await clear_cart();
    // const response = create_spatie();
    // const response = create_pages();
    // const response = migrate()
    // const response = db_correct()
    
    // if( !response ){ return res.status(400).json({ message: 'Test Went Successfully' }); }
    return res.status(200).json({ message: '✅ Test Ran successfully' });

  } catch (error) { await logError(error, { function: "test", payload: req.body }); }
}

async function clear_cart() {
  await Cart.deleteMany({});
  await CartSku.deleteMany({});
  await CartSkuDetail.deleteMany({});
}

async function init_registry(){
  UrlRegistry.deleteMany();
  await syncUrlRegistry();
}

export async function create_spatie(){
  try { 
    const menus = [ 'Users', 'Blog', 'Page', 'Seo', 'User', 'Forms', 'Blocks', 'Address', "Product", "Payment", "Seller" ];

    const submenu = [
      { name: 'Audit Log', url: '/admin/audit-log', permission: 'Spatie', menu: ["Amit"] },
      { name: 'Error Log', url: '/admin/error-log', permission: 'Spatie', menu: ["Amit"] },
      { name: 'Url Registry', url: '/admin/url-registry', permission: 'Spatie', menu: ["Amit"] },

      { name: 'Roles', url: '/admin/roles',  status: 1, permission: 'Spatie', menu: ["Users"] },
      { name: 'Permissions', url: '/admin/permissions',  status: 1, permission: 'Spatie', menu: ["Users"] },
      { name: 'Menu', url: '/admin/menu',  status: 1, permission: 'Spatie', menu: ["Users"] },
      { name: 'Users', url: '/admin/users',  status: 1, permission: 'Spatie', menu: ["Users"] },
      { name: 'Audit Log', url: '/admin/audit-log',  status: 1, permission: 'Spatie', menu: ["Users"] },
      { name: 'Error Log', url: '/admin/error-log',  status: 1, permission: 'Spatie', menu: ["Users"] },

      { name: 'Blogs', url: '/admin/blogs',  status: 1, permission: 'Blog', menu: ["Blog"] },
      { name: 'Author', url: '/admin/author',  status: 1, permission: 'Blog', menu: ["Blog"] },
      { name: 'Blogmeta', url: '/admin/blogmeta',  status: 1, permission: 'Blog', menu: ["Blog"] },
      { name: 'Blogs', url: '/admin/blogs',  status: 1, permission: 'Blog', menu: ["Blog"] },
      { name: 'Blogs', url: '/admin/blogs',  status: 1, permission: 'Blog', menu: ["Blog"] },

      { name: 'Meta Tags', url: '/admin/meta',  status: 1, permission: 'SEO', menu: ["Seo"] },
      { name: 'Media', url: '/admin/media',  status: 1, permission: 'SEO', menu: ["Seo"] },

      { name: 'Country', url: '/admin/country', permission: 'Check Address', menu: ["Address"] },
      { name: 'State', url: '/admin/state', permission: 'Check Address', menu: ["Address"] },
      { name: 'City', url: '/admin/city', permission: 'Check Address', menu: ["Address"] },
      { name: 'Address', url: '/admin/address', permission: 'Check Address', menu: ["Address"] },

      { name: 'Pages', url: '/admin/pages',  status: 1, permission: 'Page', menu: ["Page"] },
      { name: 'FAQs', url: '/admin/faqs',  status: 1, permission: 'Page', menu: ["Page"] },
      { name: 'Testimonials', url: '/admin/testimonials',  status: 1, permission: 'Page', menu: ["Page"] },
      { name: 'Achievement', url: '/admin/achievement',  status: 1, permission: 'Page', menu: ["Page"] },

      { name: 'Reviews', url: '/admin/reviews',  status: 1, permission: 'SEO', menu: ["Forms"] },
      { name: 'Comments', url: '/admin/comments',  status: 1, permission: 'SEO', menu: ["Forms"] },
      { name: 'Contact', url: '/admin/contact',  status: 1, permission: 'SEO', menu: ["Forms"] },
      { name: 'Searches', url: '/admin/searches',  status: 1, permission: 'SEO', menu: ["Forms"] },

      { name: 'Tab Block', url: '/admin/tab-block',  status: 1, permission: 'SEO', menu: ["Blocks"] },
      { name: 'Generic Block', url: '/admin/generic-block',  status: 1, permission: 'SEO', menu: ["Blocks"] },
      { name: 'BlockQuotes', url: '/admin/blockquotes',  status: 1, permission: 'SEO', menu: ["Blocks"] },
      { name: 'Block Detail', url: '/admin/block-detail',  status: 1, permission: 'SEO', menu: ["Blocks"] },
      
      { name: 'tax-collected', url: '/admin/tax-collected',  status: 1, permission: 'Ecom', menu: ["Payment"] },
      { name: 'setting', url: '/admin/setting',  status: 1, permission: 'Ecom', menu: ["Payment"] },
      { name: 'taxes', url: '/admin/taxes',  status: 1, permission: 'Ecom', menu: ["Payment"] },

      { name: 'sales', url: '/admin/sales',  status: 1, permission: 'Ecom', menu: ["Product"] },
      { name: 'orders', url: '/admin/orders',  status: 1, permission: 'Ecom', menu: ["Product"] },
      { name: 'coupon', url: '/admin/coupon',  status: 1, permission: 'Ecom', menu: ["Product"] },
      { name: 'bulk-order', url: '/admin/bulk-order',  status: 1, permission: 'Ecom', menu: ["Product"] },
      { name: 'Abandoned Carts', url: '/admin/abandoned-carts',  status: 1, permission: 'Ecom', menu: ["Product"] },
      { name: 'Bank Detail', url: '/admin/bank-detail',  status: 1, permission: 'Ecom', menu: ["Product"] },
      { name: 'Commission', url: '/admin/commission',  status: 1, permission: 'Ecom', menu: ["Product"] },
      { name: 'Document', url: '/admin/document',  status: 1, permission: 'Ecom', menu: ["Product"] },
      { name: 'Product Brand', url: '/admin/product-brand',  status: 1, permission: 'Ecom', menu: ["Product"] },
      { name: 'Product Feature', url: '/admin/product-feature',  status: 1, permission: 'Ecom', menu: ["Product"] },
      { name: 'Product Ingridient', url: '/admin/product-ingridient',  status: 1, permission: 'Ecom', menu: ["Product"] },
      { name: 'Product Meta', url: '/admin/product-meta',  status: 1, permission: 'Ecom', menu: ["Product"] },
      { name: 'Product Specification', url: '/admin/product-specification',  status: 1, permission: 'Ecom', menu: ["Product"] },
      { name: 'products', url: '/admin/products',  status: 1, permission: 'Ecom', menu: ["Product"] },
      { name: 'Seller Commission', url: '/admin/seller-commission',  status: 1, permission: 'Ecom', menu: ["Product"] },
      { name: 'seller', url: '/admin/seller',  status: 1, permission: 'Ecom', menu: ["Product"] },
      { name: 'Grievance', url: '/admin/grievance',  status: 1, permission: 'Ecom', menu: ["Product"] },
      { name: 'Wishlist', url: '/admin/wishlist',  status: 1, permission: 'Ecom', menu: ["Product"] },
      { name: 'Order Guide', url: '/admin/order-guide',  status: 1, permission: 'Ecom', menu: ["Product"] },

      { name: 'Abandoned Carts', url: '/seller/abandoned-carts',  status: 1, permission: 'Seller', menu: ["Seller"] },
      { name: 'brand', url: '/seller/brand',  status: 1, permission: 'Seller', menu: ["Seller"] },
      { name: 'coupon', url: '/seller/coupon',  status: 1, permission: 'Seller', menu: ["Seller"] },
      { name: 'media', url: '/seller/media',  status: 1, permission: 'Seller', menu: ["Seller"] },
      { name: 'orders', url: '/seller/orders',  status: 1, permission: 'Seller', menu: ["Seller"] },
      { name: 'products', url: '/seller/products',  status: 1, permission: 'Seller', menu: ["Seller"] },
      { name: 'reviews', url: '/seller/reviews',  status: 1, permission: 'Seller', menu: ["Seller"] },
      { name: 'sales', url: '/seller/sales',  status: 1, permission: 'Seller', menu: ["Seller"] },

      { name: 'orders', url: '/admin/orders',  status: 1, permission: '', menu: ["User"] },
      { name: 'address', url: '/admin/address',  status: 1, permission: '', menu: ["User"] },
    ];

    const roles = ['Amit', 'Owner', 'Owner Ops', 'Admin', 'Seo', 'Seller', 'User', ];

    const permissions = [
      { name: 'Blog', status: 1, roles: ['Amit', 'Owner', 'Owner Ops', 'Admin', 'Seo'] },
      { name: 'Page', status: 1, roles: ['Amit', 'Owner', 'Owner Ops', 'Admin', 'Seo'] },
      { name: 'SEO', status: 1, roles: ['Amit', 'Owner', 'Owner Ops', 'Admin', 'Seo'] },
      { name: 'Admin', status: 1, roles: ['Amit', 'Owner', 'Owner Ops', 'Admin', 'Seo'] },
      { name: 'Seller', status: 1, roles: ['Seller'] },
      { name: 'Spatie', status: 1, roles: ['Amit', 'Owner', 'Owner Ops', 'Admin', 'Seo'] },
      { name: 'Ecom', status: 1, roles: ['Amit', 'Owner', 'Owner Ops', 'Admin', 'Seo'] },
    ];

    const basic: any[] = [ "Lead", "Contact" ];

    const actions = ["Create", "Edit", "Check", "Download"];

    const updatedPermissions = [ ...permissions,
      ...basic.flatMap((module) => actions.map((action) => ({ name: `${action} ${module}`, roles: ["Owner", "Owner Ops", "Admin"], }))),
    ];

    const roleMap: Record<string, string> = {};

    for (const r of roles) {
      let role = await SpatieRole.findOne({ name: r });

      if (role) {
        role.status = true;
        await role.save();
      } else {
        role = await SpatieRole.create({
          name: r,
          status: true,
        });
      }

      roleMap[r] = role._id.toString();
    }
    
    const permissionMap: Record<string, string> = {};

    for (const p of updatedPermissions) {
      const roleIds = p.roles.map(r => roleMap[r]).filter(Boolean);
      let permission = await SpatiePermission.findOne({ name: p.name });

      if (permission) {
        permission.status = true;
        permission.roles = roleIds;
        await permission.save();
      } else {
        permission = await SpatiePermission.create({
          name: p.name,
          status: true,
          roles: roleIds,
        });
      }

      permissionMap[p.name] = permission._id.toString();
    }

    const menuMap: Record<string, string> = {};

    for (const m of menus) {
      let menu = await Menu.findOne({ name: m, parent_id: null });
      const segment = await extractSegment(m);
      const resolved = await resolvePath(null, segment);

      if (menu) {
        menu.status = true;
        menu.path = resolved.path;
        menu.depth = resolved.depth;
        await menu.save();
      } else {
        menu = await Menu.create({
          name: m,
          url: "",
          parent_id: null,
          path: resolved.path,
          depth: resolved.depth,
          status: true,
          displayOrder: null,
        });
      }

      menuMap[m] = menu._id.toString();
    }

    for (const sm of submenu) {
      const parentName = sm.menu[0];
      const parentId = menuMap[parentName];
      if (!parentId) continue;

      let menu = await Menu.findOne({
        name: sm.name,
        parent_id: parentId,
      });

      const segment = await extractSegment(sm.url);
      const resolved = await resolvePath(
        new Types.ObjectId(parentId),
        segment
      );

      if (menu) {
        menu.url = sm.url;
        menu.path = resolved.path;
        menu.depth = resolved.depth;
        menu.status = true;
        menu.permission_id = permissionMap[sm.permission] ?? null;
        await menu.save();
      } else {
        menu = await Menu.create({
          name: sm.name,
          url: sm.url,
          parent_id: parentId,
          path: resolved.path,
          depth: resolved.depth,
          status: true,
          permission_id: permissionMap[sm.permission] ?? null,
          displayOrder: null,
        });
      }
    }

    return true;
  } catch (error) { await logError(error, { function: "create_spatie", payload: {} }); return false; }
}

export async function create_pages(){
  try { 
    const pages = [
      { name: 'Home', title: '/' },
      { name: 'Shop', title: 'shop' },
      { name: 'Blogs', title: 'blogs' },
      { name: 'About Us', title: 'about-us' },
      { name: 'sitemap', title: 'sitemap' },
      { name: 'Privacy Policy', title: 'privacy-policy' },
      { name: 'Terms & Conditions', title: 'terms-and-conditions' },
    ];

    for (const p of pages) {
      const slug = await slugify(p.name, Page, null);

      let meta_id: string | null = null;
      meta_id = await upsertMeta({ meta_id: null, url: slug, title: p.title, description: p.title });

      const newEntry = new Page({
          url: slug,
          module: "Page",
          module_id: null,
          name: p.name,
          content: null,
          status: true,
          sitemap: true,
          schema_status: true,
          media_id: null,
          meta_id: meta_id,
        });

        await newEntry.save();
      }
  } catch (error) { await logError(error, { function: "create_spatie", payload: {} }); return false; }
}

export async function check_api(req: ExtendedRequest, res: NextApiResponse) {
  try {

    return res.status(200).json({ message: 'Hi from APIs' });
  } catch (error) { await logError(error, { function: "check_api", payload: req.body }); }
}

export const functions: APIHandlers = {
  check_api : { middlewares: [ "allowCrossOrigin", "checkUserId", "checkPostMethod" ], url: "/admin/users" },
  test : { middlewares: [] },	
}

export const actionHandlers = {
  test,
  check_api,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions, actionHandlers);