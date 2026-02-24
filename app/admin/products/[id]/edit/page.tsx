import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "../../_components/ProductForm";
import { notFound } from "next/navigation";

import { Product } from "@/types";

export const metadata = {
    title: "Edit Product - Admin",
};

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !product) {
        notFound();
    }

    return (
        <div className="py-6">
            <ProductForm product={product as unknown as Product} />
        </div>
    );
}
