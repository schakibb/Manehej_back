import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccessResponse, sendErrorResponse } from '../utils/response.utils';
import { validateRequest } from '../utils/validation.utils';
import { adminLoginSchema, adminUpdateProfileSchema, adminChangePasswordSchema } from '../utils/validation.utils';
import { AppError } from '../errors/custom.errors';
import { AuthenticatedRequest } from '../types/auth.types';
import { parseTimeToMs } from '../utils/jwt.utils';

export class AuthController {
  // Admin login
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request data
      const validatedData = validateRequest(adminLoginSchema, req.body);

      // Extract IP address and device info
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const deviceInfo = req.get('User-Agent') || 'unknown';

      // Authenticate admin
      const result = await AuthService.login(validatedData, ipAddress, deviceInfo);

      // Set HTTP-only cookies
      const accessTokenMaxAge = process.env.ACCESS_TOKEN_MAX_AGE || "15m";
      const refreshTokenMaxAge = process.env.REFRESH_TOKEN_MAX_AGE || "7d";

      // Convert time strings to milliseconds
      const accessTokenMs = parseTimeToMs(accessTokenMaxAge);
      const refreshTokenMs = parseTimeToMs(refreshTokenMaxAge);

      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: accessTokenMs,
      });

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: refreshTokenMs,
      });

      sendSuccessResponse(res, result.admin, 'Login successful', 200);
    } catch (error) {
      next(error);
    }
  }

  // Get admin profile
  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.admin) {
        throw new Error('Admin not authenticated');
      }

      const result = await AuthService.getProfile(req.admin.id);
      sendSuccessResponse(res, result.data, result.message);
    } catch (error) {
      next(error);
    }
  }

  // Update admin profile
  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.admin) {
        throw new Error('Admin not authenticated');
      }

      // Validate request data
      const validatedData = validateRequest(adminUpdateProfileSchema, req.body);

      const result = await AuthService.updateProfile(req.admin.id, validatedData);
      sendSuccessResponse(res, result.data, result.message);
    } catch (error) {
      next(error);
    }
  }

  // Change admin password
  static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.admin) {
        throw new Error('Admin not authenticated');
      }

      // Validate request data
      const validatedData = validateRequest(adminChangePasswordSchema, req.body);

      const result = await AuthService.changePassword(req.admin.id, validatedData);
      sendSuccessResponse(res, null, result.message);
    } catch (error) {
      next(error);
    }
  }

  // Admin logout
  static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract refresh token from cookies
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }

      await AuthService.logout(refreshToken);

      // Clear cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      sendSuccessResponse(res, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  // Refresh token
  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract refresh token from cookies
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }

      // Generate new access token
      const { accessToken } = await AuthService.refreshToken(refreshToken);

      // Set new access token cookie
      const accessTokenMaxAge = process.env.ACCESS_TOKEN_MAX_AGE || "15m";
      const accessTokenMs = parseTimeToMs(accessTokenMaxAge);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: accessTokenMs,
      });

      sendSuccessResponse(res, { accessToken }, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  // Get current admin info (middleware helper)
  static async getCurrentAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.admin) {
        throw new Error('Admin not authenticated');
      }

      const result = await AuthService.getProfile(req.admin.id);
      sendSuccessResponse(res, result.data, result.message);
    } catch (error) {
      next(error);
    }
  }
}
