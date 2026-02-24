"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProduct(formData: FormData) {
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const basePrice = parseFloat(formData.get("base_price") as string);
    const categoryId = formData.get("category_id") as string;
    const productType = formData.get("product_type") as string;
    const imageUrl = formData.get("image_url") as string;
    const isAvailable = formData.get("is_available") === "on";
    const customizable = formData.get("customizable") === "on";

    const { error } = await supabase.from("products").insert({
        name,
        description,
        base_price: basePrice,
        category_id: categoryId,
        product_type: productType,
        image_url: imageUrl || null,
        is_available: isAvailable,
        customizable,
    });

    if (error) {
        console.error("Error creating product:", error);
        return { error: error.message };
    }

    revalidatePath("/admin/products");
    redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const basePrice = parseFloat(formData.get("base_price") as string);
    const categoryId = formData.get("category_id") as string;
    const productType = formData.get("product_type") as string;
    const imageUrl = formData.get("image_url") as string;
    const isAvailable = formData.get("is_available") === "on";
    const customizable = formData.get("customizable") === "on";

    const { error } = await supabase
        .from("products")
        .update({
            name,
            description,
            base_price: basePrice,
            category_id: categoryId,
            product_type: productType,
            image_url: imageUrl || null,
            is_available: isAvailable,
            customizable,
        })
        .eq("id", id);

    if (error) {
        console.error("Error updating product:", error);
        return { error: error.message };
    }

    revalidatePath("/admin/products");
    redirect("/admin/products");
}

export async function deleteProduct(id: string) {
    const supabase = await createClient();

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
        console.error("Error deleting product:", error);
        return { error: error.message };
    }

    revalidatePath("/admin/products");
}
