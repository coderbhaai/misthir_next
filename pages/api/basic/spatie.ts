import { isValidObjectId, Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdFromToken, log, pivotEntry } from '../utils';
import SpatiePermission from 'lib/models/spatie/SpatiePermission';
import SpatieRole from 'lib/models/spatie/SpatieRole';
import RolePermission from 'lib/models/spatie/RolePermission';
import UserRole from 'lib/models/spatie/UserRole';
import UserPermission from 'lib/models/spatie/UserPermission';
import SpatieMenu from 'lib/models/spatie/SpatieMenu';
import MenuSubmenu from 'lib/models/spatie/MenuSubmenu';
import SpatieSubmenu from 'lib/models/spatie/SpatieSubmenu';
import { uploadMedia } from './media';
import { MediaProps } from '@amitkk/basic/types/page';
import User from 'lib/models/spatie/User';
import path from "path";
import fs from "fs";
import { createApiHandler, ExtendedRequest, HandlerMap, } from '../apiHandler';
import connectDB from 'pages/lib/mongodb';
import { Fields, Files, IncomingForm } from 'formidable';

export interface SpatieMenuWithSubmenus {
  _id: string;
  name: string;
  media_id?: { path?: string; alt?: string };
  submenusAttached?: Array<{
    submenu_id?: {
      name: string;
      url: string;
      media_id?: { path?: string };
    };
  }>;
}

export interface SubmenuAttachedProps {
  _id: string;
  submenu_id: SubmenuProps | null;
}

export interface SubmenuProps {
  _id: string;
  name: string;
  url: string;
  media_id?: MediaProps | null;
}

export interface MenuProps {
  _id: string;
  name: string;
  media_id?: MediaProps | null;
  submenusAttached?: SubmenuAttachedProps[];
}

export interface SimpleSubmenu {
  name: string;
  url: string;
  media: string | null;
}

// User
  export async function get_all_users(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await User.find()
      .populate({ path: "rolesAttached", populate: { path: "role_id", model: "SpatieRole", select: "_id name status" } })
      .populate({ path: "permissionsAttached", populate: { path: "permission_id", model: "SpatiePermission", select: "_id name" } })
      .exec();
      return res.status(200).json({ message: 'Fetched all Users', data });
    } catch (error) { return log(error); }
  }

  export async function get_single_user(req: NextApiRequest, res: NextApiResponse){
    const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;    
    if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }
    
    const data = await User.findById(id)
    .populate({ path: "rolesAttached", populate: { path: "role_id", model: "SpatieRole", select: "_id name status" } })
    .populate({ path: "permissionsAttached", populate: { path: "permission_id", model: "SpatiePermission", select: "_id name" } })
    .lean();
    const userRoles = await UserRole.find({ user_id: id }).populate("role_id", "name").lean().exec();
    const rolesIds = userRoles?.map(rp => rp.role_id?._id).filter(Boolean);

    const userPermissions = await UserPermission.find({ user_id: id }).populate("permission_id", "name").lean().exec();
    const permissionIds = userPermissions?.map(rp => rp.permission_id?._id).filter(Boolean);

    if (!data) { return res.status(404).json({ message: `Entry with ID ${id} not found` }); }
    return res.status(201).json({ message: 'Entry Fetched', data: { ...data, role_ids: rolesIds, permission_ids: permissionIds } });
  };

  export async function create_update_user(req: NextApiRequest, res: NextApiResponse) {
    try {
      if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }
    
      const data = req.body;
      if ( !data?.name || !data?.email || !data.phone ) { return res.status(400).json({ message: '❌ Required fields missing' }); }

      const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;

      if (modelId && isValidObjectId(modelId)) {
        try {
          const updated = await User.findByIdAndUpdate(
            modelId,
            {
              name: data.name,
              email: data.email,
              phone: data.phone,
              status: data.status,
              updatedAt: new Date(),
            }, { new: true }
          );

          const child_role_array = JSON.parse(data.role_child);
          await pivotEntry( UserRole, updated._id, child_role_array, 'user_id', 'role_id' );

          const child_permission_array = JSON.parse(data.permission_child);
          await pivotEntry( UserPermission, updated._id, child_permission_array, 'user_id', 'permission_id' );

          return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
        } catch (error) { return log(error); }
      }      

      const newEntry = new User({
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status,
        createdAt: new Date(),
      });

      await newEntry.save();
      
      const child_role_array = JSON.parse(data.role_child);
      await pivotEntry( UserRole, newEntry._id, child_role_array, 'user_id', 'role_id' );

      const child_permission_array = JSON.parse(data.permission_child);
      await pivotEntry( UserPermission, newEntry._id, child_permission_array, 'user_id', 'permission_id' );

      return res.status(200).json({ message: '✅ Entry updated successfully', data: newEntry });
    } catch (error) { return log(error); }
  }
