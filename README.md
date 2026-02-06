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
   -- Enable UUID
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

   -- Categories
   CREATE TABLE public.categories (
     id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
     name text NOT NULL UNIQUE,
     display_order integer DEFAULT 0
   );

   -- Products
   CREATE TABLE public.products (
     id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
     name text NOT NULL,
     description text,
     category_id uuid REFERENCES public.categories(id),
     base_price numeric NOT NULL,
     stock_quantity integer,
     image_url text,
     is_available boolean DEFAULT true
   );

   -- Profiles (Linked to Auth)
   CREATE TABLE public.profiles (
     id uuid NOT NULL REFERENCES auth.users(id) PRIMARY KEY,
     first_name text,
     last_name text,
     phone text,
     email text
   );

   -- Orders
   CREATE TABLE public.orders (
     id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id uuid REFERENCES auth.users(id),
     status text DEFAULT 'pending',
     total_amount numeric NOT NULL,
     created_at timestamp DEFAULT now()
   );

   -- Order Items
   CREATE TABLE public.order_items (
     id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
     order_id uuid REFERENCES public.orders(id),
     product_name text NOT NULL,
     quantity integer DEFAULT 1,
     price_at_purchase numeric NOT NULL,
     metadata jsonb
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
