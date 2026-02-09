import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error("Missing Supabase credentials in environment variables.");
        return NextResponse.json(
            { error: 'Server configuration error' },
            { status: 500 }
        );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    try {
        const { userId, confirmText } = await request.json();

        if (confirmText !== 'DELETE') {
            return NextResponse.json(
                { error: 'Invalid confirmation' },
                { status: 400 }
            );
        }

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID required' },
                { status: 400 }
            );
        }

        const { data: activeOrders, error: ordersError } = await supabaseAdmin
            .from('orders')
            .select('id, status')
            .eq('user_id', userId)
            .in('status', ['pending_payment', 'processing', 'preparing']);

        if (ordersError) {
            console.error('Error checking orders:', ordersError);
            return NextResponse.json(
                { error: 'Failed to check active orders' },
                { status: 500 }
            );
        }

        if (activeOrders && activeOrders.length > 0) {
            return NextResponse.json(
                {
                    error: 'Cannot delete account with active orders',
                    activeOrders: activeOrders.length,
                    message: `You have ${activeOrders.length} order(s) in progress. Please wait until all orders are completed or cancelled before deleting your account.`
                },
                { status: 400 }
            );
        }

        // delete cart items
        const { error: cartError } = await supabaseAdmin
            .from('cart_items')
            .delete()
            .eq('user_id', userId);

        if (cartError) {
            console.error('Error deleting cart items:', cartError);
        }

        // delete order items (for completed orders)
        const { data: userOrders } = await supabaseAdmin
            .from('orders')
            .select('id')
            .eq('user_id', userId);

        if (userOrders && userOrders.length > 0) {
            const orderIds = userOrders.map(o => o.id);

            const { error: orderItemsError } = await supabaseAdmin
                .from('order_items')
                .delete()
                .in('order_id', orderIds);

            if (orderItemsError) {
                console.error('Error deleting order items:', orderItemsError);
            }
        }

        // delete orders
        const { error: ordersDeleteError } = await supabaseAdmin
            .from('orders')
            .delete()
            .eq('user_id', userId);

        if (ordersDeleteError) {
            console.error('Error deleting orders:', ordersDeleteError);
        }

        // delete profile
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (profileError) {
            console.error('Error deleting profile:', profileError);
        }

        // delete user from auth
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (authError) {
            console.error('Error deleting auth user:', authError);
            return NextResponse.json(
                { error: 'Failed to delete user account' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Delete account error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}