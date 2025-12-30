-- ============================================
-- Sugar And Icing - Complete Database Schema
-- ============================================
-- WARNING: This script will drop and recreate all tables
-- Make sure to backup any data you want to keep!

-- Drop existing tables (in correct order to avoid FK constraints)
DROP TABLE IF EXISTS order_customizations CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS promotions CASCADE;
DROP TABLE IF EXISTS product_options CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    default_delivery_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. CATEGORIES TABLE
-- ============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    product_type TEXT NOT NULL CHECK (product_type IN ('cupcake', 'brownie', 'fruitcake', 'cake', 'other')),
    size_variant TEXT, -- '6pcs', '12pcs', 'per_piece', '500g', '1kg', etc.
    base_price NUMERIC(10, 2) NOT NULL,
    premium_price NUMERIC(10, 2),
    image_url TEXT,
    customizable BOOLEAN DEFAULT FALSE,
    min_notice_days INTEGER DEFAULT 0,
    stock_quantity INTEGER, -- optional for inventory tracking
    times_sold INTEGER DEFAULT 0,
    average_rating NUMERIC(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. PRODUCT OPTIONS TABLE
-- ============================================
CREATE TABLE product_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_type TEXT NOT NULL,
    option_category TEXT NOT NULL CHECK (option_category IN ('base', 'frosting', 'topping', 'dietary')),
    option_name TEXT NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    price_modifier NUMERIC(10, 2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_type, option_category, option_name)
);

