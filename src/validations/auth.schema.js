import { z } from "zod";

/**
 * Common Email Schema
 */
const emailSchema = z
    .string()
    .trim()
    .min(1, "Email is required")
    .pipe(
        z.string()
            .toLowerCase()
            .max(255, "Email is too long")
            .email("Invalid email format")
            .refine(val => {
                const parts = val.split('@');
                if (parts.length !== 2) return false;
                const domain = parts[1];
                return domain.includes('.') && domain.split('.').pop().length >= 2;
            }, "Please enter a valid domain (e.g., .com, .in)")
    );


/**
 * Corporate Email Schema (Blocks public providers)
 */
const PUBLIC_DOMAINS = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
    'mail.com', 'icloud.com', 'protonmail.com', 'aol.com'
];

const corporateEmailSchema = emailSchema.refine(val => {
    const domain = val.split('@')[1];
    return !PUBLIC_DOMAINS.includes(domain);
}, "Please use a corporate email address. Public domains like @mail.com are not allowed.");


/**
 * Auth & User related validation schemas for the Frontend
 */
export const authSchemas = {
    // Registration Schema
    register: z.object({
        full_name: z
            .string()
            .trim()
            .min(1, "Full name is required")
            .pipe(
                z.string()
                    .min(2, "Full name must be at least 2 characters")
                    .max(50, "Full name cannot exceed 50 characters")
                    .regex(/^[a-zA-Z\s]*$/, "Full name can only contain letters and spaces")
                    .refine((val) => /[a-zA-Z]/.test(val), "Full name must contain letters")
            ),

        email: emailSchema,

        phone: z
            .string()
            .trim()
            .min(1, "Phone number is required")
            .pipe(
                z.string()
                    .length(10, "Phone number must be exactly 10 digits")
                    .regex(/^[6-9][0-9]{9}$/, "Phone must be a valid Indian number")
            ),

        password: z
            .string()
            .min(1, "Password is required")
            .pipe(
                z.string()
                    .min(8, "Password must be at least 8 characters")
                    .max(100, "Password is too long")
                    .refine(
                        (val) => /[A-Z]/.test(val) && /[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val),
                        "Password must contain at least one uppercase letter, one number, and one special character"
                    )
            ),

        auth_provider: z.enum(["PASSWORD", "GOOGLE", "OTP"]).default("PASSWORD"),
    }).strict().superRefine((data, ctx) => {
        if (data.auth_provider === "PASSWORD" && !data.password) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["password"],
                message: "Password is required for email registration",
            });
        }
    }),

    // Login Schema
    login: z.object({
        email: emailSchema,
        password: z.string().min(1, "Password is required"),
    }),

    // OTP Request
    otpRequest: z.object({
        email: emailSchema,
    }),

    // OTP Verify
    otpVerify: z.object({
        email: emailSchema,
        otp: z.string()
            .min(1, "OTP is required")
            .pipe(
                z.string()
                    .length(6, "OTP must be exactly 6 digits")
                    .regex(/^\d+$/, "OTP must contain only numbers")
            ),
    }),

    // Password Forgot
    forgotPassword: z.object({
        email: emailSchema,
    }),

    // Password Reset
    resetPassword: z.object({
        password: z
            .string()
            .min(1, "Password is required")
            .pipe(z.string()
                .min(8, "Password must be at least 8 characters")
                .refine(
                    (val) => /[A-Z]/.test(val) && /[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val),
                    "At least 1 uppercase, 1 number, and 1 special character required"
                )),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }),
};
