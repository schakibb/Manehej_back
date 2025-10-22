import { Options } from "express-rate-limit";
import ENV from "../validation/env.validation";

export const isDevelopment = ENV.NODE_ENV === "development";

export const PASSWORD_RATE_LIMIT: Partial<Options> = {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password change attempts per hour
  message: {
    success: false,
    message: "Too many password change attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
};

export const GENERALE_RATE_LIMIT: Partial<Options> = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
};

export const LOGIN_RATE_LIMIT: Partial<Options> = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many login attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
};
