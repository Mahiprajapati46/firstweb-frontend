import { z } from "zod";

/**
 * Product & Variant related validation schemas for the Frontend
 */
export const productSchemas = {
    // Base Product Schema
    create: z.object({
        title: z
            .string()
            .trim()
            .min(5, "Product title must be at least 5 characters")
            .max(100, "Product title is too long")
            .refine((val) => /[a-zA-Z]/.test(val), "Product title must contain letters"),

        description: z
            .string()
            .trim()
            .min(50, "Please provide a more detailed description (min 50 characters)")
            .max(2000, "Description is too long (max 2000 characters)"),

        category_ids: z
            .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID format"))
            .min(1, "At least one category is required"),

        pricing: z.object({
            min_price: z.coerce.number().positive("Price must be greater than zero"),
            max_price: z.coerce.number().optional(),
            currency: z.string().default("INR"),
        }).refine(data => !data.max_price || Number(data.max_price) >= Number(data.min_price), {
            message: "Max price cannot be less than min price",
            path: ["max_price"]
        }),

        // We validate image count on frontend separately, but include here for parity
        images: z.array(z.any()).min(1, "At least one product image is required"),
    }),

    // Variant Schema
    variant: z.object({
        sku: z.string().trim().min(3).max(30).optional().or(z.literal("")),
        attributes: z.record(z.string(), z.string().trim().min(1, "Value is required").or(z.number())).refine(
            (attr) => Object.keys(attr).length > 0,
            "At least one attribute (e.g., Size, Color) is required"
        ),
        price: z.coerce.number().positive("Variant price must be greater than zero"),
        compare_at_price: z.coerce.number().optional(),
        stock: z.coerce.number().int().nonnegative("Stock cannot be negative").default(0),
        is_default: z.coerce.boolean().default(false),
        sort_order: z.coerce.number().int().default(0),
        images: z.array(z.any()).optional(),
    }).refine(data => !data.compare_at_price || Number(data.compare_at_price) >= Number(data.price), {
        message: "Compare-at price should be greater than or equal to selling price",
        path: ["compare_at_price"]
    }),
};
