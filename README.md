# 🍰 Sugar And Icing

<div align="center">

<img src="public/images/logo/full-logo-pink.svg" alt="Sugar And Icing" width="100" />

**A high-performance, component-based e-commerce architecture designed for artisanal bakeries.**

[![Next.js](https://img.shields.io/badge/Next.js-16.1.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Stripe](https://img.shields.io/badge/Stripe-Payment-635BFF?style=for-the-badge&logo=stripe)](https://stripe.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3fcf8e?style=for-the-badge&logo=supabase)](https://supabase.com/)

[View Demo](#) • [Report Bug](#) • [Request Feature](#)

</div>

## 📖 About The Project

**Sugar And Icing** is not just a bakery website; it is an engineered e-commerce solution built to demonstrate a strict **Component-Based Structure (CBS)**. Unlike traditional monolithic frontends, this project decouples business logic (Hooks) from presentation layers (Components), ensuring enterprise-grade maintainability and scalability.

Designed with **performance** and **security** first, it leverages the Next.js 16 App Router for server-side optimization and Supabase for robust data integrity with Row Level Security (RLS).

## 🏗️ Architecture Design

The system follows a modern **Serverless/Edge** architecture, utilizing Next.js as the orchestrator for both frontend UI and backend API routes.

// diagram goes here

## 🚀 Key Features

### 1. Enterprise Component-Based Architecture (CBS)
A strict architectural pattern that separates "Orchestrator Pages," "Atomic View Components," and "Logic Hooks." This ensures zero logical coupling in UI layers, making the codebase highly testable and modular.

### 2. Secure Payment Orchestration
Integrated **Stripe Payment Elements** with server-side validation. The checkout flow handles intent creation, client secret management, and secure webhook validation to ensure PCI compliance and transactional integrity.

### 3. Full-Stack Order Lifecycle Management
End-to-end order processing utilizing **Supabase Row Level Security (RLS)**. User sessions are protected via JWT, ensuring that order history, profile data, and cart states are cryptographically secure and isolated per user.

## 📺 Usage / Demo

> [!NOTE] 
> *Full video walkthrough coming soon!*

[![Watch the Demo](https://placehold.co/600x400/png?text=Watch+Demo)](https://your-youtube-link-here)

## 🛠️ Built With

*   **Framework**: Next.js 16 (App Router)
*   **Language**: TypeScript (Strict Mode)
*   **Styling**: Tailwind CSS 4 & Framer Motion
*   **Database & Auth**: Supabase
*   **Payments**: Stripe

## 🏁 Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Kashfmh/Sugar-And-Icing.git
    ```
2.  **Install dependencies**
    ```bash
    npm install
    ```
3.  **Start the development server**
    ```bash
    npm run dev
    ```

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contacts

**Kashfmh**  
[![GitHub](https://img.shields.io/badge/GitHub-Kashfmh-181717?style=flat&logo=github)](https://github.com/Kashfmh)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat&logo=linkedin)](https://linkedin.com/in/your-linkedin-profile)

<div align="center">
    <br />
    <p><i>Made with strict engineering standards by Kashfmh</i></p>
</div>
