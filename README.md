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
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_key
   STRIPE_SECRET_KEY=your_key
   ```

3. **Database Setup**
   Run these SQL commands in your Supabase SQL Editor to set up the tables:

   ```sql
   -- Categories
   CREATE TABLE public.categories (
     id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
     name text NOT NULL UNIQUE,
     description text,
     display_order integer DEFAULT 0
   );

   -- Products
   CREATE TABLE public.products (
     id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
     name text NOT NULL,
     description text,
     category_id uuid REFERENCES public.categories(id),
     product_type text NOT NULL, -- 'cake', 'cupcake', 'brownie', etc
     base_price numeric NOT NULL,
     premium_price numeric,
     image_url text,
     gallery_images ARRAY,
     stock_quantity integer,
     is_available boolean DEFAULT true
   );

   -- Product Options (for customization)
   CREATE TABLE public.product_options (
     id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
     product_type text NOT NULL,
     option_category text NOT NULL, -- 'base', 'frosting', 'topping', 'dietary'
     option_name text NOT NULL,
     price_modifier numeric DEFAULT 0,
     is_premium boolean DEFAULT false
   );

   -- Profiles & Addresses
   CREATE TABLE public.profiles (
     id uuid NOT NULL REFERENCES auth.users(id) PRIMARY KEY,
     first_name text,
     last_name text,
     phone text,
     default_delivery_address text,
     favorite_flavors ARRAY,
     dietary_restrictions ARRAY
   );

   CREATE TABLE public.addresses (
     id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id uuid REFERENCES auth.users(id),
     label text NOT NULL,
     address_line1 text NOT NULL,
     city text NOT NULL,
     state text NOT NULL,
     postcode text NOT NULL,
     is_default boolean DEFAULT false
   );

   -- Cart & Orders
   CREATE TABLE public.cart_items (
     id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
     user_id uuid REFERENCES auth.users(id),
     product_id uuid REFERENCES public.products(id),
     quantity integer NOT NULL,
     metadata jsonb -- stores custom choices
   );

   CREATE TABLE public.orders (
     id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id uuid REFERENCES auth.users(id),
     status text DEFAULT 'pending_verification',
     total_amount numeric NOT NULL,
     created_at timestamp DEFAULT now()
   );

   CREATE TABLE public.order_items (
     id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
     order_id uuid REFERENCES public.orders(id),
     product_name text NOT NULL,
     quantity integer DEFAULT 1,
     price_at_purchase numeric NOT NULL,
     metadata jsonb
   );

   -- Other tables: reviews, special_occasions, promotions...
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
