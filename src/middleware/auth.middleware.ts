import { Response, NextFunction } from 'express';
import { verifyAccessToken, verifyRefreshToken, parseTimeToMs } from '../utils/jwt.utils';
import { AuthService } from '../services/auth.service';
import { AuthenticationError, AuthorizationError } from '../errors/custom.errors';
import { AuthenticatedRequest } from '../types/auth.types';
import { AdminRole } from '../types/auth.types';

// Authentication middleware to verify JWT tokens from cookies
export const authenticateAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    // Check if both tokens are missing
    if (!accessToken && !refreshToken) {
      throw new AuthenticationError('Access denied. Authentication required.');
    }

    try {
      // Try to verify access token first
      if (accessToken) {
        const decoded = verifyAccessToken(accessToken);
        req.admin = {
          id: decoded.admin_id,
          email: decoded.email,
          role: decoded.role,
        };
        return next();
      }
    } catch (accessTokenError) {
      // Access token is invalid or expired, will try refresh token
      // No need to log this as it's expected behavior
    }

    // Try to refresh using refresh token
    if (refreshToken) {
      try {
        // Verify refresh token first
        const decoded = verifyRefreshToken(refreshToken);
        
        // Generate new access token using the service
        const { accessToken: newAccessToken } = await AuthService.refreshToken(refreshToken);
        
        // Set new access token cookie
        const accessTokenMaxAge = process.env.ACCESS_TOKEN_MAX_AGE || '15m';
        const accessTokenMs = parseTimeToMs(accessTokenMaxAge);
        
        res.cookie('accessToken', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: accessTokenMs,
        });
        
        // Set admin info from refresh token payload
        req.admin = {
          id: decoded.admin_id,
          email: decoded.email,
          role: decoded.role,
        };
        
        return next();
      } catch (refreshTokenError) {
        // Both tokens are invalid
        throw new AuthenticationError('Session expired. Please login again.');
      }
    }

    throw new AuthenticationError('Access denied. Authentication required.');
  } catch (error) {
    next(error);
  }
};

// Authorization middleware to check admin roles
export const requireRole = (roles: AdminRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    try {
      if (!req.admin) {
        throw new AuthenticationError('Admin not authenticated');
      }

      if (!roles.includes(req.admin.role)) {
        throw new AuthorizationError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to require admin role
export const requireAdmin = requireRole([AdminRole.ADMIN]);

// Optional authentication middleware (doesn't throw error if no token)
export const optionalAuth = async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    if (!accessToken && !refreshToken) {
      // No tokens provided, continue without authentication
      return next();
    }

    try {
      // Try to verify access token first
      if (accessToken) {
        const decoded = verifyAccessToken(accessToken);
        req.admin = {
          id: decoded.admin_id,
          email: decoded.email,
          role: decoded.role,
        };
        return next();
      }
    } catch (accessTokenError) {
      // Access token is invalid or expired, will try refresh token
    }

    // Try to refresh using refresh token
    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        req.admin = {
          id: decoded.admin_id,
          email: decoded.email,
          role: decoded.role,
        };
      } catch (refreshTokenError) {
        // Both tokens are invalid, continue without authentication
      }
    }

    next();
  } catch (error) {
    // If any error occurs, continue without authentication
    next();
  }
};
