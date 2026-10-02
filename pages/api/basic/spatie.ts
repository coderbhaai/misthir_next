import mongoose, { isValidObjectId, Types } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getDuplicateKeyErrorMessage,  logError, pivotEntry, safeParse } from '../utils';
import SpatiePermission from 'lib/models/spatie/SpatiePermission';
import SpatieRole from 'lib/models/spatie/SpatieRole';
import RolePermission from 'lib/models/spatie/RolePermission';
import UserRole from 'lib/models/spatie/UserRole';
import UserPermission from 'lib/models/spatie/UserPermission';
import User, { IUserProps } from 'lib/models/spatie/User';
import { createApiHandler } from '../apiHandler';
import { APIHandlers } from '../../../lib/server/middleware';
import { buildFilterQuery } from 'lib/server/plugins/buildFilterQuery';
import bcrypt from "bcryptjs";
import { AnyModel } from 'lib/models';
import { checkPermissionLogic, getUserIdFromToken } from 'pages/api/basic/auth';
import { getUsersWithRole } from 'services/userService';

export interface UserBasicInfo {
  _id: Types.ObjectId;
  name: string;
  email: string;
}

interface IPopulatedUser {
  _id: string;
  permissionsAttached?: Array<{
    permission_id?: {
      _id: string;
      name?: string;
    };
  }>;
  rolesAttached?: Array<{
    role_id?: {
      _id: string;
      name?: string;
    };
  }>;
}


export enum RoleName {
  OWNER = "Owner",
  ADMIN = "Admin",
  PARTNER = "Partner",
  SEO = "Seo",
  USER = "User",
  AMIT = "Amit",
}

export const ROLE_QUERY_FIELD_MAP: Partial<Record<string, string>> = {
  [RoleName.USER]: "user_id",
  [RoleName.AMIT]: "amit_id",
};

interface ScopeOptions {
  customFieldMap?: Partial<Record<string, string>>;
  bypassRoles?: string[];
}

export async function get_filtered_users(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { filters = {}, page = 0, limit = 10 } = req.body || {};
    const { role_id, permission_id, ...otherFilters } = filters;
    const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(otherFilters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["name", "email", "phone"], objectIdFields: ["_id"], booleanFields: ["status"]});
    
    const pipeline: any[] = [
      { $match: matchQuery },
      { $lookup: { from: "userroles", localField: "_id", foreignField: "user_id", as: "rolesAttached" } },
      { $lookup: { from: "spatieroles", localField: "rolesAttached.role_id", foreignField: "_id", as: "roles" } },
      { $lookup: { from: "userpermissions", localField: "_id", foreignField: "user_id", as: "permissionsAttached" } },
      { $lookup: { from: "spatiepermissions", localField: "permissionsAttached.permission_id", foreignField: "_id", as: "permissions" } },
    ];

    if (role_id && mongoose.Types.ObjectId.isValid(String(role_id))) {
      pipeline.push({ $match: { "roles._id": new mongoose.Types.ObjectId(String(role_id)) } });
    }

    if (permission_id && mongoose.Types.ObjectId.isValid(String(permission_id))) {
      pipeline.push({ $match: { "permissions._id": new mongoose.Types.ObjectId(String(permission_id)) } });
    }

    pipeline.push(
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          paginatedResults: [
            { $skip: skip },
            { $limit: safeLimit },
            { $lookup: { from: "staffs", localField: "_id", foreignField: "staff_id", as: "staffRelation" } },
            { $lookup: { from: "users", localField: "staffRelation.employer_id", foreignField: "_id", as: "employer_ids" } },
            { $lookup: { from: "staffs", localField: "_id", foreignField: "employer_id", as: "subordinateRelations" } },
            { $lookup: { from: "users", localField: "subordinateRelations.staff_id", foreignField: "_id", as: "staff_user_ids" } },
          ],
          totalCount: [{ $count: "count" }],
        },
      }
    );
    
    const result = await User.aggregate(pipeline);
    const data = result[0]?.paginatedResults ?? [];
    const total = result[0]?.totalCount?.[0]?.count ?? 0;

    return res.status(200).json({
      message: "Fetched Filtered Users",
      data,
      pagination: {
        total,
        page,
        limit: safeLimit,
        pages: Math.ceil(total / safeLimit),
      },
    });
  } catch (error) {
    await logError(error, { function: "get_filtered_users", payload: req.body });
    return res.status(500).json({ message: "Internal Server Error", data: null });
  }
}

