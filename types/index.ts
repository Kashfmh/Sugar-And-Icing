export interface Product {
    id: string;
    name: string;
    description: string | null;
    price?: number;
    base_price: number;
    premium_price: number | null;
    image_url: string | null;
    gallery_images: string[] | null;
    category_id: string;
    product_type: string;
    is_available: boolean;
    customizable: boolean;
    tags: string[] | null;
    average_rating: number;
    review_count: number;
    times_sold: number;
    created_at: string;
}

export interface Profile {
    id: string;
    first_name: string | null;
    username?: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
    avatar_url: string | null;
    role: 'customer' | 'admin';
    dob: string | null;
    preferred_contact_method: string | null;
    favorite_flavors: string[] | null;
    dietary_restrictions: string[] | null;
    notification_preferences: {
        order_updates: boolean;
        marketing: boolean;
        reminders: boolean;
    } | null;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price_at_purchase: number;
    metadata: Record<string, any> | null;
    products?: Product;
}

export interface Order {
    id: string;
    user_id: string;
    status: 'pending' | 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'refunded';
    total_amount: number;
    payment_status: 'pending' | 'paid' | 'failed';
    payment_method: string | null;
    delivery_method: 'pickup' | 'delivery';
    delivery_address: any | null;
    pickup_date: string | null;
    pickup_time: string | null;
    notes: string | null;
    created_at: string;
    updated_at?: string;
    order_items?: OrderItem[];
    items_count?: number;
}

export interface Review {
    id: string;
    user_id: string;
    product_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    profiles?: {
        first_name: string | null;
        username?: string | null;
    };
}

export interface CartItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    image_url: string | null;
    quantity: number;
    description: string | null;
    category: string;
    metadata?: Record<string, any>;
}

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
    type: 'order' | 'system' | 'promo';
}
