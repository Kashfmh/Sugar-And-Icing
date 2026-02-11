import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
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
                payment_method: paymentMethod || 'card' // Default to card for now if not specified
            })
            .eq('id', params.id);

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
