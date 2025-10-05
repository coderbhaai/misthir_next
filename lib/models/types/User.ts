import { Types } from "mongoose";
import { IUserProps } from "../spatie/User";

export interface JwtPayload {
  user_id: string;
  [key: string]: any;
}

export interface IUser {
  _id: Types.ObjectId;
  name?: string;
  email?: string;
  phone?: string;
}

export interface IUserWithRelations extends IUserProps {
  rolesAttached?: {
    role_id: { _id: Types.ObjectId; name: string };
  }[];
  permissionsAttached?: {
    permission_id: { _id: Types.ObjectId; name: string };
  }[];
}

export interface IJwtPayload {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  roles: { _id: string; name: string }[];
  permissions: { _id: string; name: string }[];
}