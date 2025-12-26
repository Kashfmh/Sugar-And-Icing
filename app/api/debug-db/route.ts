import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Fetch products
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('*')
            .limit(10);

        // Fetch categories if table exists
        const { data: categories, error: categoriesError } = await supabase
            .from('categories')
            .select('*')
            .limit(10);

        return NextResponse.json({
            success: true,
            products: products || [],
            productsError: productsError?.message,
            categories: categories || [],
            categoriesError: categoriesError?.message,
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
        });
    }
}
