import { z } from 'zod';

/**
 * Admin related validation schemas for the Frontend
 */
export const adminSchemas = {
    // Coupon Schema - Industry Standard Rules
    coupon: z.object({
        code: z
            .string()
            .trim()
            .min(1, "Code is required")
            .min(3, "Code must be at least 3 characters")
            .max(20, "Code must not exceed 20 characters")
            .regex(/^[A-Z0-9]+$/, "Only uppercase letters and numbers are allowed (no spaces)"),

        description: z
            .string()
            .trim()
            .min(1, "Description is required")
            .min(10, "Description must be at least 10 characters for better clarity")
            .max(200, "Description must not exceed 200 characters"),

        discount_type: z.enum(["PERCENTAGE", "FIXED"], {
            errorMap: () => ({ message: "Please select a valid discount type" })
        }),

        discount_value: z
            .preprocess((val) => Number(val), z.number({
                invalid_type_error: "Value must be a number",
                required_error: "Value is required"
            }).positive("Value must be greater than 0")),

        min_order_amount: z
            .preprocess((val) => Number(val), z.number({
                invalid_type_error: "Must be a number"
            }).min(0, "Minimum amount cannot be negative")),

        max_discount_amount: z
            .preprocess((val) => (val === "" || val === undefined) ? undefined : Number(val),
                z.number({ invalid_type_error: "Must be a number" }).positive("Cap must be greater than 0").optional()),

        expiry_date: z.string().min(1, "Expiry date is required").refine((date) => {
            const selectedDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return selectedDate >= today;
        }, { message: "Expiry date cannot be in the past" }),

        usage_limit: z
            .preprocess((val) => (val === "" || val === undefined) ? undefined : Number(val),
                z.number({ invalid_type_error: "Limit must be a number" }).int().positive("Limit must be at least 1").optional()),

        user_usage_limit: z
            .preprocess((val) => Number(val), z.number({
                invalid_type_error: "Limit must be a number"
            }).int().positive("Per user limit must be at least 1")),

        is_active: z.boolean().default(true)
    }).refine((data) => {
        // If percentage, discount value cannot exceed 100%
        if (data.discount_type === "PERCENTAGE" && data.discount_value > 100) {
            return false;
        }
        return true;
    }, {
        message: "Percentage discount cannot exceed 100%",
        path: ["discount_value"]
    })
};
