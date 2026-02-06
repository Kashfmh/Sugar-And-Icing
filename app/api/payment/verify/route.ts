
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const { orderId, paymentIntentId } = await req.json();

        if (!orderId && !paymentIntentId) {
            return NextResponse.json({ error: "Missing Order ID or Payment Intent ID" }, { status: 400 });
        }

        let intent;
        if (paymentIntentId) {
            intent = await stripe.paymentIntents.retrieve(paymentIntentId);
        } else {
            return NextResponse.json({ error: "Payment Intent ID required for verification" }, { status: 400 });
        }

        if (intent.status === 'succeeded') {
            const derivedOrderId = intent.metadata.order_id || orderId;
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
            const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            if (!supabaseServiceKey) {
                console.error("Missing Service Role Key for Verification");
                return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
            }

            const supabase = createClient(supabaseUrl, supabaseServiceKey, {
                auth: { persistSession: false, autoRefreshToken: false }
            });

            const { error } = await supabase
                .from('orders')
                .update({
                    status: 'paid',
                    receipt_url: (intent as any).charges?.data[0]?.receipt_url || null
                })
                .eq('id', derivedOrderId);

            if (error) throw error;

            if (intent.metadata.user_id) {
                await supabase.from('cart_items').delete().eq('user_id', intent.metadata.user_id);
            }

            return NextResponse.json({ success: true, status: 'paid' });
        }

        return NextResponse.json({ success: false, status: intent.status });

    } catch (error: any) {
        console.error("Verification Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
