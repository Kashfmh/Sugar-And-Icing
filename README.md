# 🍰 Sugar And Icing - Premium Bakery Website

<div align="center">

![Sugar And Icing](public/images/logo/full-logo-pink.png)

**A modern, elegant e-commerce platform for custom cakes and artisanal treats**

[![Next.js](https://img.shields.io/badge/Next.js-16.1.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.89-3fcf8e?style=for-the-badge&logo=supabase)](https://supabase.com/)

[Live Demo](#) • [Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started)

</div>

---

## 🌟 Overview

**Sugar And Icing** is a full-featured bakery e-commerce platform designed for modern bakeries specializing in custom cakes and artisanal treats. Built with Next.js 16 and Supabase, it offers a delightful user experience with smooth animations, responsive design, and robust authentication.

### ✨ Why Sugar And Icing?

- 🎨 **Beautiful UI/UX** - Modern design with smooth animations and micro-interactions
- 📱 **Mobile-First** - Fully responsive across all devices
- 🔒 **Secure Authentication** - Complete auth system with password strength indicators
- 🍰 **Custom Cake Gallery** - Showcase your creations with an elegant gallery
- 🛒 **Smart Shopping** - Intuitive product browsing with filtering and search
- 🚀 **Lightning Fast** - Optimized for performance with Next.js 16

---

## 🎯 Features

### 🏠 Core Pages

- **Home** - Eye-catching hero section with featured products and CTAs
- **Custom Cakes** - Dedicated gallery for custom cake creations with pricing guide
- **Other Treats** - Browse cookies, cupcakes, and other bakery items
- **Contact** - Get in touch for orders and inquiries
- **Profile** - User dashboard with order history and account management

### 🔐 Authentication System

- **Sliding Panel UI** - Beautiful animated login/signup experience
- **Enhanced Security**
  - Input sanitization and XSS prevention
  - Email format validation
  - Phone number validation (Malaysia & India)
  - Password strength indicator with visual feedback (4-bar UI)
  - Confirm password matching
- **User Profiles** - Store customer information with first name and phone
- **Session Management** - Secure JWT-based authentication via Supabase

### 🎨 Design Features

- **Brand Colors** - Custom pink and charcoal color scheme
- **Animations** - Framer Motion for smooth page transitions
- **Responsive Navigation** 
  - Desktop: Glass-morphism navbar
  - Mobile: Bottom navigation with elevated cart
- **Product Display**
  - Grid view (desktop)
  - List view (mobile)
  - Allergen badges and filtering
  - Category-based browsing

### 🛍️ Product Management

- **Dynamic Product Catalog** - Supabase-powered product database
- **Image Optimization** - Next.js Image component for fast loading
- **Filtering & Search**
  - Category filters (Birthday, Wedding, Holiday, etc.)
  - Search functionality
  - Sort by date/price
- **Allergen Information** - Clear allergen labeling for customer safety

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first styling
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[Lucide React](https://lucide.dev/)** - Icon library

### Backend & Database
- **[Supabase](https://supabase.com/)** - Backend as a Service
  - PostgreSQL database
  - Authentication & user management
  - Row Level Security (RLS)
  - Real-time subscriptions

### UI Components
- **[Radix UI](https://www.radix-ui.com/)** - Accessible components
- **[class-variance-authority](https://cva.style/)** - Component variants
- **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** - Utility merging

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.x or higher
- **npm** or **yarn**
- **Supabase Account** (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kashfmh/Sugar-And-Icing.git
   cd sai-bakery
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**

   Run the following SQL in your Supabase SQL Editor:

   ```sql
   -- Products table
   CREATE TABLE products (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       name TEXT NOT NULL,
       description TEXT,
       price DECIMAL(10, 2) NOT NULL,
       category TEXT,
       image_url TEXT,
       tags TEXT[],
       created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Profiles table
   CREATE TABLE profiles (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
       first_name TEXT NOT NULL,
       phone TEXT NOT NULL,
       created_at TIMESTAMPTZ DEFAULT NOW(),
       updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE products ENABLE ROW LEVEL SECURITY;
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

   -- Public read access for products
   CREATE POLICY "Products are viewable by everyone"
       ON products FOR SELECT
       USING (true);

   -- Profile policies
   CREATE POLICY "Users can view own profile"
       ON profiles FOR SELECT
       USING (auth.uid() = user_id);

   CREATE POLICY "Users can update own profile"
       ON profiles FOR UPDATE
       USING (auth.uid() = user_id);

   CREATE POLICY "Enable insert for authenticated users"
       ON profiles FOR INSERT
       WITH CHECK (true);
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
sai-bakery/
├── app/                        # Next.js App Router
│   ├── components/            # Reusable UI components
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx
│   │   ├── BottomNav.tsx
│   │   ├── ProductCard.tsx
│   │   └── ...
│   ├── custom-cakes/          # Custom cakes page
│   ├── other-treats/          # Other treats page
│   ├── login/                 # Authentication
│   ├── profile/               # User profile
│   ├── contact/               # Contact page
│   └── layout.tsx             # Root layout
├── lib/                       # Utility functions
│   ├── auth.ts               # Authentication helpers
│   ├── supabase.ts           # Supabase client
│   └── utils.ts              # General utilities
├── public/                    # Static assets
│   └── images/               # Product & logo images
├── .env.local                # Environment variables
└── package.json              # Dependencies
```

---

## 🎨 Design System

### Color Palette

```css
--color-sai-pink: #F48FB1;         /* Primary brand color */
--color-sai-pink-dark: #EC407A;    /* Darker pink for hover states */
--color-sai-pink-light: #FCE4EC;   /* Light pink for backgrounds */
--color-sai-charcoal: #2C3E50;     /* Primary text color */
--color-sai-white: #FAFAF9;        /* Background color */
```

### Typography

- **Headings**: Serif font for elegance
- **Body**: Sans-serif for readability
- **Buttons**: Bold, uppercase for emphasis

---

## 🔒 Security Features

- **Input Sanitization** - All user inputs are sanitized to prevent XSS
- **Password Requirements**
  - Minimum 8 characters
  - At least 1 number
  - Real-time strength indicator
- **Email Validation** - RFC-compliant email format checking
- **Phone Validation** - Malaysian (+60) and Indian (+91) formats
- **Row Level Security** - Database-level access control
- **Secure Sessions** - JWT-based authentication

---

## 📱 Responsive Design

- **Desktop** (≥ 768px)
  - Glass-morphism navbar
  - Grid product layouts
  - Hover animations
  
- **Mobile** (< 768px)
  - Bottom navigation
  - List product views
  - Touch-optimized interactions
  - Compact layouts

---

## 🚧 Roadmap

- [ ] Shopping cart functionality
- [ ] Order management system
- [ ] Payment integration
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] Order tracking
- [ ] Customer reviews
- [ ] Wishlist feature

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Sugar And Icing Team**

- GitHub: [@Kashfmh](https://github.com/Kashfmh)

---

## 🙏 Acknowledgments

- Design inspiration from modern bakery websites
- Icons by [Lucide](https://lucide.dev/)
- Animations by [Framer Motion](https://www.framer.com/motion/)
- Backend by [Supabase](https://supabase.com/)

---

<div align="center">

**Made with 💕 and lots of 🍰**

[⬆ Back to Top](#-sugar-and-icing---premium-bakery-website)

</div>
