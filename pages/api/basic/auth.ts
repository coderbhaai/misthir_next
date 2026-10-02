import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { logError, pivotEntry } from "../utils";
import User from "lib/models/spatie/User";
import RolePermission from "lib/models/spatie/RolePermission";
import SpatieRole from "lib/models/spatie/SpatieRole";
import UserPermission from "lib/models/spatie/UserPermission";
import UserRole from "lib/models/spatie/UserRole";
import { createApiHandler } from "../apiHandler";
import { APIHandlers } from "../../../lib/server/middleware";
import { Types } from "mongoose";
import { IUserWithRelations } from "lib/models/types/User";
import ResetPassword from "lib/models/spatie/ResetPassword";
import { UserOtpMail } from "@amitkk/basic/mails/UserOtpMail";
import { IJwtPayload, IUser, JwtPayload } from "lib/models/types/User";
import Otp, { IOtp } from "lib/models/spatie/Otp";
import crypto from 'crypto';
import jwt from "jsonwebtoken";
import Menu from "lib/models/spatie/Menu";

interface PopulatedRole {
  _id: Types.ObjectId;
  name: string;
}

interface PopulatedPermission {
  _id: Types.ObjectId;
  name: string;
}

interface UserRolePopulated {
  role_id: PopulatedRole | null;
}

interface UserPermissionPopulated {
  permission_id: PopulatedPermission | null;
}

interface IPopulatedPermission {
  _id: Types.ObjectId;
  name: string;
}

interface RolePermissionPopulated {
  permission_id: IPopulatedPermission | null;
}

interface IRoleWithPermissions {
  _id: Types.ObjectId;
  name: string;
}

export async function login_via_email(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { email, password } = req.body;
    if (!email || !password) { return res.status(400).json({ message: "Email and password are required", data: null }); }

    const user = await User.findOne({ email });
    if (!user) { return res.status(401).json({ message: "Invalid credentials", data: null }); }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) { return res.status(401).json({ message: "Invalid credentials", data: null }); }

    const data = await generateAuthLoad(user._id);

    return res.status(200).json({ message: 'Welcome Aboard', data });
  } catch (error) { await logError(error, { function: "login_via_email", payload: req.body }); }
}

export async function generate_phone_otp(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { phone } = req.body;
    if ( !phone) { return res.status(400).json({ message: 'Phone required' }); }
    const otp = await createOtp({ type: "phone", phone, req });

    return res.status(200).json({ message: 'OTP Generated Successfully', data:true });
  } catch (error) { await logError(error, { function: "generate_phone_otp", payload: req.body }); }
}

export async function generate_email_otp(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.body;
  if (!email) { return res.status(400).json({ message: 'Email or phone required' }); }

  try {
    const otp = await createOtp({ type: "email", email, req });
    await UserOtpMail({ email, otp: otp.otp });

    return res.status(200).json({ message: 'OTP Generated Successfully', data:true });
  } catch (error) { await logError(error, { function: "generate_email_otp", payload: req.body }); }
}

export async function register_or_login_via_mobile(req: NextApiRequest, res: NextApiResponse) {  
  try {
    const { name, phone,  otp } = req.body; 

    let { role } = req.body;
    if (!role) { role = "User"; }

    const otpEntry = await Otp.findOne({ phone });
    if( !otpEntry ){ return res.status(400).json({ message: 'No OTP was Requested' }); }
    if (otpEntry.otp !== otp) { return res.status(400).json({ message: "Invalid OTP" }); }
    if (otpEntry.expiresAt < new Date()) { return res.status(400).json({ message: "OTP has expired" }); }

    const existingUserQuery = { $or: [] as Array<{ email?: string } | { phone?: string }> };
    if (phone) existingUserQuery.$or.push({ phone });
    const existingUser = await User.findOne(existingUserQuery);

    if (existingUser) {
      const user_data = await generateAuthLoad(existingUser._id);
      return res.status(200).json({ message: 'Welcome Aboard', data:user_data });
    }    

    const newUser = await User.create({
      name,
      phone,
      status : 1
    });
    
    await attachRoleAndPermissions(newUser._id, role);
    const user_registered_data = await generateAuthLoad(newUser._id);

    await Otp.deleteOne({ _id: otpEntry._id });

    return res.status(201).json({ message: 'Registration Successfully', data: user_registered_data });
  } catch (error) { await logError(error, { function: "register_or_login_via_mobile", payload: req.body }); }  
}

