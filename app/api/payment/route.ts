import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { items } = await req.json();

    // Debug: Check if Env Vars are loaded
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. FILTER VALID UUIDs ONLY
    // If a cart item has an ID like "custom-cake", it will crash the DB query.
    // We only want to query DB for items that look like real UUIDs.
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    const validIds = items
        .map((item: any) => item.id.split('-')[0]) // Handle "uuid-option"
        .filter((id: string) => uuidRegex.test(id)); // Only keep real UUIDs

    let serverTotal = 0;
    let products: any[] = [];

    // 2. QUERY DB (Only if we have valid IDs)
    if (validIds.length > 0) {
        const { data, error } = await supabase
            .from('products')
            .select('id, base_price, name')
            .in('id', validIds);

        if (error) {
            console.error("Supabase Query Error:", error); // <--- CHECK TERMINAL FOR THIS
            throw new Error(`Database Error: ${error.message}`);
        }
        products = data || [];
    }

    // 3. CALCULATE TOTAL
    for (const item of items) {
      const productId = item.id.split('-')[0];
      const product = products.find((p) => p.id === productId);
      
      if (product) {
        // Price from DB (Secure)
        serverTotal += Number(product.base_price) * item.quantity;
      } else {
        // Fallback for items not in DB (e.g. Test items or Custom Cakes)
        // WARN: In a real app, you might want to block this.
        console.warn(`Item ${item.name} not found in DB. Using client price.`);
        serverTotal += Number(item.price) * item.quantity;
      }
    }

    // 4. CREATE STRIPE INTENT
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(serverTotal * 100), 
      currency: 'myr',
      automatic_payment_methods: { enabled: true },
      metadata: {
        product_ids: items.map((i: any) => i.id).join(','),
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error("Payment API Critical Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}