import { z } from 'zod';

export const commonSchemas = {
    address: z.object({
        name: z.string().trim()
            .min(1, "Full name is required")
            .pipe(z.string().min(2, "Full name is too short").max(100)),
        phone: z.string().trim()
            .min(1, "Phone number is required")
            .pipe(
                z.string().regex(/^[6-9]\d{9}$/, "Invalid 10-digit Indian phone number")
            ),
        line1: z.string().trim()
            .min(1, "Address line 1 is required")
            .pipe(z.string().min(5, "Address line 1 is too short").max(200)),
        line2: z.string().trim().max(200).optional(),
        city: z.string().trim()
            .min(1, "City is required")
            .pipe(
                z.string().min(2, "City name is too short").max(100)
                    .regex(/^[a-zA-Z\s]*$/, "City name can only contain letters and spaces")
            ),
        state: z.string().trim()
            .min(1, "State is required")
            .pipe(
                z.string().min(2, "State name is too short").max(100)
                    .regex(/^[a-zA-Z\s]*$/, "State name can only contain letters and spaces")
            ),
        pincode: z.string().trim()
            .min(1, "Pincode is required")
            .pipe(
                z.string().regex(/^\d{6}$/, "Invalid 6-digit Pincode")
            ),
        country: z.string().default("India"),
        type: z.enum(["HOME", "WORK", "OTHER"]).default("HOME"),
    }),

    // Shipping/Delivery details for orders
    shipping_details: z.object({
        courier_name: z.string().trim()
            .min(1, "Courier name is required")
            .pipe(z.string().min(3, "Courier name must be at least 3 characters (e.g., DHL, UPS)").max(50)),
        tracking_id: z.string().trim()
            .min(1, "Tracking ID is required")
            .pipe(z.string().min(5, "Tracking ID is too short")
                .regex(/^(?=.*[0-9])[a-zA-Z0-9]+$/, "Tracking ID must be alphanumeric and contain at least one number")
                .max(100)),
        tracking_url: z.string().trim().url("Invalid tracking URL format").optional().or(z.literal("")),
    }),
};
