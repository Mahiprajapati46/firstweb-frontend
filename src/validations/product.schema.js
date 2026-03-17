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
            .min(3, "Product title must be at least 3 characters")
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

        // 💎 Unified Variant Matrix (Phase 13)
        // Every product must have at least one variant.
        variants: z.array(z.object({
            price: z.coerce.number().positive("Variant price must be greater than zero"),
            compare_at_price: z.coerce.number().optional().or(z.literal("")),
            stock: z.coerce.number().int().nonnegative("Variant stock cannot be negative").default(0),
            sku: z.string().trim().max(30).optional().or(z.literal("")),
            gst_rate: z.coerce.number().default(18),
            attributes: z.record(z.string(), z.string().trim().min(1, "Value is required").or(z.number())).optional(),
            image: z.any().optional(), // Specific variant thumbnail
        }).refine(v => !v.compare_at_price || Number(v.compare_at_price) >= Number(v.price), {
            message: "Original price cannot be lower than the selling price",
            path: ["compare_at_price"]
        })).min(1, "At least one product variant is required"),

        // We validate image count on frontend separately
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
        gst_rate: z.coerce.number().default(18),
        sort_order: z.coerce.number().int().default(0),
        images: z.array(z.any()).optional(),
    }).refine(data => !data.compare_at_price || Number(data.compare_at_price) >= Number(data.price), {
        message: "Original price cannot be lower than the selling price",
        path: ["compare_at_price"]
    }),
};
