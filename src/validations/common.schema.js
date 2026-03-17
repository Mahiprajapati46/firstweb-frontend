import { z } from 'zod';

export const commonSchemas = {
    address: z.object({
        name: z.string().trim()
            .min(1, "Full name is required")
            .pipe(z.string().min(2, "Full name is too short").max(100)
                .regex(/^[a-zA-Z\s.]*$/, "Name can only contain letters, spaces and dots")),
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
                z.string().regex(/^[1-9][0-9]{5}$/, "Invalid 6-digit Indian Pincode (cannot start with 0)")
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

    // Industry-standard Bank Details validation (India)
    bankDetails: z.object({
        account_holder_name: z.string().trim()
            .min(1, "Account holder name is required")
            .pipe(z.string().min(2, "Name is too short").max(100)
                .regex(/^[a-zA-Z\s.]*$/, "Only letters, spaces and dots are allowed")),
        account_number: z.string().trim()
            .min(1, "Account number is required")
            .pipe(z.string().regex(/^\d{9,18}$/, "Account number must be 9-18 digits")),
        ifsc_code: z.string().trim()
            .min(1, "IFSC code is required")
            .pipe(z.string().toUpperCase()
                .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC format (e.g., SYNB0001234)")),
        bank_name: z.string().trim()
            .min(1, "Bank name is required")
            .pipe(z.string().min(2, "Bank name is too short").max(100)),
    }),

    // UPI ID validation
    upiDetails: z.object({
        vpa: z.string().trim()
            .min(1, "UPI ID / VPA is required")
            .pipe(z.string().regex(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/, "Invalid UPI ID format (e.g., user@bank)")),
    }),
};
