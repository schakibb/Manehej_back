// AdminRole enum - only ADMIN role
export enum AdminRole {
  ADMIN = 'ADMIN',
}

export interface AdminLoginRequest {
  email: string;
  password: string;
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

export interface AdminProfileResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    name: string;
    email: string;
    role: AdminRole;
    is_active: boolean;
    last_login?: Date;
    created_at: Date;
    updated_at: Date;
  };
}

export interface AdminUpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface AdminChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface AdminChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface AdminUpdateProfileResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    name: string;
    email: string;
    role: AdminRole;
    is_active: boolean;
    updated_at: Date;
  };
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
