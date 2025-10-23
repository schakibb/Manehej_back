import { Request } from "express";

// AdminRole enum - only ADMIN role
export enum AdminRole {
  ADMIN = "ADMIN",
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  data?: {
    admin: {
      id: string;
      name: string;
      email: string;
      role: AdminRole;
      is_active: boolean;
      last_login?: Date;
    };
    token: string;
  };
}

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
  last_login?: Date | null;
  created_at: Date;
  updated_at: Date;
}
export interface AdminProfileResponse {
  success: boolean;
  message: string;
  data?: AdminProfile;
}

export interface AdminChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface AdminUpdateProfileResponse {
  success: boolean;
  message: string;
  data?: Partial<AdminProfile>;
}

export interface AuthTokenPayload {
  admin_id: string;
  email: string;
  role: AdminRole;
}

export interface AuthenticatedRequest extends Request {
  admin?: {
    id: string;
    email: string;
    role: AdminRole;
  };
}
