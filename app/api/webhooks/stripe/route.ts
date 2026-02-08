import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
    if (!endpointSecret) {
        console.error("Missing STRIPE_WEBHOOK_SECRET");
        return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
    }

    const body = await req.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');

    let event;

    try {
        if (!sig) throw new Error("Missing stripe-signature");
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: any) {
        console.error(`Webhook Signature Error: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as any;
        const orderId = paymentIntent.metadata.order_id;
        const userId = paymentIntent.metadata.user_id;

        console.log(`Payment succeeded for Order ID: ${orderId}`);

        if (orderId) {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
            const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            if (!supabaseServiceKey) {
                console.error("Missing SUPABASE_SERVICE_ROLE_KEY. Cannot update order status.");
                return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
            }

            const supabase = createClient(
                supabaseUrl,
                supabaseServiceKey,
                {
                    auth: {
                        persistSession: false,
                        autoRefreshToken: false,
                    }
                }
            );

            const { error: updateError } = await supabase
                .from('orders')
                .update({
                    status: 'paid',
                    receipt_url: paymentIntent.charges?.data[0]?.receipt_url || null
                })
                .eq('id', orderId);

            if (updateError) {
                console.error("Error updating order status:", updateError);
                return NextResponse.json({ error: "Database update failed" }, { status: 500 });
            } else {
                console.log(`Order ${orderId} marked as PAID.`);
            }

            const { data: orderItems, error: itemsError } = await supabase
                .from('order_items')
                .select('product_id, quantity')
                .eq('order_id', orderId);

            if (!itemsError && orderItems && orderItems.length > 0) {
                for (const item of orderItems) {
                    if (item.product_id) {
                        const { data: productData } = await supabase
                            .from('products')
                            .select('times_sold')
                            .eq('id', item.product_id)
                            .single();

                        if (productData) {
                            const newSold = (productData.times_sold || 0) + item.quantity;
                            await supabase
                                .from('products')
                                .update({ times_sold: newSold })
                                .eq('id', item.product_id);
                        }
                    }
                }
            }

            if (userId) {
                const { error: deleteError } = await supabase
                    .from('cart_items')
                    .delete()
                    .eq('user_id', userId);

                if (deleteError) {
                    console.error("Error clearing cart:", deleteError);
                } else {
                    console.log(`Cart cleared for user ${userId}`);
                }
            }
        }
    }

    return NextResponse.json({ received: true });
}