export async function register_via_email(req: NextApiRequest, res: NextApiResponse) {  
  try {
    const { name, email, phone, otp, password, confirm_password } = req.body; 
    if ( !name || !email || !phone || !otp || !password || !confirm_password ) { return res.status(400).json({ message: 'All fields are required' }); }
    if( password !== confirm_password ){ return res.status(400).json({ message: 'Passwords Mismatch' }); }
    
    let { role } = req.body;
    if (!role) { role = "User"; }
    
    const existingEmail = await User.findOne({ email });
    if (existingEmail) { return res.status(400).json({ message: 'Email already Registered' }); }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) { return res.status(400).json({ message: 'Phone already Registered' }); }

    const otpEntry = await Otp.findOne({ email });
    if( !otpEntry ){ return res.status(400).json({ message: 'No OTP was Requested' }); }
    if (otpEntry.otp !== otp) { return res.status(400).json({ message: "Invalid OTP" }); }
    if (otpEntry.expiresAt < new Date()) { return res.status(400).json({ message: "OTP has expired" }); }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      status: 1
    });

    await attachRoleAndPermissions(newUser._id, role);
    const user_data = await generateAuthLoad(newUser._id);

    await Otp.deleteOne({ _id: otpEntry._id });

    return res.status(201).json({ message: 'Registration successfully', data: user_data });
  } catch (error) { await logError(error, { function: "register_via_email", payload: req.body }); }  
}

export async function check_user_access(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user_id = await getUserIdFromToken(req);
    if (!user_id) { return res.status(401).json({ message: "Unauthorized" }); }

    const roles = await UserRole.find({ user_id }).populate("role_id", "_id name").lean();
    const permissions = await UserPermission.find({ user_id }).populate("permission_id", "_id name").lean();

    return res.status(200).json({ message: 'Welcome Aboard', data: { 
      roles: roles.map((r: any) => r.role_id),
      permissions: permissions.map((p: any) => p.permission_id),
    }});
  } catch (error) { await logError(error, { function: "check_user_access", payload: req.body }); }
}

export async function get_single_otp(req: NextApiRequest, res: NextApiResponse) {  
  try {
    const { id } = req.body;
    if ( !id ) { return res.status(400).json({ message: 'All fields are required' }); }

    const data = await Otp.findById(id);

    return res.status(201).json({ message: 'Single Entry Fetched', data });
  } catch (error) { await logError(error, { function: "get_single_otp", payload: req.body }); }  
}

export async function generateAuthLoad(user_id: string | Types.ObjectId): Promise<string | null> {
  try{

    const user = await User.findById(user_id)
    .populate({
      path: "rolesAttached",
      populate: { path: "role_id", model: "SpatieRole", select: "_id name" }
    })
    .populate({
      path: "permissionsAttached",
      populate: { path: "permission_id", model: "SpatiePermission", select: "_id name" }
    })
    .lean<IUserWithRelations>().exec();
  
    if (!user) return null;
    
    const roles =
      user.rolesAttached?.map((r: { role_id: { _id: { toString: () => any; }; name: any; }; }) => ({
        _id: r.role_id._id.toString(),
        name: r.role_id.name,
      })) || [];
  
    const permissions =
      user.permissionsAttached?.map((p: { permission_id: { _id: { toString: () => any; }; name: any; }; }) => ({
        _id: p.permission_id._id.toString(),
        name: p.permission_id.name,
      })) || [];
  
    const token = generateJWTToken(user, roles, permissions);
    return token;
  }catch (error) { await logError(error, { function: "generateAuthLoad", payload: {user_id} }); return null; } 
}

export async function attachRoleAndPermissions(user_id: Types.ObjectId, role?: string): Promise<void> {
  try {
    if (!user_id || !role) { return; }

    const roleData = await SpatieRole.findOne({ name: role }).populate([ { path: "permissionsAttached", populate: { path: "permission_id", model: "SpatiePermission", select: "_id name" } } ]).lean<IRoleWithPermissions>();

    if (roleData) {
      const rolePermissions = await RolePermission.find({ role_id: roleData._id }).populate<{ permission_id: IPopulatedPermission }>("permission_id", "name").lean<RolePermissionPopulated[]>().exec();
      const permissionIds = rolePermissions.map((rp) => rp.permission_id?._id).filter((id): id is Types.ObjectId => Boolean(id));

      await pivotEntry(UserRole, user_id, [roleData._id], "user_id", "role_id");
      await pivotEntry(UserPermission, user_id, permissionIds, "user_id", "permission_id");
    }
  } catch (error) { await logError(error, { function: "generateattachRoleAndPermissionsAuthLoad", payload: { user_id, role } }); }
}

export async function forgot_password(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { email } = req.body;
    if (!email) { return res.status(400).json({ message: 'Email or phone required' }); }
  
    const user = await User.findOne({ email })
    if (!user) { return res.status(400).json({ message: 'No User by this email found' }); }
    const otp = await createOtp({ type: "email", email, req });
    if( !otp ){ return res.status(400).json({ message: 'OTP Not Found' }); }
    
    const otpEntry = await Otp.findById( otp._id );
    if (!otpEntry) { return res.status(400).json({ message: 'OTP Entry Not Found' }); }
    
    const newUser = await ResetPassword.create({
      email,
      otp: otpEntry?.otp,
    });

    // await UserOtpMail( otp._id.toString() );

    return res.status(200).json({ message: 'OTP Generated Successfully', data:true });
  } catch (error) { await logError(error, { function: "forgot_password", payload: req.body }); }
}