export async function get_single_user(req: NextApiRequest, res: NextApiResponse) {
  try {
    const id = (req.method === "GET" ? req.query.id : req.body.id) as string;
    if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }

    const data = await User.findById(id)
      .populate({ path: "rolesAttached", populate: { path: "role_id", model: "SpatieRole", select: "_id name status" } })
      .populate({ path: "permissionsAttached", populate: { path: "permission_id", model: "SpatiePermission", select: "_id name" } })
      .lean();

    if (!data) { return res.status(404).json({ message: `Entry with ID ${id} not found` }); }
    
    const userRoles = await UserRole.find({ user_id: id }).populate("role_id", "name").lean<{ role_id?: { _id: any } }[]>()
    const rolesIds = userRoles.map((rp) => rp.role_id?._id).filter(Boolean);
    const userPermissions = await UserPermission.find({ user_id: id }).populate("permission_id", "name").lean<{ permission_id?: { _id: any } }[]>()
      .exec();
    const permissionIds = userPermissions.map((rp) => rp.permission_id?._id).filter(Boolean);

    return res.status(200).json({ message: 'Entry Fetched', data: { ...data, role_ids: rolesIds, permission_ids: permissionIds } });
  } catch (error) {
    await logError(error, { function: "get_single_user", payload: req.body });
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

  export async function create_update_user(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = req.body;
      const modelId = typeof data._id === 'string' || data._id instanceof Types.ObjectId ? data._id : null;
      if( !modelId && data.password !== data.confirm_password ){ return res.status(400).json({ message: 'Passwords Mismatch' }); }

      const child_role_array = safeParse(data.role_child);
      const child_permission_array = safeParse(data.permission_child);

      const email = data.email ? String(data.email).trim().toLowerCase() : undefined;

      if (modelId && isValidObjectId(modelId)) {
        try {
          const updated = await User.findByIdAndUpdate(modelId, {
            name: data.name,
            email,
            phone: data.phone,
            status: data.status,
            updatedAt: new Date(),
          }, { new: true });

          
          await pivotEntry( UserRole, updated._id, child_role_array, 'user_id', 'role_id' );
          await pivotEntry( UserPermission, updated._id, child_permission_array, 'user_id', 'permission_id' );
          return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
        } catch (error) { await logError(error, { function: "create_update_user", payload: req.body }); return res.status(500).json({ message: "Internal Server Error", data: null }); }
      }    
      
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const newEntry = new User({
        name: data.name,
        email,
        phone: data.phone,
        status: data.status,
        password: hashedPassword,
        createdAt: new Date(),
      });

      await newEntry.save();
      await pivotEntry( UserRole, newEntry._id, child_role_array, 'user_id', 'role_id' );
      await pivotEntry( UserPermission, newEntry._id, child_permission_array, 'user_id', 'permission_id' );
      return res.status(200).json({ message: '✅ Entry updated successfully', data: newEntry });
    } catch (error) { 
      await logError(error, { function: "create_update_user", payload: req.body }); 
      const duplicateMessage = getDuplicateKeyErrorMessage(error);
      if (duplicateMessage) { return res.status(400).json({ message: duplicateMessage, data: null }); }
      return res.status(500).json({ message: "Internal Server Error", data: null }); 
    }
  }

  export async function getUsersByRoleName(roleName: string): Promise<UserBasicInfo[]> {
    try{
      const role = await SpatieRole.findOne({ name: roleName }).select("_id name");
      if (!role) return [];
      const userLinks = await UserRole.find({ role_id: role._id }).select("user_id");
      const userIds = userLinks.map((link: { user_id: any; }) => link.user_id);
  
      if (!userIds.length) return [];
      const users = await User.find({ _id: { $in: userIds } }).select("_id name email").lean<UserBasicInfo[]>();
  
      return users;
    }catch (error) { await logError(error, { function: "getUsersByRoleName", payload: { roleName } }); return []; }
  }

  export async function get_user_options(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { search = "", limit = 20, role, selected_id } = req.body;
      let parsedRoles = role;
      if (typeof role === "string") {
        try {
          parsedRoles = JSON.parse(role);
        } catch (e) {
          parsedRoles = [role];
        }
      }

      let userIds: string[] | null = null;
      const roles = Array.isArray(parsedRoles) ? parsedRoles : (parsedRoles ? [parsedRoles] : []);

      if (roles.length) {
        const roleDocs = await SpatieRole.find({ name: { $in: roles } }).select("_id");
        const roleIds = roleDocs.map((r: { _id: any }) => r._id);
        const userRoles = await UserRole.find({ role_id: { $in: roleIds } }).select("user_id");
        userIds = userRoles.map((r: { user_id: any }) => String(r.user_id));
      }

      const filterQuery: any = {};

      if (search.trim()) {
        filterQuery.$or = [
          { name: { $regex: search.trim(), $options: "i" } },
          { email: { $regex: search.trim(), $options: "i" } },
          { phone: { $regex: search.trim(), $options: "i" } },
        ];
      }
      
      // If roles were specified but no users match those roles, return empty right away
      if (roles.length && (!userIds || userIds.length === 0)) {
        return res.status(200).json({ message: "Fetched all Users", data: [] });
      }

      if (userIds) {
        filterQuery._id = { $in: userIds };
      }

      let finalQuery: any = filterQuery;
      if (selected_id && isValidObjectId(selected_id)) {
        finalQuery = {
          $or: [{ _id: selected_id }, filterQuery],
        };
      }

      const data = await User.find(finalQuery).select("_id name email phone").limit(limit).lean();

      return res.status(200).json({ message: "Fetched all Users", data });
    } catch (error) {
      await logError(error, { function: "get_user_options", payload: req.body });
      return res.status(500).json({ message: "Internal Server Error", data: [] });
    }
  }
