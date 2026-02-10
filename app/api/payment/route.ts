import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { items, userId, userEmail } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 401 });
    }

    // initialize server client
    const supabase = await createClient();

    // collect ids
    const potentialIds = items.map((item: any) => item.id.split('-')[0]);

    let products: any[] = [];

    // fetch products by id first
    if (potentialIds.length > 0) {
      const { data, error } = await supabase
        .from('products')
        .select('id, base_price, name')
        .in('id', potentialIds);

      if (!error && data) {
        products = data;
      }
    }

    let serverTotal = 0;
    const dbOrderItems: any[] = [];

    // process items with fallback mechanism
    for (const item of items) {
      const productId = item.id.split('-')[0];
      let product = products.find((p) => p.id === productId);

      // fallback: if id lookup failed, try finding by name
      if (!product) {
        console.warn(`Product ID ${productId} not found. Trying fallback by name: ${item.name}`);
        const { data: nameData } = await supabase
          .from('products')
          .select('id, base_price, name')
          .eq('name', item.name)
          .single();

        if (nameData) {
          product = nameData;
        }
      }

      let price = 0;
      let productName = item.name;
      let finalProductId = null;

      if (product) {
        price = Number(product.base_price);
        productName = product.name;
        finalProductId = product.id;
      } else {
        console.warn(`Item ${item.name} not found in DB via ID or Name. Using client price.`);
        price = Number(item.price);
      }

      serverTotal += price * item.quantity;

      dbOrderItems.push({
        product_id: finalProductId,
        product_name: productName,
        quantity: item.quantity,
        price_at_purchase: price,
        metadata: item.metadata || item.selectedOptions || {}
      });
    }

    // create order
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

    // insert items
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

    // create payment intent
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