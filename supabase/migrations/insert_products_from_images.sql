-- ============================================
-- Insert Products from Images
-- ============================================
-- Run this AFTER running complete_schema.sql

-- Get category IDs (will be used in inserts)
DO $$
DECLARE
    custom_cakes_id UUID;
BEGIN
    SELECT id INTO custom_cakes_id FROM categories WHERE name = 'Custom Cakes';

    -- Birthday Cakes
    INSERT INTO products (name, description, category_id, product_type, base_price, image_url, customizable, is_available, tags) VALUES
    ('Birthday Cake', 'Classic birthday cake perfect for celebrations', custom_cakes_id, 'cake', 110.00, '/images/products/birthday-cake.png', TRUE, TRUE, ARRAY['birthday', 'celebration']),
    ('Pink Birthday Cake', 'Sweet pink themed birthday cake', custom_cakes_id, 'cake', 110.00, '/images/products/birthday-cake-2.png', TRUE, TRUE, ARRAY['birthday', 'pink']),
    ('Floral Birthday Cake', 'Elegant cake with floral decorations', custom_cakes_id, 'cake', 110.00, '/images/products/birthday-cake-3.png', TRUE, TRUE, ARRAY['birthday', 'floral']),
    ('Chocolate Birthday Cake', 'Rich chocolate birthday cake', custom_cakes_id, 'cake', 110.00, '/images/products/birthday-cake-4.png', TRUE, TRUE, ARRAY['birthday', 'chocolate']),
    ('Rainbow Birthday Cake', 'Colorful rainbow themed cake', custom_cakes_id, 'cake', 110.00, '/images/products/birthday-cake-5.png', TRUE, TRUE, ARRAY['birthday', 'rainbow', 'kids']),
    ('Unicorn Birthday Cake', 'Magical unicorn cake for kids', custom_cakes_id, 'cake', 110.00, '/images/products/birthday-cake-6.png', TRUE, TRUE, ARRAY['birthday', 'unicorn', 'kids']),
    ('Rose Gold Birthday Cake', 'Elegant rose gold cake', custom_cakes_id, 'cake', 110.00, '/images/products/birthday-cake-7.png', TRUE, TRUE, ARRAY['birthday', 'elegant']),
    ('Butterfly Birthday Cake', 'Delicate butterfly themed cake', custom_cakes_id, 'cake', 110.00, '/images/products/birthday-cake-8.png', TRUE, TRUE, ARRAY['birthday', 'butterfly']),
    ('Blue Birthday Cake', 'Cool blue themed birthday cake', custom_cakes_id, 'cake', 110.00, '/images/products/birthday-cake-9.png', TRUE, TRUE, ARRAY['birthday', 'blue']),
    ('Glitter Birthday Cake', 'Sparkly celebration cake', custom_cakes_id, 'cake', 110.00, '/images/products/birthday-cake-10.png', TRUE, TRUE, ARRAY['birthday', 'glitter']),
    ('Gold Birthday Cake', 'Luxurious gold themed cake', custom_cakes_id, 'cake', 110.00, '/images/products/birthday-cake-11.png', TRUE, TRUE, ARRAY['birthday', 'gold', 'luxury']),
    ('Pastel Birthday Cake', 'Soft pastel colored cake', custom_cakes_id, 'cake', 110.00, '/images/products/birthday-cake-12.png', TRUE, TRUE, ARRAY['birthday', 'pastel']),
    ('Drip Birthday Cake', 'Trendy drip cake design', custom_cakes_id, 'cake', 110.00, '/images/products/birthday-cake-13.png', TRUE, TRUE, ARRAY['birthday', 'drip', 'trendy']),
    ('Hearts Birthday Cake', 'Romantic hearts themed cake', custom_cakes_id, 'cake', 110.00, '/images/products/birthday-cake-14.png', TRUE, TRUE, ARRAY['birthday', 'hearts']),
    ('Marble Birthday Cake', 'Modern marble effect cake', custom_cakes_id, 'cake', 110.00, '/images/products/birthday-cake-15.png', TRUE, TRUE, ARRAY['birthday', 'marble', 'modern']),
    ('Crown Birthday Cake', 'Majestic cake with crown topper', custom_cakes_id, 'cake', 110.00, '/images/products/birthday-cake-16.png', TRUE, TRUE, ARRAY['birthday', 'crown']),
    ('Elegant Birthday Cake', 'Simple elegant design', custom_cakes_id, 'cake', 110.00, '/images/products/birthday-cake-17.png', TRUE, TRUE, ARRAY['birthday', 'elegant']);

    -- Special Occasion Cakes
    INSERT INTO products (name, description, category_id, product_type, base_price, image_url, customizable, is_available, tags) VALUES
    ('Anniversary Cake', 'Beautiful cake for anniversaries', custom_cakes_id, 'cake', 110.00, '/images/products/anniversary-cake.png', TRUE, TRUE, ARRAY['anniversary', 'celebration']),
    ('Christmas Cake', 'Festive Christmas themed cake', custom_cakes_id, 'cake', 110.00, '/images/products/christmas-cake.jpg', TRUE, TRUE, ARRAY['christmas', 'holiday']);

    -- Custom Design Cakes
    INSERT INTO products (name, description, category_id, product_type, base_price, image_url, customizable, is_available, tags) VALUES
    ('Custom Design Cake', 'Fully customizable cake design', custom_cakes_id, 'cake', 110.00, '/images/products/custom-design-cake.png', TRUE, TRUE, ARRAY['custom', 'personalized']),
    ('Premium Custom Cake', 'Luxury custom designed cake', custom_cakes_id, 'cake', 150.00, '/images/products/custom-design-cake-2.png', TRUE, TRUE, ARRAY['custom', 'luxury']),
    ('Artistic Custom Cake', 'Artistic custom cake creation', custom_cakes_id, 'cake', 150.00, '/images/products/custom-design-cake-4.png', TRUE, TRUE, ARRAY['custom', 'artistic']);

    -- Other Products
    INSERT INTO products (name, description, category_id, product_type, base_price, image_url, customizable, is_available, tags) 
    SELECT 
        'Cupcake Box',
        'Box of assorted cupcakes',
        (SELECT id FROM categories WHERE name = 'Cupcakes'),
        'cupcake',
        25.00,
        '/images/products/cupcakes.png',
        TRUE,
        TRUE,
        ARRAY['cupcakes', 'assorted'];

    INSERT INTO products (name, description, category_id, product_type, base_price, image_url, customizable, is_available, tags)
    SELECT
        'Mini Cupcakes',
        'Bite-sized mini cupcakes',
        (SELECT id FROM categories WHERE name = 'Cupcakes'),
        'cupcake',
        20.00,
        '/images/products/cupcakes-2.png',
        TRUE,
        TRUE,
        ARRAY['cupcakes', 'mini'];

    INSERT INTO products (name, description, category_id, product_type, base_price, image_url, customizable, is_available, tags)
    SELECT
        'Fruit Cake',
        'Traditional fruit cake',
        (SELECT id FROM categories WHERE name = 'Fruitcakes'),
        'fruitcake',
        50.00,
        '/images/products/fruit-cake.png',
        TRUE,
        TRUE,
        ARRAY['fruitcake', 'traditional'];

    INSERT INTO products (name, description, category_id, product_type, base_price, image_url, customizable, is_available, tags)
    SELECT
        'Artisan Bread',
        'Freshly baked artisan bread',
        (SELECT id FROM categories WHERE name = 'Other'),
        'other',
        15.00,
        '/images/products/bread.png',
        FALSE,
        TRUE,
        ARRAY['bread', 'fresh']
    WHERE EXISTS (SELECT 1 FROM categories WHERE name = 'Other')
    ON CONFLICT DO NOTHING;

    -- If 'Other' category doesn't exist, create it and insert bread
    IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Other') THEN
        INSERT INTO categories (name, description, display_order) 
        VALUES ('Other', 'Other baked goods', 5);
        
        INSERT INTO products (name, description, category_id, product_type, base_price, image_url, customizable, is_available, tags)
        SELECT
            'Artisan Bread',
            'Freshly baked artisan bread',
            (SELECT id FROM categories WHERE name = 'Other'),
            'other',
            15.00,
            '/images/products/bread.png',
            FALSE,
            TRUE,
            ARRAY['bread', 'fresh'];
    END IF;

END $$;
