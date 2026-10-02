import { PermissionRoleItem, RolePermissionItem } from "./spatie";

export interface UserRelationProps {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface UserProps {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  confirm_password?: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
  permissions?:{ _id: string; name: string }[];
  roles?:{ _id: string; name: string }[];
  permissionsAttached?: RolePermissionItem[];
  rolesAttached?: PermissionRoleItem[];
  role_child?: string;
  permission_child?: string;

  employer_ids?: UserRelationProps[];
  staff_user_ids?: UserRelationProps[];
}

export interface UserRowProps {
  _id: string;
  name: string;
  email: string;
  phone: string;
}