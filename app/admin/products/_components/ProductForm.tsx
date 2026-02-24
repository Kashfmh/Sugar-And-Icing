"use client";

import { useTransition } from "react";
import { createProduct, updateProduct } from "../_actions";
import { Product } from "@/types";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export function ProductForm({ product }: { product?: Product }) {
    const [isPending, startTransition] = useTransition();

    const isEditing = !!product;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(() => {
            if (isEditing && product.id) {
                updateProduct(product.id, formData);
            } else {
                createProduct(formData);
            }
        });
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/products" className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                    <ArrowLeft className="h-5 w-5 text-neutral-600" />
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">
                    {isEditing ? "Edit Product" : "Add New Product"}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border shadow-sm mt-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 col-span-2">
                        <label htmlFor="name" className="text-sm font-medium">Product Name</label>
                        <input
                            id="name"
                            name="name"
                            required
                            defaultValue={product?.name || ""}
                            className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="e.g. Chocolate Truffle Cake"
                        />
                    </div>

                    <div className="space-y-2 col-span-2">
                        <label htmlFor="description" className="text-sm font-medium">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            defaultValue={product?.description || ""}
                            className="flex min-h-[80px] w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Describe the product..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="base_price" className="text-sm font-medium">Base Price (₹)</label>
                        <input
                            id="base_price"
                            name="base_price"
                            type="number"
                            step="0.01"
                            required
                            defaultValue={product?.base_price || ""}
                            className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="image_url" className="text-sm font-medium">Image URL (Optional)</label>
                        <input
                            id="image_url"
                            name="image_url"
                            type="url"
                            defaultValue={product?.image_url || ""}
                            className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="category_id" className="text-sm font-medium">Category</label>
                        <select
                            id="category_id"
                            name="category_id"
                            required
                            defaultValue={product?.category_id || "cakes"}
                            className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="cakes">Cakes</option>
                            <option value="custom-cakes">Custom Cakes</option>
                            <option value="cupcakes">Cupcakes</option>
                            <option value="brownies">Brownies</option>
                            <option value="cookies">Cookies</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="product_type" className="text-sm font-medium">Product Type</label>
                        <select
                            id="product_type"
                            name="product_type"
                            required
                            defaultValue={product?.product_type || "standard"}
                            className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="standard">Standard</option>
                            <option value="custom">Custom</option>
                            <option value="seasonal">Seasonal</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 mt-4 space-x-2">
                        <input
                            type="checkbox"
                            id="is_available"
                            name="is_available"
                            defaultChecked={product ? product.is_available : true}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="is_available" className="text-sm font-medium leading-none">
                            Available for Purchase
                        </label>
                    </div>

                    <div className="flex items-center gap-2 mt-4 space-x-2">
                        <input
                            type="checkbox"
                            id="customizable"
                            name="customizable"
                            defaultChecked={product ? product.customizable : false}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="customizable" className="text-sm font-medium leading-none">
                            Customizable (e.g. Message on cake)
                        </label>
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-4 border-t">
                    <Link
                        href="/admin/products"
                        className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-neutral-50 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 px-6 py-2 rounded-md font-medium text-sm transition-colors disabled:opacity-50"
                    >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        {isEditing ? "Save Changes" : "Create Product"}
                    </button>
                </div>
            </form>
        </div>
    );
}
