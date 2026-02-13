# Sugar and Icing

A full-stack e-commerce site for a local bakery business. Built to handle custom cake orders, standard product listings, and payments.

This project uses the Next.js App Router with a strict separation between UI components and business logic hooks.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend:** Supabase (Auth, Database, RLS)
- **Payments:** Stripe
- **State:** React Hooks + Supabase Realtime

## Features

- **Product Browsing:** Filter by categories (cakes, brownies, etc).
- **Custom Orders:** Specialized forms for custom cake requests.
- **Cart System:** Persistent cart linked to user profiles.
- **Checkout:** Stripe integration for payments.
- **User Profiles:** Order history and saved addresses.
- **Reviews:** Users can rate and review their orders.
- **Notifications:** Users can receive notifications about their orders.

## Setup & Installation

1. **Clone and install**
   ```bash
   git clone https://github.com/Kashfmh/Sugar-And-Icing.git
   cd Sugar-And-Icing
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file with the following keys:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   SUPABASE_SERVICE_ROLE_KEY=your_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_key
   STRIPE_SECRET_KEY=your_key
   ```

3. **Database Setup**
   Run these SQL commands in your Supabase SQL Editor to set up the tables:

   ```sql
   -- WARNING: This schema is for context only and is not meant to be run.
   -- Table order and constraints may not be valid for execution.

   CREATE TABLE public.addresses (
     id uuid NOT NULL DEFAULT gen_random_uuid(),
     user_id uuid,
     label text NOT NULL,
     address_line1 text NOT NULL,
     address_line2 text,
     city text NOT NULL,
     state text NOT NULL,
     postcode text NOT NULL,
     is_default boolean DEFAULT false,
     created_at timestamp with time zone DEFAULT now(),
     updated_at timestamp with time zone DEFAULT now(),
     CONSTRAINT addresses_pkey PRIMARY KEY (id),
     CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
   );
   CREATE TABLE public.cart_items (
     id uuid NOT NULL DEFAULT uuid_generate_v4(),
     user_id uuid,
     product_id uuid,
     quantity integer NOT NULL CHECK (quantity > 0),
     unit_price numeric NOT NULL DEFAULT 0,
     metadata jsonb DEFAULT '{}'::jsonb,
     created_at timestamp with time zone DEFAULT now(),
     updated_at timestamp with time zone DEFAULT now(),
     CONSTRAINT cart_items_pkey PRIMARY KEY (id),
     CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
     CONSTRAINT cart_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
   );
   CREATE TABLE public.categories (
     id uuid NOT NULL DEFAULT uuid_generate_v4(),
     name text NOT NULL UNIQUE,
     description text,
     display_order integer DEFAULT 0,
     created_at timestamp with time zone DEFAULT now(),
     CONSTRAINT categories_pkey PRIMARY KEY (id)
   );
   CREATE TABLE public.notifications (
     id uuid NOT NULL DEFAULT gen_random_uuid(),
     user_id uuid NOT NULL,
     title text NOT NULL,
     message text NOT NULL,
     type text NOT NULL CHECK (type = ANY (ARRAY['order'::text, 'system'::text, 'promo'::text])),
     read boolean NOT NULL DEFAULT false,
     created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
     CONSTRAINT notifications_pkey PRIMARY KEY (id),
     CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
   );
   CREATE TABLE public.order_items (
     id uuid NOT NULL DEFAULT gen_random_uuid(),
     order_id uuid NOT NULL,
     product_id uuid,
     product_name text NOT NULL,
     quantity integer NOT NULL DEFAULT 1,
     price_at_purchase numeric NOT NULL,
     metadata jsonb,
     CONSTRAINT order_items_pkey PRIMARY KEY (id),
     CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
     CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
   );
   CREATE TABLE public.orders (
     id uuid NOT NULL DEFAULT gen_random_uuid(),
     created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
     user_id uuid,
     status text NOT NULL DEFAULT 'pending_verification'::text,
     total_amount numeric NOT NULL,
     receipt_url text,
     delivery_date timestamp with time zone,
     delivery_slot text,
     delivery_type text,
     delivery_address_snapshot jsonb,
     payment_method text,
     stripe_payment_intent_id text,
     updated_at timestamp with time zone DEFAULT now(),
     CONSTRAINT orders_pkey PRIMARY KEY (id),
     CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
   );
   CREATE TABLE public.product_options (
     id uuid NOT NULL DEFAULT uuid_generate_v4(),
     product_type text NOT NULL,
     option_category text NOT NULL CHECK (option_category = ANY (ARRAY['base'::text, 'frosting'::text, 'topping'::text, 'dietary'::text])),
     option_name text NOT NULL,
     is_premium boolean DEFAULT false,
     price_modifier numeric DEFAULT 0,
     description text,
     created_at timestamp with time zone DEFAULT now(),
     CONSTRAINT product_options_pkey PRIMARY KEY (id)
   );
   CREATE TABLE public.products (
     id uuid NOT NULL DEFAULT uuid_generate_v4(),
     name text NOT NULL,
     description text,
     category_id uuid,
     product_type text NOT NULL CHECK (product_type = ANY (ARRAY['cake'::text, 'cupcake'::text, 'cupcake_basic'::text, 'cupcake_premium'::text, 'brownie'::text, 'fruitcake'::text, 'bread'::text, 'other'::text])),
     size_variant text,
     base_price numeric NOT NULL,
     premium_price numeric,
     image_url text,
     customizable boolean DEFAULT false,
     min_notice_days integer DEFAULT 0,
     stock_quantity integer,
     times_sold integer DEFAULT 0,
     average_rating numeric DEFAULT 0,
     review_count integer DEFAULT 0,
     is_available boolean DEFAULT true,
     tags ARRAY,
     created_at timestamp with time zone DEFAULT now(),
     updated_at timestamp with time zone DEFAULT now(),
     gallery_images ARRAY,
     CONSTRAINT products_pkey PRIMARY KEY (id),
     CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
   );
   CREATE TABLE public.profiles (
     id uuid NOT NULL,
     first_name text,
     last_name text,
     phone text,
     default_delivery_address text,
     created_at timestamp with time zone DEFAULT now(),
     updated_at timestamp with time zone DEFAULT now(),
     dob date,
     default_address_id uuid,
     preferred_contact_method text DEFAULT 'whatsapp'::text CHECK (preferred_contact_method = ANY (ARRAY['whatsapp'::text, 'email'::text, 'phone'::text])),
     favorite_flavors ARRAY,
     dietary_restrictions ARRAY,
     notification_preferences jsonb DEFAULT '{"marketing": false, "reminders": true, "order_updates": true}'::jsonb,
     avatar_url text,
     email text,
     favorite_frosting text,
     username text UNIQUE,
     last_username_change timestamp with time zone,
     CONSTRAINT profiles_pkey PRIMARY KEY (id),
     CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
   );
   CREATE TABLE public.promotions (
     id uuid NOT NULL DEFAULT uuid_generate_v4(),
     name text NOT NULL,
     description text,
     discount_type text CHECK (discount_type = ANY (ARRAY['percentage'::text, 'fixed_amount'::text, 'combo'::text])),
     discount_value numeric,
     promo_code text UNIQUE,
     valid_from timestamp with time zone,
     valid_until timestamp with time zone,
     min_order_amount numeric,
     max_uses integer,
     times_used integer DEFAULT 0,
     applicable_products ARRAY,
     is_active boolean DEFAULT true,
     created_at timestamp with time zone DEFAULT now(),
     CONSTRAINT promotions_pkey PRIMARY KEY (id)
   );
   CREATE TABLE public.recently_viewed (
     id uuid NOT NULL DEFAULT gen_random_uuid(),
     user_id uuid NOT NULL,
     product_id uuid NOT NULL,
     viewed_at timestamp with time zone NOT NULL DEFAULT now(),
     CONSTRAINT recently_viewed_pkey PRIMARY KEY (id),
     CONSTRAINT recently_viewed_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
     CONSTRAINT recently_viewed_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
   );
   CREATE TABLE public.reviews (
     id uuid NOT NULL DEFAULT uuid_generate_v4(),
     product_id uuid NOT NULL,
     user_id uuid NOT NULL,
     order_id uuid,
     rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
     comment text,
     images ARRAY,
     is_verified_purchase boolean DEFAULT true,
     helpful_count integer DEFAULT 0,
     created_at timestamp with time zone DEFAULT now(),
     updated_at timestamp with time zone DEFAULT now(),
     title text,
     video_urls ARRAY DEFAULT '{}'::text[],
     is_anonymous boolean DEFAULT false,
     CONSTRAINT reviews_pkey PRIMARY KEY (id),
     CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
     CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
   );
   CREATE TABLE public.special_occasions (
     id uuid NOT NULL DEFAULT gen_random_uuid(),
     user_id uuid,
     name text NOT NULL,
     date date NOT NULL,
     type text,
     reminder_enabled boolean DEFAULT true,
     created_at timestamp with time zone DEFAULT now(),
     updated_at timestamp with time zone DEFAULT now(),
     last_reminded_year integer,
     CONSTRAINT special_occasions_pkey PRIMARY KEY (id),
     CONSTRAINT special_occasions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
   );
   ```

4. **Run Locally**
   ```bash
   npm run dev
   ```

## Project Structure

- `/app`: Pages and layouts (Server Components by default).
- `/components/ui`: Reusable UI elements (Buttons, Inputs).
- `/hooks`: Custom hooks for logic (useCart, useAuth).
- `/lib/services`: Direct calls to Supabase.
