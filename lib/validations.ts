import { z } from 'zod';

export const addressSchema = z.object({
    label: z.string().min(1, "Label is required").max(50),
    addressLine1: z.string().min(5, "Address must be at least 5 characters").max(200),
    addressLine2: z.string().max(200).optional(),
    city: z.string().min(2, "City is required").max(100),
    state: z.string().min(2, "State is required").max(100),
    postcode: z.string().regex(/^\d{5}$/, "Invalid postcode (must be 5 digits)"),
    isDefault: z.boolean().optional()
});

export const orderUpdateSchema = z.object({
    deliveryType: z.enum(['pickup', 'delivery']),
    deliveryAddressSnapshot: z.string().max(1000).optional().or(z.null()),
    deliveryDate: z.string().datetime().optional().or(z.null()),
    deliverySlot: z.string().max(50).optional().or(z.null()),
    paymentMethod: z.enum(['card', 'fpx', 'grabpay', 'wallet']).optional()
});

export const paymentSchema = z.object({
    orderId: z.string().uuid().optional().or(z.null()).or(z.literal('undefined')),
    userId: z.string().uuid(),
    userEmail: z.string().email().optional().or(z.literal('')),
    deliveryType: z.enum(['pickup', 'delivery']).optional(),
    items: z.array(z.object({
        id: z.string(),
        quantity: z.number().int().positive(),
        price: z.number().nonnegative(), // We validate against DB, but schema checks structure
        name: z.string(),
        selectedOptions: z.record(z.string(), z.any()).optional(),
        metadata: z.record(z.string(), z.any()).optional()
    })).optional()
});
