import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'; 
import connectDB from '../../lib/mongodb';
import { generateJWTToken, getUserIdFromToken, log, pivotEntry } from "../utils";
import User from "lib/models/spatie/User";
import Otp from "lib/models/spatie/Otp";
import crypto from 'crypto';
import RolePermission from "lib/models/spatie/RolePermission";
import SpatieRole, { IRoleWithPermissions } from "lib/models/spatie/SpatieRole";
import UserPermission from "lib/models/spatie/UserPermission";
import UserRole from "lib/models/spatie/UserRole";
import { createApiHandler } from "../apiHandler";
import { APIHandlers } from "../middleware";

export async function login(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") { return res.status(405).json({ message: "Method not allowed", data: null }); }

    const { email, password } = req.body;
    if (!email || !password) { return res.status(400).json({ message: "Email and password are required", data: null }); }

    const user = await User.findOne({ email });
    if (!user) { return res.status(401).json({ message: "Invalid credentials", data: null }); }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) { return res.status(401).json({ message: "Invalid credentials", data: null }); }
    
    const token = generateJWTToken(user);

    const data = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      token: token,
    }

    return res.status(200).json({ message: 'Welcome Aboard', data });
  } catch (error) { log(error); }
}

export async function register(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }
  
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) { return res.status(400).json({ message: 'All fields are required' }); }

    const existingUser = await User.findOne({ email });
    if (existingUser) { return res.status(400).json({ message: 'Email already registered' }); }

    const hashedPassword = await bcrypt.hash(password, 10);

    const entry = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    return res.status(201).json({ message: 'Registration successfully', data: entry });
  } catch (error) { log(error); }  
}

export async function reset_password(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') { return res.status(405).json({ message: 'Method not allowed' }); }

  const { email } = req.body;

  if (!email ) {
    return res.status(400).json({ message: 'Email and new password are required' });
  }

  try {
    const mongoose = await connectDB();
    // const db = mongoose.connection;

    // const hashedPassword = await bcrypt.hash(newPassword, 10);

    // const result = await db.collection('users').updateOne(
    //   { email },
    //   { $set: { password: hashedPassword } }
    // );

    // if (result.matchedCount === 0) {
    //   return res.status(404).json({ message: 'User not found' });
    // }

    return res.status(200).json({ message: 'Password reset successfully', data:true });
  } catch (error) { log(error); }
}

export async function generate_otp(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') { return res.status(405).json({ message: 'Method not allowed' }); }

  const { email, phone } = req.body;
  const user_id = getUserIdFromToken(req);

  if (!email && !phone) { return res.status(400).json({ message: 'Email or phone required' }); }

  try {
    const otp = crypto.randomInt(100000, 999999).toString();
    // const otp = "525205";
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const deleteConditions: any = {};
    if (email) deleteConditions.email = email;
    if (phone) deleteConditions.phone = phone;
    
    await Otp.deleteMany(deleteConditions);

    const otpRecord = await Otp.create({
      type: email && phone ? 'both' : email ? 'email' : 'phone',
      ...(email && { email }),
      ...(phone && { phone }),
      otp,
      expiresAt,
      ...(user_id && { user_id: user_id }),
    });

    return res.status(200).json({ message: 'OTP Generated Successfully', data:true });
  } catch (error) { log(error); }
}

export async function register_or_login(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') { return res.status(405).json({ message: 'Method Not Allowed' }); }
  
  try {
    const { name, email, phone,  otp } = req.body; 
    if ( !otp ) { return res.status(400).json({ message: 'All fields are required' }); }
    if (!email && !phone) { return res.status(400).json({ message: 'Email or phone number is required' }); }

    let { role } = req.body;
    if (!role) { role = "User"; }

    const existingUserQuery = { $or: [] as Array<{ email?: string } | { phone?: string }> };
    if (email) existingUserQuery.$or.push({ email });
    if (phone) existingUserQuery.$or.push({ phone });
    const existingUser = await User.findOne(existingUserQuery);

    if (existingUser) {
      const user_data = {
        _id: existingUser._id.toString(),
        name: existingUser.name,
        email: existingUser.email,
        phone: existingUser.phone,
      }

      const token = generateJWTToken(user_data);
      const userWithToken = { ...user_data, token };

      return res.status(200).json({ message: 'Welcome Aboard', data:userWithToken });
    }

    const roleData = await SpatieRole.findOne({ name: role }).populate([{ path: "permissionsAttached", populate: { path: "permission_id", model: "SpatiePermission", select: "_id name" } }]).lean<IRoleWithPermissions>();

    const newUser = await User.create({
      name,
      email,
      phone,
    });
    
    const token = generateJWTToken(newUser);
    const user_registered_data = {
      _id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      token: token,
    }

    if (roleData) { 
      const rolePermissions = await RolePermission.find({ role_id: roleData?._id }).populate("permission_id", "name").lean().exec();
      const permissionIds = rolePermissions.map(rp => rp.permission_id?._id).filter(Boolean);      
      
      await pivotEntry( UserRole,  newUser._id, [roleData._id], 'user_id', 'role_id');
      await pivotEntry( UserPermission, newUser._id, permissionIds, 'user_id', 'permission_id' );
    }

    return res.status(201).json({ message: 'Registration successfully', data: user_registered_data });
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

export const functions: APIHandlers = {
  login : { middlewares: [] },
  register : { middlewares: [] },
  reset_password : { middlewares: [] },
  generate_otp : { middlewares: [] },
  register_or_login : { middlewares: [] },
  check_user_access : { middlewares: [] },
}

export const authHandlers = {
  login,
  register,
  reset_password,
  generate_otp,
  register_or_login,
  check_user_access,
};

export const config = { api: { bodyParser: false } };
export default createApiHandler(functions);