import rateLimit from "express-rate-limit";
import {
  GENERALE_RATE_LIMIT,
  LOGIN_RATE_LIMIT,
  PASSWORD_RATE_LIMIT,
} from "../constants/config.constants";

export const generalLimiter = rateLimit(GENERALE_RATE_LIMIT);
export const passwordChangeLimiter = rateLimit(PASSWORD_RATE_LIMIT);
export const loginLimiter = rateLimit(LOGIN_RATE_LIMIT);