export async function reset_password(req: NextApiRequest, res: NextApiResponse) {  
  try {
    const { email, otp, password, confirm_password } = req.body;
    if ( !email || !otp || !password || !confirm_password ) { return res.status(400).json({ message: 'Email and new password are  required' }); }
    if( password !== confirm_password ){ return res.status(400).json({ message: 'Passwords Mismatch' }); }
  
    const resetEntry = await ResetPassword.findOne({ email });
    if( !resetEntry ){ return res.status(400).json({ message: 'No Reset Password was Requested' }); }
    if (resetEntry.otp !== otp) { return res.status(400).json({ message: "Invalid OTP" }); }
    if (resetEntry.expiresAt < new Date()) { return res.status(400).json({ message: "OTP has expired" }); }
  
    const user = await User.findOne({ email })
    if (!user) { return res.status(400).json({ message: 'No User by this email found' }); }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save();
    await ResetPassword.deleteOne({ _id: resetEntry._id });
    await Otp.deleteOne({ email });

    return res.status(200).json({ message: 'Password reset successfully', data:true });
  } catch (error) { await logError(error, { function: "reset_password", payload: req.body }); }
}

// Functions
  export async function getUserIdFromToken(req: NextApiRequest): Promise<string | null> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) { return null; }

      const token = authHeader.split(" ")[1];
      if (!token) return null;

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

      return decoded?._id || null;
    } catch (error) { await logError(error, { function: "getUserIdFromToken", payload: req.body }); return null; }
  }

  export async function checkPermissionLogic(req: NextApiRequest, url?: string) {
    try {
      const user_id = await getUserIdFromToken(req);
      if (!user_id) return { message: 'Checked Permissions - Auth Missing', data: false };

      const finalUrl = url || (req.query.url as string);
      if (!finalUrl) return { message: 'Checked Permissions - URL Missing', data: false };

      if (finalUrl.includes('/user/')) {
        return { message: 'Auto-allowed because of /user/', data: true };
      }

      const menu = await Menu.findOne({ url: finalUrl });
      if (!menu) return { message: 'Checked Permissions - Menu Missing', data: false };

      const hasPermission = await UserPermission.findOne({
        user_id: user_id,
        permission_id: menu.permission_id,
      });

      if (!hasPermission) {
        return { message: 'Permission Denied', data: false };
      }

      return { message: 'Permission To Enter', data: true };
    } catch (error) { await logError(error, { function: "checkPermissionLogic", payload: req.body }); }
  }

  export function generateJWTToken(user: IUser, roles: { _id: string; name: string }[], permissions: { _id: string; name: string }[]): string {
    if (!process.env.JWT_SECRET) { throw new Error("JWT_SECRET is not defined in environment variables"); }

    const payload: IJwtPayload = {
      _id: user._id.toString(),
      name: user.name ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      roles,
      permissions,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
  }

  interface OtpPayload {
    type: string;
    email?: string;
    phone?: string;
    ttlMinutes?: number;
    req: NextApiRequest;
  }

  export async function createOtp({ type, email, phone, ttlMinutes = 5, req }: OtpPayload): Promise<IOtp> {
    const user_id = await getUserIdFromToken(req);
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    const deleteConditions: Record<string, any> = {};
    if (email) deleteConditions.email = email;
    if (phone) deleteConditions.phone = phone;
    if (user_id) deleteConditions.user_id = user_id;

    await Otp.deleteMany(deleteConditions);

    const entry = await Otp.create({
      type,
      email,
      phone,
      otp,
      expiresAt,
      ...(await user_id && { user_id }),
    });

    return entry;
  }
// Functions

export const functions: APIHandlers = {
  login_via_email : { middlewares: [ "checkPostMethod" ] },
  generate_phone_otp : { middlewares: [ "checkPostMethod" ] },
  generate_email_otp : { middlewares: [ "checkPostMethod" ] },
  register_or_login_via_mobile : { middlewares: [ "checkPostMethod" ] },
  register_via_email : { middlewares: [ "checkPostMethod" ] },
  check_user_access : { middlewares: [ "checkPostMethod" ] },
  get_single_otp : { middlewares: [ "checkPostMethod" ] },
  forgot_password : { middlewares: [ "checkPostMethod" ] },
  reset_password : { middlewares: [ "checkPostMethod" ] },
}

export const authHandlers = {
  login_via_email,
  generate_phone_otp,
  generate_email_otp,
  register_or_login_via_mobile,
  register_via_email,
  check_user_access,
  get_single_otp,
  forgot_password,
  reset_password,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions, authHandlers);