// User

// Roles
  export async function create_update_role(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = req.body;
      
      const child_array = safeParse(req.body.permission_child);
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

        if (!updated) { return res.status(404).json({ message: '❌ Entry not found for update' }); }
        return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
      }

      const newEntry = new SpatieRole({
        name: data.name,
        status: data.status,
      });

      await newEntry.save();
      await pivotEntry( RolePermission, newEntry._id, req.body.permissions, 'role_id', 'permission_id' );

      return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
    } catch (error) { await logError(error, { function: "create_update_role", payload: req.body }); return res.status(500).json({ message: "Internal Server Error", data: null }); }
  }

  export async function get_filtered_roles(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { filters = {}, page = 0, limit = 10 } = req.body || {};
      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(filters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["name"] });
      const total = await SpatieRole.countDocuments(matchQuery);

      const data = await SpatieRole.find(matchQuery ).populate([ { path: "permissionsAttached", populate: { path: "permission_id", model: "SpatiePermission", select: "_id name" } }]).skip(skip).limit(safeLimit).sort({ createdAt: -1 });
      return res.status(200).json({ message: 'Fetched all Roles', data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) } });
    } catch (error) { await logError(error, { function: "get_filtered_roles", payload: req.body }); return res.status(500).json({ message: "Internal Server Error", data: null }); }
  }

  export async function get_all_roles(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await SpatieRole.find().populate([ { path: "permissionsAttached", populate: { path: "permission_id", model: "SpatiePermission", select: "_id name" } }]).exec();
      return res.status(200).json({ message: 'Fetched all Roles', data });
    } catch (error) { await logError(error, { function: "get_all_roles", payload: req.body }); return res.status(500).json({ message: "Internal Server Error", data: null }); }
  }

  export async function get_selected_roles(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { roles } = req.body;
      let rolesFilter: string[] = [];
      if (Array.isArray(roles)) {
        rolesFilter = roles;
      } else if (typeof roles === "string") {
        rolesFilter = roles.split(",").map(i => i.trim());
      }
      if (rolesFilter.length === 0) { return res.status(200).json({ message: 'No target roles specified', data: [] }); }

      const data = await SpatieRole.find({ name: { $in: rolesFilter } }).populate([ { path: "permissionsAttached", populate: { path: "permission_id", model: "SpatiePermission", select: "_id name" } }]).exec();
      return res.status(200).json({ message: 'Fetched Roles', data });
    } catch (error) { await logError(error, { function: "get_selected_roles", payload: req.body }); return res.status(500).json({ message: "Internal Server Error", data: null }); }
  }

  export async function get_single_role(req: NextApiRequest, res: NextApiResponse) {
    try {
      const id = (req.method === "GET" ? req.query.id : req.body.id) as string;
      if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ message: 'Invalid or missing ID' }); }

      const data = await SpatieRole.findById(id).populate([ { path: "permissionsAttached", populate: { path: "permission_id", model: "SpatiePermission", select: "_id name" } } ]).lean();
      if (!data) { return res.status(404).json({ message: `Entry with ID ${id} not found` }); }

      const rolePermissions = await RolePermission.find({ role_id: id }).populate("permission_id", "name").lean<{ permission_id?: { _id: any } }[]>().exec();
      const permissionIds = rolePermissions?.map((rp) => rp.permission_id?._id).filter(Boolean);
      return res.status(200).json({ message: 'Entry Fetched', data: { ...data, permission_ids: permissionIds } });
    } catch (error) {
      await logError(error, { function: "get_single_role", payload: req.body });
      return res.status(500).json({ message: "Internal Server Error", data: null });
    }
  }
// Roles

// Permissions
  export async function create_update_permission(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = req.body;
      const child_array = safeParse(req.body.role_child);

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

        if (!updated) { return res.status(404).json({ message: '❌ Entry not found for update' }); }
        return res.status(200).json({ message: '✅ Entry updated successfully', data: updated });
      }

      const newEntry = new SpatiePermission({
        name: data.name,
        status: data.status,
      });

      await newEntry.save();

      await pivotEntry( RolePermission, newEntry._id, child_array, 'permission_id', 'role_id' );

      return res.status(201).json({ message: '✅ Entry created successfully', data: newEntry });
    } catch (error) { await logError(error, { function: "create_update_permission", payload: req.body }); return res.status(500).json({ message: "Internal Server Error", data: null }); }
  }

  export async function get_filtered_permissions(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { filters = {}, page = 0, limit = 10 } = req.body || {};
      const { role_id, ...otherFilters } = filters;

      const { matchQuery, skip, limit: safeLimit } = buildFilterQuery(otherFilters, { page, limit, defaultLimit: 10, maxLimit: 100, searchableFields: ["name"], });

      const pipeline: any[] = [
        { $match: matchQuery },
        { $sort: { createdAt: -1 } },
        { $lookup: { from: "rolepermissions", localField: "_id", foreignField: "permission_id", as: "rolesAttached" }, },
        { $lookup: { from: "spatieroles", localField: "rolesAttached.role_id", foreignField: "_id", as: "role_docs" }, },
        ...(role_id ? [ { $match: { "role_docs._id": new mongoose.Types.ObjectId(String(role_id)), }, }, ] : []),
        {
          $addFields: {
            rolesAttached: {
              $map: {
                input: "$rolesAttached",
                as: "ra",
                in: {
                  $mergeObjects: [
                    "$$ra",
                    {
                      role_id: {
                        $arrayElemAt: [
                          { $filter: { input: "$role_docs", as: "rd", cond: { $eq: ["$$rd._id", "$$ra.role_id"] } }, },
                          0,
                        ],
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        { $project: { role_docs: 0 } },
        {
          $facet: {
            paginatedResults: [{ $skip: skip }, { $limit: safeLimit }],
            totalCount: [{ $count: "count" }],
          },
        },
      ];

      const result = await SpatiePermission.aggregate(pipeline);
      const data = result[0]?.paginatedResults ?? [];
      const total = result[0]?.totalCount?.[0]?.count ?? 0;

      return res.status(200).json({ message: "Fetched Filtered Permissions", data, pagination: { total, page, limit: safeLimit, pages: Math.ceil(total / safeLimit) }, });
    } catch (error) { await logError(error, { function: "get_filtered_permissions", payload: req.body }); return res.status(500).json({ message: "Internal Server Error", data: null }); }
  }

  export async function get_all_permissions(req: NextApiRequest, res: NextApiResponse) {
    try {
      const data = await SpatiePermission.find().populate([ { path: 'rolesAttached', populate: { path: 'role_id', model: 'SpatieRole', select: '_id name' } } ]).exec();
      return res.status(200).json({ message: 'Fetched all Permissions', data });
    } catch (error) { await logError(error, { function: "get_all_permissions", payload: req.body }); return res.status(500).json({ message: "Internal Server Error", data: null }); }
  }

  export async function get_selected_permissions(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { permissions } = req.body;
      let permissionsFilter: string[] = [];
      if (Array.isArray(permissions)) {
        permissionsFilter = permissions;
      } else if (typeof permissions === "string") {
        permissionsFilter = permissions.split(",").map(i => i.trim());
      }
      if (permissionsFilter.length === 0) { return res.status(200).json({ message: 'No target permissions specified', data: [] }); }

      const data = await SpatiePermission.find({ name: { $in: permissionsFilter } }).populate([ { path: 'rolesAttached', populate: { path: 'role_id', model: 'SpatieRole', select: '_id name' } } ]).exec();
      return res.status(200).json({ message: 'Fetched all Permissions', data });
    } catch (error) { await logError(error, { function: "get_selected_permissions", payload: req.body }); return res.status(500).json({ message: "Internal Server Error", data: null }); }
  }

  export async function get_single_permission(req: NextApiRequest, res: NextApiResponse){
    try{
      const id = (req.method === "GET" ? req.query.id : req.body.id) as string;
  
      if (!id || !Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid or missing ID' });
      }
      
      const data = await SpatiePermission.findById(id).populate([ { path: "rolesAttached", populate: { path: "role_id", model: "SpatieRole", select: "_id name" } }]).lean();
      
      const rolePermissions = await RolePermission.find({ permission_id: id }).populate("role_id", "name").lean<{ role_id?: { _id: any } }[]>().exec();
      const rolesIds = rolePermissions?.map((rp) => rp.role_id?._id).filter(Boolean);
      if (!data) { return res.status(404).json({ message: `Entry with ID ${id} not found` }); }
  
      return res.status(201).json({ message: 'Entry Fetched', data: { ...data, role_ids: rolesIds } });
    }catch (error) { await logError(error, { function: "get_single_permission", payload: req.body }); return res.status(500).json({ message: "Internal Server Error", data: null }); }
  };
// Permissions

export async function check_permission(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await checkPermissionLogic(req, req.query.url as string);
    return res.status(result?.data ? 200 : 403).json(result);
  } catch (error) { await logError(error, { function: "check_permission", payload: req.body }); return res.status(500).json({ message: "Internal Server Error", data: null }); }
}

export async function get_user_permissions(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user_id = await getUserIdFromToken(req);
    if (!user_id) { return res.status(401).json({ message: "Auth Missing", data: [] }); }
    const user = await User.findById(user_id).populate({ path: "permissionsAttached", populate: { path: "permission_id", model: "SpatiePermission", select: "name" } })
      .populate({ path: "rolesAttached", populate: { path: "role_id", model: "SpatieRole", select: "name" } }).lean<IPopulatedUser | null>();

    const permissions = (user?.permissionsAttached || []).map((p) => p.permission_id?.name).filter(Boolean);
    return res.status(200).json({ message: "Fetched User Permissions", data: permissions });
  } catch (error) {
    await logError(error, { function: "get_user_permissions", payload: req.body });
    return res.status(500).json({ message: "Internal Server Error", data: [] });
  }
}

export async function getScopedFilters<T extends Record<string, any>>(req: NextApiRequest, filters: T, options: ScopeOptions = {}): Promise<{ filters: T; user_id: string | null; unauthorized?: boolean }> {
  try{
    const { customFieldMap = {}, bypassRoles = [RoleName.OWNER, RoleName.ADMIN, RoleName.AMIT] } = options;
  
    const user_id = await getUserIdFromToken(req);
    if (!user_id) { return { filters, user_id: null, unauthorized: true }; }
  
    const userRoleDocs = await UserRole.find({ user_id }).populate("role_id", "_id name").lean();
    const userRoles: string[] = userRoleDocs.map((r: any) => r.role_id?.name).filter(Boolean);
    
    const isBypassed = userRoles.some((role) => bypassRoles.includes(role));
    if (isBypassed) { return { filters: { ...filters }, user_id }; }
    const updatedFilters: Record<string, any> = { ...filters };
  
    for (const role of userRoles) {
      const targetField = customFieldMap[role] || ROLE_QUERY_FIELD_MAP[role];
      if (targetField) {
        updatedFilters[targetField] = user_id;
      }
    }
  
    return { filters: updatedFilters as T, user_id };
  } catch (error) {
    await logError(error, { function: "getScopedFilters", payload: req.body });
    return { filters, user_id: null, unauthorized: true };
  }
}

const MODEL_REGISTRY: Record<string, AnyModel> = {
};

export async function canUserAccessDocument(req: NextApiRequest, res: NextApiResponse, options: ScopeOptions = {}) {
  try {
    const { modelName, id } = req.body || {};
    if (!id || !Types.ObjectId.isValid(id)) { return res.status(400).json({ allowed: false, message: "Invalid or missing ID" }); }

    const targetModel = MODEL_REGISTRY[modelName];
    if (!targetModel) { return res.status(400).json({ allowed: false, message: "Invalid model name" }); }

    const { filters: scopedFilters, unauthorized } = await getScopedFilters(req, { _id: id }, options);
    if (unauthorized) { return res.status(401).json({ allowed: false, message: "Unauthorized token" }); }

    const count = await targetModel.countDocuments(scopedFilters);
    if (count === 0) { return res.status(403).json({ allowed: false, message: "Access Denied" }); }

    return res.status(200).json({ allowed: true, message: "Access Granted" });
  } catch (error) {
    await logError(error, { function: "canUserAccessDocument", payload: req.body });
    return res.status(500).json({ allowed: false, message: "Internal Server Error" });
  }
}

export async function getUsersIdByEmail(email: string): Promise<string> {
  try{
    const user = await User.findOne({ email: email }).lean<IUserProps>();  
    return String(user?._id);
  }catch (error) { await logError(error, { function: "getUsersIdByEmail", payload: { email } }); return ""; }
}

export async function get_filtered_user_by_role(req: NextApiRequest, res: NextApiResponse) {
  try {
    const roleArray = req.method === 'GET' ? req.query.role : req.body.role;

    if (!Array.isArray(roleArray) || roleArray.length === 0) { 
      return res.status(400).json({ message: 'Invalid or missing role array' }); 
    }

    const data = await getUsersWithRole(roleArray);

    return res.status(200).json({ message: `Fetched users with roles`, data });
  } catch (error) {
    return await logError(error, { function: "get_filtered_user_by_role", payload: req.body });
  }
}

export const functions: APIHandlers = {
  create_update_role : { middlewares: [ "checkUserId", "checkPostMethod", { name: "validateInput", options: { requiredFields: [ "name", "status" ] }} ] },
  get_filtered_roles : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  get_all_roles : { middlewares: [ "checkUserId", ] },
  get_selected_roles : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  get_single_role : { middlewares: [ "checkUserId", ] },
  
  create_update_permission : { middlewares: [ "checkUserId", "checkPostMethod", { name: "validateInput", options: { requiredFields: [ "name", "status" ] }} ] },
  get_all_permissions : { middlewares: [ "checkUserId", ] },
  get_filtered_permissions : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  get_selected_permissions : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  get_single_permission : { middlewares: [ "checkUserId", ] },
  
  get_filtered_users : { middlewares: [ ] },
  // "checkUserId", "checkPostMethod" 
  get_single_user : { middlewares: [ "checkUserId", ] },
  create_update_user : { middlewares: [ "checkUserId", "checkPostMethod", { name: "validateInput", options: { requiredFields: [ "name", "email", "phone" ] }} ] },
  get_user_options : { middlewares: [ "checkUserId", ] },
  
  check_permission : { middlewares: [ "checkUserId",  ] },
  get_user_permissions : { middlewares: [ "checkUserId",  ] },
  canUserAccessDocument : { middlewares: [ "checkUserId", "checkPostMethod" ] },
  get_filtered_user_by_role : { middlewares: ["checkUserId", "checkPostMethod"] },
}

export const spatieHandlers = {
  create_update_role,
  get_filtered_roles,
  get_all_roles,
  get_selected_roles,
  get_single_role,

  create_update_permission,
  get_filtered_permissions,
  get_all_permissions,
  get_single_permission,
  get_selected_permissions,
  
  get_filtered_users,
  get_single_user,
  create_update_user,
  get_user_options,

  check_permission,
  get_user_permissions,
  canUserAccessDocument,
  get_filtered_user_by_role,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions, spatieHandlers);