import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const orderId = params.id;

        // 2. validate order id
        if (!orderId || orderId === 'undefined' || orderId === 'null') {
            return NextResponse.json({ error: "Invalid Order ID" }, { status: 400 });
        }

        const supabase = await createClient();
        const {
            deliveryType,
            deliveryAddressSnapshot,
            deliveryDate,
            deliverySlot,
            paymentMethod
        } = await request.json();

        const { error } = await supabase
            .from('orders')
            .update({
                // @ts-ignore
                delivery_type: deliveryType,
                // @ts-ignore
                delivery_address_snapshot: deliveryAddressSnapshot,
                // @ts-ignore
                delivery_date: deliveryDate ? new Date(deliveryDate).toISOString() : null,
                // @ts-ignore
                delivery_slot: deliverySlot,
                // @ts-ignore
                payment_method: paymentMethod || 'card'
            })
            .eq('id', orderId); // Use the validated orderId

        if (error) {
            console.error('Error updating order:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error in PATCH /api/account/orders/[id]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}