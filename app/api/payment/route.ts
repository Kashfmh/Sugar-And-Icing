import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { paymentSchema } from '@/lib/validations';
import { verifyTurnstileToken } from '@/lib/turnstile';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = paymentSchema.safeParse(body);

    if (!result.success) {
      const errorMessage = result.error.issues[0]?.message || 'Invalid request data';
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { items, userId, userEmail, orderId, deliveryType, addressSnapshot, deliveryDate, deliverySlot, turnstileToken } = body;

    // --- TURNSTILE VERIFICATION ---
    // Bypass for development/tests if needed, or strictly enforce
    if (!turnstileToken) {
      return NextResponse.json({ error: "Security check failed. Please refresh and try again." }, { status: 403 });
    }
    const isHuman = await verifyTurnstileToken(turnstileToken);
    if (!isHuman) {
      return NextResponse.json({ error: "Security check failed. Bot detected." }, { status: 403 });
    }
    // -----------------------------

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 401 });
    }

    // initialize server client
    const supabase = await createClient();

    // --- FIX 1: Validate orderId is not the string "undefined" ---
    const isValidOrderId = orderId && orderId !== 'undefined' && orderId !== 'null';

    // IF ORDER ID EXISTS: Fetch and Resume
    if (isValidOrderId) {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();

      if (orderError || !order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Check if already paid
      if (order.status === 'paid' || order.status === 'succeeded') {
        return NextResponse.json({ error: "Order already paid" }, { status: 400 });
      }

      // Create Payment Intent for existing order
      // We use the total from the database, not the client
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.total_amount * 100),
        currency: 'myr',
        automatic_payment_methods: { enabled: true },
        metadata: {
          order_id: order.id,
          user_id: userId,
          user_email: userEmail || ""
        },
      });

      // Update the order with intent ID
      await supabase
        .from('orders')
        .update({
          // @ts-ignore
          stripe_payment_intent_id: paymentIntent.id
        })
        .eq('id', order.id);

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        orderId: order.id
      });
    }

    // IF NO ORDER ID: Create New (Existing Logic)
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // --- FIX 2: Sanitize Product IDs ---
    // 1. Split the ID
    // 2. Filter out "undefined", null, or empty strings to prevent UUID crash
    const potentialIds = items
      .map((item: any) => item.id.split('-')[0])
      .filter((id: string) => id && id !== 'undefined' && id !== 'null');

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
        console.error(`Security Alert: Item ${item.name} not found in DB. Rejecting order.`);
        return NextResponse.json({ error: `Invalid item in cart: ${item.name}` }, { status: 400 });
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

    // --- FIX 3: Atomic Stock Deduction (Race Condition Protection) ---
    const stockItems = dbOrderItems.map(item => ({
      id: item.product_id,
      quantity: item.quantity
    }));

    // Call RPC function to check and deduct stock atomically
    // @ts-ignore - RPC function added via SQL, types not yet generated
    const { error: stockError } = await supabase.rpc('deduct_stock_atomic', {
      order_items: stockItems
    });

    if (stockError) {
      console.error("Stock Deduction Failed:", stockError);
      // Construct a friendly error message
      return NextResponse.json({
        error: `Stock unavailable: ${stockError.message.replace('Insufficient stock for product id ', 'Item out of stock: ')}`
      }, { status: 400 });
    }
    // -------------------------------------------------------------

    // create order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        // @ts-ignore - Schema updated but types not yet generated
        user_id: userId,
        total_amount: serverTotal,
        status: 'pending_payment',
        receipt_url: null,
        // @ts-ignore
        delivery_type: deliveryType,
        // @ts-ignore
        delivery_address_snapshot: addressSnapshot || null,
        // @ts-ignore
        delivery_date: deliveryDate ? new Date(deliveryDate).toISOString() : null, // Ensure ISO string for timestamptz
        // @ts-ignore
        delivery_slot: deliverySlot || null
      })
      .select('id')
      .single();

    if (orderError) {
      console.error("Order Creation Error:", orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    const newOrderId = orderData.id;
    if (!newOrderId) throw new Error("Database failed to return Order ID");

    // insert items
    const itemsToInsert = dbOrderItems.map(item => ({
      ...item,
      order_id: newOrderId
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
        order_id: newOrderId,
        user_id: userId,
        user_email: userEmail || ""
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: newOrderId
    });

  } catch (error: any) {
    console.error("Payment API Critical Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}