// User

// Roles
  export async function create_update_role(req: NextApiRequest, res: NextApiResponse) {
    try {
      if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }
    
      const data = req.body;
      if ( !data?.name || !data?.status) { return res.status(400).json({ message: '❌ Required fields missing' }); }

      const modelId = (typeof data._id === 'string' || data._id instanceof Types.ObjectId) ? data._id : null;
      
      const child_array = JSON.parse(req.body.permission_child);
      if (data._id) {
        const updated = await SpatieRole.findByIdAndUpdate(
          data._id,
          {
            name: data.name,
            status: data.status,
            updatedAt: new Date(),
          },
          { new: true }
        );

        await pivotEntry( RolePermission, updated._id, child_array, 'role_id', 'permission_id' );

        if (updated) { return res.status(200).json({ message: '✅ Entry updated successfully', data: updated }); }
      }

      const newEntry = new SpatieRole({
        name: data.name,
        status: data.status,
      });

      await newEntry.save();
      await pivotEntry( RolePermission, newEntry._id, req.body.permissions, 'role_id', 'permission_id' );

      return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
    } catch (error) { return log(error); }
  }

  export async function get_all_roles(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await SpatieRole.find().populate([ { path: "permissionsAttached", populate: { path: "permission_id", model: "SpatiePermission", select: "_id name" } }]).exec();
      return res.status(200).json({ message: 'Fetched all Roles', data });
    } catch (error) { return log(error); }
  }

  export async function get_single_role(req: NextApiRequest, res: NextApiResponse){
    const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
    
    if (!id || !Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid or missing ID' });
    }

    const data = await SpatieRole.findById(id).populate([ { path: "permissionsAttached", populate: { path: "permission_id", model: "SpatiePermission", select: "_id name" } }]).lean();

    const rolePermissions = await RolePermission.find({ role_id: id }).populate("permission_id", "name").lean().exec();
    const permissionIds = rolePermissions?.map(rp => rp.permission_id?._id).filter(Boolean);

    if (!data) { return res.status(404).json({ message: `Entry with ID ${id} not found` }); }

    return res.status(201).json({ message: 'Entry Fetched', data: { ...data, permission_ids: permissionIds } });
  };
// Roles

// Permissions
  export async function create_update_permission(req: NextApiRequest, res: NextApiResponse) {
    try {
      if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }
    
      const data = req.body;
      if ( !data?.name || !data?.status) { return res.status(400).json({ message: '❌ Required fields missing' }); }

      const child_array = JSON.parse(req.body.role_child);

      if (data._id) {
        const updated = await SpatiePermission.findByIdAndUpdate(
          data._id,
          {
            name: data.name,
            status: data.status,
            updatedAt: new Date(),
          },
          { new: true }
        );

        
        await pivotEntry( RolePermission, updated._id, child_array, 'permission_id', 'role_id' );

        if (updated) { return res.status(200).json({ message: '✅ Entry updated successfully', data: updated }); }
      }

      const newEntry = new SpatiePermission({
        name: data.name,
        status: data.status,
      });

      await newEntry.save();

      await pivotEntry( RolePermission, newEntry._id, child_array, 'permission_id', 'role_id' );

      return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
    } catch (error) { return log(error); }
  }

  export async function get_all_permissions(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await SpatiePermission.find().populate([ { path: 'rolesAttached', populate: { path: 'role_id', model: 'SpatieRole', select: '_id name' } } ]).exec();
      return res.status(200).json({ message: 'Fetched all Permissions', data });
    } catch (error) { return log(error); }
  }

  export async function get_single_permission(req: NextApiRequest, res: NextApiResponse){
    const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;

    if (!id || !Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid or missing ID' });
    }
    
    const data = await SpatiePermission.findById(id).populate([ { path: "rolesAttached", populate: { path: "role_id", model: "SpatieRole", select: "_id name" } }]).lean();
    
    const rolePermissions = await RolePermission.find({ permission_id: id }).populate("role_id", "name").lean().exec();
    const rolesIds = rolePermissions?.map(rp => rp.role_id?._id).filter(Boolean);

    if (!data) { return res.status(404).json({ message: `Entry with ID ${id} not found` }); }

    return res.status(201).json({ message: 'Entry Fetched', data: { ...data, role_ids: rolesIds } });
  };
// Permissions

