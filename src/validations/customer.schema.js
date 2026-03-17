import { z } from 'zod';
import { commonSchemas } from './common.schema';

/**
 * Customer specific validation schemas
 */
export const customerSchemas = {
    // Profile update
    updateProfile: z.object({
        full_name: z.string().trim().min(2, "Name is too short").max(100)
            .regex(/^[a-zA-Z\s.]*$/, "Name can only contain letters, spaces and dots").optional(),
        phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid 10-digit Indian phone number").optional(),
    }),

    // Support/Contact inquiry
    contactInquiry: z.object({
        name: z.string().trim()
            .min(1, "Full name is required")
            .pipe(z.string().min(2, "Name is too short").max(100)),
        email: z.string().trim()
            .min(1, "Work email is required")
            .pipe(z.string().email("Invalid email format")),
        message: z.string().trim()
            .min(1, "Message is required")
            .pipe(z.string().min(20, "Please provide more detail (min 20 characters)").max(2000)),
    }),

    // Address management
    address: commonSchemas.address,
};
