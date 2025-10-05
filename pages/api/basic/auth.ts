import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'; 
import connectDB from '../../lib/mongodb';
import { createOtp, generateJWTToken, getUserIdFromToken, log, pivotEntry } from "../utils";
import User from "lib/models/spatie/User";
import Otp from "lib/models/spatie/Otp";
import RolePermission from "lib/models/spatie/RolePermission";
import SpatieRole, { IRoleWithPermissions } from "lib/models/spatie/SpatieRole";
import UserPermission from "lib/models/spatie/UserPermission";
import UserRole from "lib/models/spatie/UserRole";
import { createApiHandler } from "../apiHandler";
import { APIHandlers } from "../middleware";
import { UserOtpMail } from "@amitkk/basic/mails/UserOtpMail";
import { Types } from "mongoose";
import { IUserWithRelations } from "lib/models/types/User";
import ResetPassword from "lib/models/spatie/ResetPassword";

export async function login_via_email(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") { return res.status(405).json({ message: "Method not allowed", data: null }); }

    const { email, password } = req.body;
    if (!email || !password) { return res.status(400).json({ message: "Email and password are required", data: null }); }

    const user = await User.findOne({ email });
    if (!user) { return res.status(401).json({ message: "Invalid credentials", data: null }); }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) { return res.status(401).json({ message: "Invalid credentials", data: null }); }

    const data = await generateAuthLoad(user._id);

    return res.status(200).json({ message: 'Welcome Aboard', data });
  } catch (error) { log(error); }
}

export async function generate_phone_otp(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') { return res.status(405).json({ message: 'Method not allowed' }); }

  const { phone } = req.body;
  if ( !phone) { return res.status(400).json({ message: 'Phone required' }); }

  try {
    const otp = await createOtp({ type: "phone", phone, req });

    return res.status(200).json({ message: 'OTP Generated Successfully', data:true });
  } catch (error) { log(error); }
}

export async function generate_email_otp(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') { return res.status(405).json({ message: 'Method not allowed' }); }

  const { email } = req.body;
  if (!email) { return res.status(400).json({ message: 'Email or phone required' }); }

  try {
    const otp = await createOtp({ type: "email", email, req });
    await UserOtpMail( otp._id.toString() );

    return res.status(200).json({ message: 'OTP Generated Successfully', data:true });
  } catch (error) { log(error); }
}

export async function register_or_login_via_mobile(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }
  
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
  } catch (error) { log(error); }  
}

export async function register_via_email(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }
  
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
  } catch (error) { log(error); }  
}

export async function check_user_access(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") { return res.status(405).json({ message: "Method not allowed", data: null }); }

    const user_id = getUserIdFromToken(req);
    if (!user_id) { return res.status(401).json({ message: "Unauthorized" }); }

    const roles = await UserRole.find({ user_id }).populate("role_id", "_id name").lean();
    const roleNames = roles.map(r => r.role_id?.name);

    const permissions = await UserPermission.find({ user_id }).populate("permission_id", "_id name").lean();
    const permissionNames = permissions.map((p) => p.permission_id?.name);

    return res.status(200).json({ message: 'Welcome Aboard', data: { roles: roleNames, permissions: permissionNames } });
  } catch (error) { log(error); }
}

export async function get_single_otp(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }
  
  try {
    const { id } = req.body;
    if ( !id ) { return res.status(400).json({ message: 'All fields are required' }); }

    const data = await Otp.findById(id);

    return res.status(201).json({ message: 'Single Entry Fetched', data });
  } catch (error) { log(error); }  
}

export async function generateAuthLoad(user_id: Types.ObjectId): Promise<string | null> {
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
    user.rolesAttached?.map(r => ({
      _id: r.role_id._id.toString(),
      name: r.role_id.name,
    })) || [];

  const permissions =
    user.permissionsAttached?.map(p => ({
      _id: p.permission_id._id.toString(),
      name: p.permission_id.name,
    })) || [];

  const token = generateJWTToken(user, roles, permissions);


  console.log("Token", token, user, roles, permissions )

  return token;
}

export async function attachRoleAndPermissions( user_id: Types.ObjectId, role?: string): Promise<void>{
  if (!user_id || !role ) { return; }

  const roleData = await SpatieRole.findOne({ name: role }).populate([{ path: "permissionsAttached", populate: { path: "permission_id", model: "SpatiePermission", select: "_id name" } }]).lean<IRoleWithPermissions>();
  
  if (roleData) {
    const rolePermissions = await RolePermission.find({ role_id: roleData._id }).populate("permission_id", "name").lean().exec();
    const permissionIds = rolePermissions.map(rp => rp.permission_id?._id).filter(Boolean);

    await pivotEntry(UserRole, user_id, [roleData._id], "user_id", "role_id");
    await pivotEntry(UserPermission, user_id, permissionIds, "user_id", "permission_id");
  }
}

export async function forgot_password(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') { return res.status(405).json({ message: 'Method not allowed' }); }

  const { email } = req.body;
  if (!email) { return res.status(400).json({ message: 'Email or phone required' }); }

  const user = await User.findOne({ email })
  if (!user) { return res.status(400).json({ message: 'No User by this email found' }); }

  try {
    const otp = await createOtp({ type: "email", email, req });
    if( !otp ){ return res.status(400).json({ message: 'OTP Not Found' }); }
    
    const otpEntry = await Otp.findById( otp._id );
    if (!otpEntry) { return res.status(400).json({ message: 'OTP Entry Not Found' }); }
    
    const newUser = await ResetPassword.create({
      email,
      otp: otpEntry?.otp,
    });

    await UserOtpMail( otp._id.toString() );

    return res.status(200).json({ message: 'OTP Generated Successfully', data:true });
  } catch (error) { log(error); }
}

export async function reset_password(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') { return res.status(405).json({ message: 'Method not allowed' }); }

  const { email, otp, password, confirm_password } = req.body;
  if ( !email || !otp || !password || !confirm_password ) { return res.status(400).json({ message: 'Email and new password are  required' }); }
  if( password !== confirm_password ){ return res.status(400).json({ message: 'Passwords Mismatch' }); }

  const resetEntry = await ResetPassword.findOne({ email });
  if( !resetEntry ){ return res.status(400).json({ message: 'No Reset Password was Requested' }); }
  if (resetEntry.otp !== otp) { return res.status(400).json({ message: "Invalid OTP" }); }
  if (resetEntry.expiresAt < new Date()) { return res.status(400).json({ message: "OTP has expired" }); }

  const user = await User.findOne({ email })
  if (!user) { return res.status(400).json({ message: 'No User by this email found' }); }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save();
    await ResetPassword.deleteOne({ _id: resetEntry._id });
    await Otp.deleteOne({ email });

    return res.status(200).json({ message: 'Password reset successfully', data:true });
  } catch (error) { log(error); }
}

export const functions: APIHandlers = {
  login_via_email : { middlewares: [] },
  generate_phone_otp : { middlewares: [] },
  generate_email_otp : { middlewares: [] },
  register_or_login_via_mobile : { middlewares: [] },
  register_via_email : { middlewares: [] },
  check_user_access : { middlewares: [] },
  get_single_otp : { middlewares: [] },
  forgot_password : { middlewares: [] },
  reset_password : { middlewares: [] },
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
export default createApiHandler(functions);