// Menu
  export async function create_update_menu(req: ExtendedRequest, res: NextApiResponse) {
    try {
      if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }
    
      const data = req.body;
      if ( !data?.name || !data?.status) { return res.status(400).json({ message: '❌ Required fields missing' }); }

      const child_array = JSON.parse(req.body.submenus);

      let media_id: string | null = null;
      if (data.media_id && isValidObjectId(data.media_id)) { media_id = data.media_id; }
      const file = Array.isArray(req.files?.image) ? req.files.image[0] : req.files?.image;
      
      if (file) {
        media_id = await uploadMedia({ file, name: data.name, pathType: data.path, media_id: data.media_id ?? null, user_id: null });
      }

      if (data._id) {
        const updated = await SpatieMenu.findByIdAndUpdate(
          data._id,
          {
            name: data.name,
            media_id:media_id,
            status: data.status,
            updatedAt: new Date(),
          },
          { new: true }
        );
        
        await pivotEntry( MenuSubmenu, updated._id, child_array, 'menu_id', 'submenu_id' );

        if (updated) { return res.status(200).json({ message: '✅ Entry updated successfully', data: updated }); }
      }

      const newEntry = new SpatieMenu({
        name: data.name,
        media_id:media_id,
        status: data.status,
      });

      await newEntry.save();
    
      await pivotEntry( MenuSubmenu, newEntry._id, child_array, 'menu_id', 'submenu_id' );

      return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
    } catch (error) { return log(error); }
  }

  export async function get_all_menus(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await SpatieMenu.find().populate([ { path: "submenusAttached", populate: { path: "submenu_id", model: "SpatieSubmenu", select: "_id name" } }, { path: 'media_id' } ]).exec();
      return res.status(200).json({ message: 'Fetched all Menus', data });
    } catch (error) { return log(error); }
  }

  export async function get_single_menu(req: NextApiRequest, res: NextApiResponse){
    const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;
    
    if (!id || !Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid or missing ID' });
    }

    const data = await SpatieMenu.findById(id).populate([ { path: "submenusAttached", populate: { path: "submenu_id", model: "SpatieSubmenu", select: "_id name" } }, { path: 'media_id' } ]).lean();

    const menuSubmenu = await MenuSubmenu.find({ menu_id: id }).populate("submenu_id", "name").lean().exec();
    const submenuIds = menuSubmenu?.map(rp => rp.submenu_id?._id).filter(Boolean);

    if (!data) { return res.status(404).json({ message: `Entry with ID ${id} not found` }); }

    return res.status(201).json({ message: 'Entry Fetched', data: { ...data, submenu_ids: submenuIds } });
  };
// Menu

// Submenu
  export async function create_update_submenu(req: ExtendedRequest, res: NextApiResponse) {
    try {
      if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }
    
      const data = req.body;
      if ( !data?.name || !data?.status) { return res.status(400).json({ message: '❌ Required fields missing' }); }

      const child_array = JSON.parse(data.menu);

      const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;
      
      let media_id: string | null = null;
      if (data.media_id && isValidObjectId(data.media_id)) { media_id = data.media_id; }
      const file = Array.isArray(req.files?.image) ? req.files.image[0] : req.files?.image;
      
      media_id = data.media_id;
      if (file) {
        media_id = await uploadMedia({ file, name: data.name, pathType: data.path, media_id: data.media_id ?? null, user_id: null });
      }

      if (data._id) {
        const updated = await SpatieSubmenu.findByIdAndUpdate(
          data._id,
          {
            name: data.name,
            url: data.url,
            permission_id: data.permission_id,
            media_id: media_id,
            status: data.status,
            displayOrder: data.displayOrder,
            updatedAt: new Date(),
          },
          { new: true }
        );
        await pivotEntry( MenuSubmenu, data._id, child_array, 'submenu_id', 'menu_id' );

        if (updated) { return res.status(200).json({ message: '✅ Entry updated successfully', data: updated }); }
      }

      const newEntry = new SpatieSubmenu({
        name: data.name,
        url: data.url,
        permission_id: data.permission_id,
        media_id: media_id,
        status: data.status,
        displayOrder: data.displayOrder,
      });

      await newEntry.save();

      await pivotEntry( MenuSubmenu, newEntry._id, child_array, 'submenu_id', 'menu_id' );

      return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
    } catch (error) { return log(error); }
  }

  export async function get_all_submenus(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await SpatieSubmenu.find().populate([ { path: 'menusAttached', populate: { path: 'menu_id', model: 'SpatieMenu', select: '_id name' } }, { path: "permissionAttached", model: "SpatiePermission", select: "name status", }, { path: 'media_id' } ]).exec();
      return res.status(200).json({ message: 'Fetched all Submenus', data });
    } catch (error) { return log(error); }
  }

  export async function get_single_submenu(req: NextApiRequest, res: NextApiResponse){
    const id = (req.method === 'GET' ? req.query.id : req.body.id) as string;

    if (!id || !Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid or missing ID' });
    }
    
    const data = await SpatieSubmenu.findById(id).populate([ { path: "menusAttached", populate: { path: "menu_id", model: "SpatieMenu", select: "_id name" } }, { path: "permissionAttached", model: "SpatiePermission", select: "name status", }, { path: 'media_id' } ]).lean();
    
    const menuSubmenu = await MenuSubmenu.find({ submenu_id: id }).populate("menu_id", "name").lean().exec();
    const menuIds = menuSubmenu?.map(rp => rp.menu_id?._id).filter(Boolean);

    if (!data) { return res.status(404).json({ message: `Entry with ID ${id} not found` }); }

    return res.status(201).json({ message: 'Entry Fetched', data: { ...data, menu_ids: menuIds } });
  };
