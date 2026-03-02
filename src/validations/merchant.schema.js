import { z } from "zod";

/**
 * Common strict email validation
 */
const emailSchema = z
    .string()
    .trim()
    .min(1, "Email is required")
    .pipe(
        z.string()
            .toLowerCase()
            .email("Invalid email format")
            .refine(val => {
                const parts = val.split('@');
                if (parts.length !== 2) return false;
                const domain = parts[1];
                return domain.includes('.') && domain.split('.').pop().length >= 2;
            }, "Please enter a valid domain (e.g., .com, .in)")
    );


/**
 * Corporate/Business Email Schema (Blocks public providers)
 */
const PUBLIC_DOMAINS = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
    'mail.com', 'icloud.com', 'protonmail.com', 'aol.com'
];

const corporateEmailSchema = emailSchema.refine(val => {
    const domain = val.split('@')[1];
    return !PUBLIC_DOMAINS.includes(domain);
}, "Please use a business email address. Public domains like @mail.com are not allowed for merchant profiles.");


/**
 * Merchant & Store related validation schemas for the Frontend
 */
export const merchantSchemas = {
    // Merchant Application Schema
    apply: z.object({
        store_name: z
            .string()
            .trim()
            .min(1, "Store name is required")
            .pipe(
                z.string()
                    .min(3, "Store name must be at least 3 characters")
                    .max(50, "Store name cannot exceed 50 characters")
                    .regex(/^[a-zA-Z0-9\s&'-]*$/, "Store name contains invalid characters")
                    .refine((val) => /[a-zA-Z]/.test(val), "Store name must contain at least one letter")
            ),

        store_slug: z.string().optional(),

        description: z
            .string()
            .trim()
            .min(1, "Store description is required")
            .pipe(
                z.string()
                    .min(20, "Please provide a more detailed description (min 20 chars)")
                    .max(1000, "Description is too long (max 1000 chars)")
            ),

        business_email: emailSchema,

        business_phone: z
            .string()
            .trim()
            .min(1, "Business phone is required")
            .pipe(
                z.string()
                    .length(10, "Phone number must be exactly 10 digits")
                    .regex(/^[6-9][0-9]{9}$/, "Phone must be a valid Indian number")
            ),

        address: z.object({
            line1: z.string().trim()
                .min(1, "Address Line 1 is required")
                .pipe(z.string().min(5, "Address Line 1 is too short")),
            line2: z.string().trim().optional(),
            city: z.string().trim()
                .min(1, "City is required")
                .pipe(
                    z.string()
                        .min(2, "Invalid city name")
                        .regex(/^[a-zA-Z\s]*$/, "City name can only contain letters and spaces")
                ),
            state: z.string().trim()
                .min(1, "State is required")
                .pipe(
                    z.string()
                        .min(2, "Invalid state name")
                        .regex(/^[a-zA-Z\s]*$/, "State name can only contain letters and spaces")
                ),
            pincode: z.string().trim()
                .min(1, "Pin code is required")
                .pipe(
                    z.string()
                        .length(6, "Pin code must be exactly 6 digits")
                        .regex(/^[1-9][0-9]{5}$/, "Invalid Indian pincode")
                ),
            country: z.string().default("India"),
        }),
    }),
};