-- ============================================
-- 5. PROMOTIONS TABLE
-- ============================================
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_amount', 'combo')),
    discount_value NUMERIC(10, 2),
    promo_code TEXT UNIQUE,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    min_order_amount NUMERIC(10, 2),
    max_uses INTEGER,
    times_used INTEGER DEFAULT 0,
    applicable_products UUID[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. ORDERS TABLE
-- ============================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled')),
    delivery_method TEXT CHECK (delivery_method IN ('delivery', 'pickup')),
    delivery_address TEXT,
    delivery_date DATE,
    delivery_time_slot TEXT,
    pickup_date DATE,
    pickup_time_slot TEXT,
    subtotal NUMERIC(10, 2) NOT NULL,
    promotion_discount NUMERIC(10, 2) DEFAULT 0,
    delivery_fee NUMERIC(10, 2) DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL,
    promo_code_used TEXT,
    special_instructions TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    payment_method TEXT CHECK (payment_method IN ('cash', 'online', 'bank_transfer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. ORDER ITEMS TABLE
-- ============================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    customization_notes TEXT,
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. ORDER CUSTOMIZATIONS TABLE
-- ============================================
CREATE TABLE order_customizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES product_options(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(order_item_id, option_id)
);

-- ============================================
-- 9. REVIEWS TABLE
-- ============================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    images TEXT[],
    is_verified_purchase BOOLEAN DEFAULT TRUE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_type ON products(product_type);
CREATE INDEX idx_products_available ON products(is_available);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Categories (public read)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories viewable by everyone"
ON categories FOR SELECT
TO public
USING (true);

-- Products (public read)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products viewable by everyone"
ON products FOR SELECT
TO public
USING (true);

-- Product Options (public read)
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product options viewable by everyone"
ON product_options FOR SELECT
TO public
USING (true);

-- Promotions (public read active ones)
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active promotions viewable by everyone"
ON promotions FOR SELECT
TO public
USING (is_active = true AND NOW() BETWEEN valid_from AND valid_until);

-- Orders (users see only their own)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own orders"
ON orders FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users insert own orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Order Items (via orders)
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own order items"
ON order_items FOR SELECT
TO authenticated
USING (
    order_id IN (
        SELECT id FROM orders WHERE user_id = auth.uid()
    )
);

-- Order Customizations (via order items)
ALTER TABLE order_customizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own order customizations"
ON order_customizations FOR SELECT
TO authenticated
USING (
    order_item_id IN (
        SELECT oi.id FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.user_id = auth.uid()
    )
);

-- Reviews (users can see all, edit only their own)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews viewable by everyone"
ON reviews FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can create reviews"
ON reviews FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reviews"
ON reviews FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to update product stats when review added
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET 
        average_rating = (
            SELECT AVG(rating)::NUMERIC(3,2)
            FROM reviews
            WHERE product_id = NEW.product_id
        ),
        review_count = (
            SELECT COUNT(*)
            FROM reviews
            WHERE product_id = NEW.product_id
        )
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_rating_on_review
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Function to increment times_sold when order completed
CREATE OR REPLACE FUNCTION update_product_sales()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE products p
        SET times_sold = times_sold + oi.quantity
        FROM order_items oi
        WHERE oi.order_id = NEW.id
        AND p.id = oi.product_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_sales_on_order_complete
    AFTER UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_product_sales();

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    order_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO order_count FROM orders 
    WHERE created_at >= DATE_TRUNC('year', NOW());
    
    NEW.order_number := 'SAI-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD((order_count + 1)::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_order_number_on_insert
    BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- ============================================
-- SEED DATA
-- ============================================

-- Insert Categories
INSERT INTO categories (name, description, display_order) VALUES
('Cupcakes', 'Delicious handmade cupcakes with customizable flavors', 1),
('Brownies', 'Rich, fudgy brownies with optional toppings', 2),
('Fruitcakes', 'Traditional fruitcakes with soaked fruits', 3),
('Custom Cakes', 'Fully customizable cakes for special occasions', 4);

-- Insert Product Options

-- Cupcake Options
INSERT INTO product_options (product_type, option_category, option_name, is_premium, price_modifier) VALUES
-- Basic Bases
('cupcake', 'base', 'Vanilla', FALSE, 0),
('cupcake', 'base', 'Chocolate', FALSE, 0),
('cupcake', 'base', 'Butterscotch', FALSE, 0),
('cupcake', 'base', 'Pineapple', FALSE, 0),
('cupcake', 'base', 'Strawberry', FALSE, 0),
-- Premium Bases
('cupcake', 'base', 'Red Velvet w/ Cream Cheese', TRUE, 5),
-- Basic Frostings
('cupcake', 'frosting', 'Vanilla', FALSE, 0),
('cupcake', 'frosting', 'Chocolate', FALSE, 0),
('cupcake', 'frosting', 'Whipped Ganache', FALSE, 0),
-- Premium Frostings
('cupcake', 'frosting', 'Belgian Chocolate', TRUE, 5),
('cupcake', 'frosting', 'Rasmalai Topping', TRUE, 5),
('cupcake', 'frosting', 'Gulab Jamun Topping', TRUE, 5),
-- Dietary Options
('cupcake', 'dietary', 'Eggless', FALSE, 0),
('cupcake', 'dietary', 'Nutless', FALSE, 0),
('cupcake', 'dietary', 'Vegan', TRUE, 5),
('cupcake', 'dietary', 'Dairy-Free', TRUE, 5);

-- Brownie Options
INSERT INTO product_options (product_type, option_category, option_name, is_premium, price_modifier) VALUES
('brownie', 'topping', 'Nuts', TRUE, 1),
('brownie', 'topping', 'Chocolate Chips', TRUE, 1),
('brownie', 'topping', 'Different Chocolates', TRUE, 1),
('brownie', 'topping', 'Nutella', TRUE, 1),
('brownie', 'dietary', 'Eggless', FALSE, 0),
('brownie', 'dietary', 'Nutless', FALSE, 0),
('brownie', 'dietary', 'Vegan', TRUE, 1),
('brownie', 'dietary', 'Dairy-Free', TRUE, 1);

-- Fruitcake Options
INSERT INTO product_options (product_type, option_category, option_name, is_premium, price_modifier) VALUES
('fruitcake', 'dietary', 'Eggless', FALSE, 0),
('fruitcake', 'dietary', 'Nutless', FALSE, 0),
('fruitcake', 'dietary', 'Vegan', TRUE, 10),
('fruitcake', 'dietary', 'Dairy-Free', TRUE, 10);

-- Insert Sample Products
INSERT INTO products (name, description, category_id, product_type, size_variant, base_price, premium_price, customizable, is_available) 
SELECT 
    'Cupcakes - 6 pieces',
    'Delicious handmade cupcakes with your choice of flavor and frosting. Perfect for small gatherings!',
    (SELECT id FROM categories WHERE name = 'Cupcakes'),
    'cupcake',
    '6pcs',
    25.00,
    30.00,
    TRUE,
    TRUE;

INSERT INTO products (name, description, category_id, product_type, size_variant, base_price, premium_price, customizable, is_available)
SELECT
    'Cupcakes - 12 pieces',
    'Delicious handmade cupcakes with your choice of flavor and frosting. Great for parties!',
    (SELECT id FROM categories WHERE name = 'Cupcakes'),
    'cupcake',
    '12pcs',
    45.00,
    50.00,
    TRUE,
    TRUE;

INSERT INTO products (name, description, category_id, product_type, size_variant, base_price, premium_price, customizable, is_available)
SELECT
    'Brownie',
    'Rich, fudgy brownie. Add premium toppings for extra indulgence!',
    (SELECT id FROM categories WHERE name = 'Brownies'),
    'brownie',
    'per_piece',
    3.00,
    4.00,
    TRUE,
    TRUE;

INSERT INTO products (name, description, category_id, product_type, size_variant, base_price, customizable, min_notice_days, is_available)
SELECT
    'Fruitcake - 500g',
    'Traditional fruitcake with soaked fruits. Requires 3-day advance notice.',
    (SELECT id FROM categories WHERE name = 'Fruitcakes'),
    'fruitcake',
    '500g',
    50.00,
    TRUE,
    3,
    TRUE;

INSERT INTO products (name, description, category_id, product_type, size_variant, base_price, customizable, min_notice_days, is_available)
SELECT
    'Fruitcake - 1kg',
    'Traditional fruitcake with soaked fruits. Requires 3-day advance notice.',
    (SELECT id FROM categories WHERE name = 'Fruitcakes'),
    'fruitcake',
    '1kg',
    100.00,
    TRUE,
    3,
    TRUE;

-- Sample Promotion
INSERT INTO promotions (name, description, discount_type, discount_value, promo_code, valid_from, valid_until, min_order_amount, is_active)
VALUES (
    'New Year 2025 Special',
    'Get 10% off on all orders above RM 50!',
    'percentage',
    10,
    'NEWYEAR2025',
    '2025-01-01 00:00:00+08',
    '2025-01-07 23:59:59+08',
    50.00,
    TRUE
);
