import { Types } from "mongoose";

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

export interface IUserWithRelations extends IUser {
  role_id?: { _id: Types.ObjectId; name: string } | { _id: Types.ObjectId; name: string }[];
  permission_id?: { _id: Types.ObjectId; name: string } | { _id: Types.ObjectId; name: string }[];
}

export interface IJwtPayload {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  roles: { _id: string; name: string }[];
  permissions: { _id: string; name: string }[];
}

export interface IUserRegisteredData {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  token: string;
  roles: { _id: string; name: string }[];
  permissions: { _id: string; name: string }[];
}