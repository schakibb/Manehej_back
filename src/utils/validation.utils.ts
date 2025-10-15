import { z } from 'zod';

// Admin login validation schema
export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

// Admin profile update validation schema
export const adminUpdateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name too long').optional(),
  email: z.string().email('Invalid email format').optional(),
});

// Admin change password validation schema
export const adminChangePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'New password must be at least 8 characters'),
  confirm_password: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "New password and confirm password don't match",
  path: ["confirm_password"],
});

export const validateRequest = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors.map(err => err.message).join(', '));
    }
    throw error;
  }
};