// Submenu

export async function get_admin_menu(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user_id = getUserIdFromToken(req);

    const userPermissions = await UserPermission.find({ user_id }).select("permission_id").lean();
    const permissionIds = userPermissions?.map(up => up.permission_id);
    const menus = await SpatieMenu.find({ status: true }).populate([ { path: "media_id", model: "Media", select: "path alt" }, { path: "submenusAttached", populate: { path: "submenu_id", model: "SpatieSubmenu", match: { status: true, permission_id: { $in: permissionIds } }, populate: [ { path: "media_id", model: "Media", select: "path alt" }, ] } }]).lean();

    const adminLinks = menus
      ?.map(menu => {
        const children = (menu.submenusAttached || [])
          ?.map((ms: SubmenuAttachedProps) => ms.submenu_id)
          .filter((submenu: any): submenu is SubmenuProps => Boolean(submenu))
          .map((sub: { name: any; url: any; media_id: { path: any; }; }) => ({
            name: sub.name,
            url: sub.url,
            media: sub.media_id?.path || null,
          }));

        if (children.length === 0) return null;

        return {
          name: menu.name,
          media: menu.media_id?.path || null,
          children
        };
      }).filter(Boolean);


      const userMenuRaw = await SpatieMenu.findOne({ name: 'User', status: true })
      .populate([
        { path: "media_id", model: "Media", select: "path alt" },
        {
          path: "submenusAttached",
          populate: {
            path: "submenu_id",
            model: "SpatieSubmenu",
            match: { status: true },
            populate: [{ path: "media_id", model: "Media", select: "path alt" }],
          }
        }
      ])
      .lean();

      const userMenu = userMenuRaw as unknown as SpatieMenuWithSubmenus;

      let userSubmenus: SimpleSubmenu[] = [];
      if (userMenu && userMenu.name) {
        userSubmenus = (userMenu.submenusAttached || [])
          .map(ms => ms.submenu_id)
          .filter((submenu): submenu is { _id: string; name: string; url: string; media_id?: { path?: string } } => Boolean(submenu))
          .map(sub => ({
            _id: sub._id,
            name: sub.name,
            url: sub.url,
            media: sub.media_id?.path || null,
          }));
      }

      return res.status(200).json({ message: 'Fetched User Menus', data : { adminLinks, userSubmenus } });
  } catch (error) { return log(error); }
}

export async function check_permission(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user_id = getUserIdFromToken(req);
    if (!user_id) return res.status(401).json({ message: 'Checked Permissions - Auth Missing', data: false });
    
    const url = req.query.url as string;
    if (!url) return res.status(400).json({ message: 'Checked Permissions - URL MIssing', data: false });
    
    if (url.includes('/user/')) {
      return res.status(200).json({ message: 'Auto-allowed because of /user/', data: true });
    }    
    
    const submenu = await SpatieSubmenu.findOne({ url });
    if (!submenu) return res.status(404).json({ message: 'Checked Permissions - Menu MIssing', data: false });

    const hasPermission = await UserPermission.findOne({ user_id: user_id, permission_id: submenu.permission_id });
    if (!hasPermission) { return res.status(403).json({ message: 'Permission Denied', data: false }); }

    return res.status(200).json({ message: 'Permission To Enter', data: true });
  } catch (error) { log(error); return res.status(500).json({ allowed: false }); }
}


const functions = {
  create_update_role,
  get_all_roles,
  get_single_role,

  create_update_permission,
  get_all_permissions,
  get_single_permission,
  
  get_all_users,
  get_single_user,
  create_update_user,

  create_update_menu,
  get_all_menus,
  get_single_menu,

  create_update_submenu,
  get_all_submenus,
  get_single_submenu,

  get_admin_menu,
  check_permission,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions);