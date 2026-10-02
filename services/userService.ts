
import User from "lib/models/spatie/User";
import { PipelineStage } from "mongoose";
import { logError } from "pages/api/utils";

export async function getUsersWithRole(roleNames: string[]) {
  try {
    const pipeline: PipelineStage[] = [
      { $lookup: { from: "userroles", localField: "_id", foreignField: "user_id", as: "rolesAttached" } },
      { $lookup: { from: "spatieroles", localField: "rolesAttached.role_id", foreignField: "_id", as: "roles" } },
      { $lookup: { from: "userpermissions", localField: "_id", foreignField: "user_id", as: "permissionsAttached" } },
      { $lookup: { from: "spatiepermissions", localField: "permissionsAttached.permission_id", foreignField: "_id", as: "permissions" } },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          phone: 1,
          status: 1,
          createdAt: 1,
          roles: { _id: 1, name: 1, status: 1 },
          permissions: { _id: 1, name: 1 },
        },
      },
    ];
  
    if (roleNames && roleNames.length > 0) {
      const regexRoles = roleNames.map(r => new RegExp(`^${r}$`, 'i'));
      pipeline.push({ $match: { "roles.name": { $in: regexRoles } } });
    }
  
    return await User.aggregate(pipeline).exec();
  } catch (error) { 
    return await logError(error, { function: "getUsersWithRole", payload: { roleNames } }); 
  }
}

export async function getUserModule(roleName?: string) {
  try {
    const pipeline: PipelineStage[] = [
      { $lookup: { from: "userroles", localField: "_id", foreignField: "user_id", as: "rolesAttached", } },
      { $lookup: { from: "spatieroles", localField: "rolesAttached.role_id", foreignField: "_id", as: "roles", } },
    ];

    if (roleName) {
      pipeline.push({ $match: { "roles.name": roleName } });
    }

    pipeline.push({ $project: { _id: 1, name: 1 } });

    return await User.aggregate(pipeline).exec();
  } catch (error) { return await logError(error, { function: "getUserModule", payload: {roleName} }); }
}
