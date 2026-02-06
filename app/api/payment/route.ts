import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { items, userId, userEmail } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }

    const authHeader = req.headers.get('Authorization');

    const supabase = createClient(
      supabaseUrl,
      supabaseKey,
      {
        global: {
          headers: authHeader ? { Authorization: authHeader } : {}
        }
      }
    );

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validIds = items
      .map((item: any) => item.id.split('-')[0])
      .filter((id: string) => uuidRegex.test(id));

    let serverTotal = 0;
    let products: any[] = [];
    const dbOrderItems: any[] = [];

    if (validIds.length > 0) {
      const { data, error } = await supabase
        .from('products')
        .select('id, base_price, name')
        .in('id', validIds);

      if (error) {
        console.error("Supabase Product Query Error:", error);
        throw new Error(`Database Error: ${error.message}`);
      }
      products = data || [];
    }

    for (const item of items) {
      const productId = item.id.split('-')[0];
      const product = products.find((p) => p.id === productId);

      let price = 0;
      let productName = item.name;

      if (product) {
        price = Number(product.base_price);
        productName = product.name;
      } else {
        // Fallback for custom/test items
        console.warn(`Item ${item.name} not found in DB. Using client price.`);
        price = Number(item.price);
      }

      serverTotal += price * item.quantity;

      dbOrderItems.push({
        product_id: product ? product.id : null,
        product_name: productName,
        quantity: item.quantity,
        price_at_purchase: price,
        metadata: item.selectedOptions || {}
      });
    }

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total_amount: serverTotal,
        status: 'pending_payment',
        receipt_url: null,
      })
      .select('id')
      .single();

    if (orderError) {
      console.error("Order Creation Error:", orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    const orderId = orderData.id;

    const itemsToInsert = dbOrderItems.map(item => ({
      ...item,
      order_id: orderId
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert);

    if (itemsError) {
      console.error("Order Items Creation Error:", itemsError);
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(serverTotal * 100),
      currency: 'myr',
      automatic_payment_methods: { enabled: true },
      metadata: {
        order_id: orderId,
        user_id: userId,
        user_email: userEmail || ""
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: orderId
    });

  } catch (error: any) {
    console.error("Payment API Critical Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}