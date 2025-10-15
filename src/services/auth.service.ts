import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password.utils';
import { createAccessToken, createRefreshToken } from '../utils/jwt.utils';
import { NotFoundError, AuthenticationError, ValidationError, ConflictError } from '../errors/custom.errors';
import { 
  AdminLoginRequest, 
  AdminLoginResponse, 
  AdminProfileResponse, 
  AdminUpdateProfileRequest, 
  AdminUpdateProfileResponse,
  AdminChangePasswordRequest,
  AdminChangePasswordResponse,
  AdminRole
} from '../types/auth.types';

const prisma = new PrismaClient();

export class AuthService {
  // Admin login
  static async login(loginData: AdminLoginRequest, ipAddress?: string, deviceInfo?: string): Promise<{ admin: any; accessToken: string; refreshToken: string }> {
    const { email, password } = loginData;

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!admin) {
      throw new AuthenticationError('Invalid email or password');
    }

    if (!admin.is_active) {
      throw new AuthenticationError('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, admin.password_hash);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { last_login: new Date() },
    });

    // Generate access and refresh tokens
    const tokenPayload = {
      admin_id: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const accessToken = createAccessToken(tokenPayload);
    const refreshToken = createRefreshToken(tokenPayload);

    // Hash the refresh token for storage
    const refreshTokenHash = await hashPassword(refreshToken);
    
    // Create session with refresh token
    await prisma.adminSession.create({
      data: {
        admin_id: admin.id,
        token_hash: refreshTokenHash,
        ip_address: ipAddress,
        device_info: deviceInfo,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        is_active: admin.is_active,
        last_login: admin.last_login,
      },
      accessToken,
      refreshToken,
    };
  }

  // Get admin profile
  static async getProfile(adminId: string): Promise<AdminProfileResponse> {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        last_login: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!admin) {
      throw new NotFoundError('Admin not found');
    }

    return {
      success: true,
      message: 'Profile retrieved successfully',
      data: admin,
    };
  }

  // Update admin profile
  static async updateProfile(adminId: string, updateData: AdminUpdateProfileRequest): Promise<AdminUpdateProfileResponse> {
    const { name, email } = updateData;

    // Check if admin exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!existingAdmin) {
      throw new NotFoundError('Admin not found');
    }

    // Check if email is already taken by another admin
    if (email && email !== existingAdmin.email) {
      const emailExists = await prisma.admin.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (emailExists) {
        throw new ConflictError('Email already exists');
      }
    }

    // Update admin
    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: {
        ...(name && { name }),
        ...(email && { email: email.toLowerCase() }),
        updated_at: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        updated_at: true,
      },
    });

    return {
      success: true,
      message: 'Profile updated successfully',
      data: updatedAdmin,
    };
  }

  // Change admin password
  static async changePassword(adminId: string, passwordData: AdminChangePasswordRequest): Promise<AdminChangePasswordResponse> {
    const { current_password, new_password } = passwordData;

    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new NotFoundError('Admin not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(current_password, admin.password_hash);
    if (!isCurrentPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(new_password);
    if (!passwordValidation.isValid) {
      throw new ValidationError(passwordValidation.message || 'Invalid password');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(new_password);

    // Update password
    await prisma.admin.update({
      where: { id: adminId },
      data: {
        password_hash: newPasswordHash,
        updated_at: new Date(),
      },
    });

    // Invalidate all existing sessions except current one
    await prisma.adminSession.updateMany({
      where: {
        admin_id: adminId,
        is_active: true,
      },
      data: {
        is_active: false,
      },
    });

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  // Refresh token
  static async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    // Find session by refresh token hash
    const refreshTokenHash = await hashPassword(refreshToken);
    const session = await prisma.adminSession.findFirst({
      where: {
        token_hash: refreshTokenHash,
        is_active: true,
        expires_at: {
          gt: new Date(),
        },
      },
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            role: true,
            is_active: true,
          },
        },
      },
    });

    if (!session || !session.admin.is_active) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    // Generate new access token
    const accessToken = createAccessToken({
      admin_id: session.admin.id,
      email: session.admin.email,
      role: session.admin.role,
    });

    return { accessToken };
  }

  // Logout (invalidate session)
  static async logout(refreshToken: string): Promise<void> {
    const refreshTokenHash = await hashPassword(refreshToken);
    await prisma.adminSession.updateMany({
      where: {
        token_hash: refreshTokenHash,
        is_active: true,
      },
      data: {
        is_active: false,
      },
    });
  }

  // Verify admin session
  static async verifySession(tokenHash: string): Promise<{ adminId: string; email: string; role: AdminRole } | null> {
    const session = await prisma.adminSession.findFirst({
      where: {
        token_hash: tokenHash,
        is_active: true,
        expires_at: {
          gt: new Date(),
        },
      },
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            role: true,
            is_active: true,
          },
        },
      },
    });

    if (!session || !session.admin.is_active) {
      return null;
    }

    // Update last used timestamp
    await prisma.adminSession.update({
      where: { id: session.id },
      data: { last_used_at: new Date() },
    });

    return {
      adminId: session.admin.id,
      email: session.admin.email,
      role: session.admin.role,
    };
  }

  // Clean up expired sessions
  static async cleanupExpiredSessions(): Promise<void> {
    await prisma.adminSession.deleteMany({
      where: {
        expires_at: {
          lt: new Date(),
        },
      },
    });
  }
}