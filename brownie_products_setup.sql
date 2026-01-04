-- =====================================================
-- BROWNIE PRODUCTS & OPTIONS SETUP
-- =====================================================
-- Base pricing: RM 3 per piece
-- Premium (with toppings): RM 4 per piece
-- =====================================================

-- 1. Update constraint to allow brownie product type
ALTER TABLE products 
DROP CONSTRAINT IF EXISTS products_product_type_check;

ALTER TABLE products 
ADD CONSTRAINT products_product_type_check 
CHECK (product_type IN ('cake', 'cupcake', 'cupcake_basic', 'cupcake_premium', 'brownie', 'fruitcake', 'bread', 'other'));

-- 2. Insert Brownie Product
INSERT INTO products (
    id,
    name,
    description,
    product_type,
    image_url,
    base_price,
    premium_price,
    customizable,
    is_available,
    tags
) VALUES (
    gen_random_uuid(),
    'Brownies (per piece)',
    'Rich, fudgy brownie. Add premium toppings or customize with dietary options.',
    'brownie',
    '/images/products/brownie.jpg',
    3.00,      -- Base price per piece
    4.00,      -- Premium price with toppings
    true,
    true,
    ARRAY['Customizable', 'Party']
);

-- 3. Insert Brownie Product Options
-- Premium Toppings (+RM 1 per piece)
INSERT INTO product_options (product_type, option_category, option_name, is_premium, price_modifier, description) VALUES
('brownie', 'topping', 'Nuts', true, 1.00, 'Crunchy mixed nuts'),
('brownie', 'topping', 'Chocolate Chips', true, 1.00, 'Rich chocolate chips'),
('brownie', 'topping', 'Premium Chocolate', true, 1.00, 'Different types of premium chocolates'),
('brownie', 'topping', 'Nutella', true, 1.00, 'Creamy Nutella topping')
ON CONFLICT (product_type, option_category, option_name) DO NOTHING;

-- Dietary Options (Free)
INSERT INTO product_options (product_type, option_category, option_name, is_premium, price_modifier, description) VALUES
('brownie', 'dietary', 'Eggless', false, 0.00, 'Made without eggs'),
('brownie', 'dietary', 'Nutless', false, 0.00, 'No nuts included')
ON CONFLICT (product_type, option_category, option_name) DO NOTHING;

-- Dietary Options (Premium/Extra Cost)
INSERT INTO product_options (product_type, option_category, option_name, is_premium, price_modifier, description) VALUES
('brownie', 'dietary', 'Vegan', true, 2.00, 'Fully plant-based'),
('brownie', 'dietary', 'Dairy-Free', true, 1.50, 'No dairy products')
ON CONFLICT (product_type, option_category, option_name) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- SELECT p.name, p.base_price, p.premium_price, 
--        po.option_category, po.option_name, po.is_premium, po.price_modifier
-- FROM products p
-- LEFT JOIN product_options po ON p.product_type = po.product_type
-- WHERE p.product_type = 'brownie'
-- ORDER BY po.option_category, po.option_name;
