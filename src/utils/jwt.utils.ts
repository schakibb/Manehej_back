import jwt, { SignOptions } from 'jsonwebtoken';
import { AuthTokenPayload } from '../types/auth.types';

// Type for JWT expiry values
type JWTExpiry = `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'y'}`;

// Utility function to parse time strings to milliseconds
export const parseTimeToMs = (timeString: string | undefined): number => {
  const time = timeString || '7d'; // Default fallback
  const timeRegex = /^(\d+)([smhd])$/;
  const match = time.match(timeRegex);
  
  if (!match) {
    throw new Error(`Invalid time format: ${time}. Use format like '15m', '7d', '1h', '30s'`);
  }
  
  const value = parseInt(match[1]!);
  const unit = match[2]!;
  
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: throw new Error(`Invalid time unit: ${unit}`);
  }
};

// Validate environment variables
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET) {
  throw new Error('ACCESS_TOKEN_SECRET environment variable is required');
}

if (!REFRESH_TOKEN_SECRET) {
  throw new Error('REFRESH_TOKEN_SECRET environment variable is required');
}

if (ACCESS_TOKEN_SECRET.length < 32) {
  throw new Error('ACCESS_TOKEN_SECRET must be at least 32 characters long');
}

if (REFRESH_TOKEN_SECRET.length < 32) {
  throw new Error('REFRESH_TOKEN_SECRET must be at least 32 characters long');
}

export const createAccessToken = (payload: AuthTokenPayload): string => {
  const expiresIn = (process.env.ACCESS_TOKEN_EXPIRY || '15m') as JWTExpiry;
  const options: SignOptions = {
    expiresIn,
    algorithm: 'HS256',
    issuer: 'manehej-admin-platform',
  };
  
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, options);
};

export const createRefreshToken = (payload: AuthTokenPayload): string => {
  const expiresIn = (process.env.REFRESH_TOKEN_EXPIRY || '7d') as JWTExpiry;
  const options: SignOptions = {
    expiresIn,
    algorithm: 'HS256',
    issuer: 'manehej-admin-platform',
  };
  
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, options);
};

export const verifyAccessToken = (token: string): AuthTokenPayload => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as AuthTokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token: string): AuthTokenPayload => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as AuthTokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};
