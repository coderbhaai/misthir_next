

export interface PermissionRoleItem {
  _id: string;
  permission_id: string;
  role_id?: {
    _id: string;
    name: string;
  } | null;
}

export interface RolePermissionItem {
  _id: string;
  role_id: string;
  permission_id?: {
    _id: string;
    name: string;
  } | null;
}


export interface SinglePermissionProps {
  _id: string;
  name: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
  roles?:String[],
  rolesAttached?: PermissionRoleItem[];
  role_child?: string;
}

export interface SingleRoleProps {
  name: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
  _id: string;
  permissions?:String[],
  permissionsAttached?: RolePermissionItem[];
  selectedPermissions?: string[],
  permission_child?: string,
}