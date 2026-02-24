"use client";

import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { ChevronRight, CloudUpload, Image as ImageIcon, Globe, Edit2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminAddNewProductPage() {
    const supabase = createClient();
    const router = useRouter();

    // Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("custom-cakes");
    const [dietaryTags, setDietaryTags] = useState("");
    const [basePrice, setBasePrice] = useState("");
    const [premiumPrice, setPremiumPrice] = useState("");
    const [isAvailable, setIsAvailable] = useState(true);
    const [isCustomizable, setIsCustomizable] = useState(true);
    const [status, setStatus] = useState("published");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async () => {
        setIsSubmitting(true);
        // Note: Image uploading is mocked for this UI phase. In a real app we'd upload to Supabase Storage first.

        try {
            const { error } = await supabase.from('products').insert({
                name,
                description,
                category_id: categoryId, // Assuming category_id matches custom-cakes, cupcakes etc
                base_price: parseFloat(basePrice) || 0,
                // price could map to premiumPrice if custom, leaving out for now
                is_available: isAvailable,
                customizable: isCustomizable,
                tags: dietaryTags ? dietaryTags.split(',').map(tag => tag.trim()) : [],
                // Mock image for styling
                image_url: "https://images.unsplash.com/photo-1579306194872-64d8b14caac6?auto=format&fit=crop&q=80&w=800"
            } as any);

            if (error) throw error;
            router.push('/admin/products');
            router.refresh();
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Failed to save product.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 pb-12">
            {/* Header & Breadcrumbs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center text-sm text-neutral-500 mb-2">
                        <Link href="/admin/products" className="hover:text-sai-charcoal transition-colors">Products</Link>
                        <ChevronRight className="h-4 w-4 mx-2 text-neutral-400" />
                        <span className="text-sai-charcoal font-medium">Add New Product</span>
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-sai-charcoal tracking-tight">Add New Treat</h1>
                    <p className="text-neutral-500 text-sm mt-1">Fill in the details below to add a new baked good to the catalog.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/admin/products" className="px-5 py-2.5 border border-neutral-200 text-neutral-600 bg-white shadow-sm hover:bg-neutral-50 font-semibold text-sm rounded-lg transition-colors">
                        Cancel
                    </Link>
                    <button className="px-5 py-2.5 bg-[#F48FB1] text-white shadow-sm hover:bg-[#d87c9d] font-semibold text-sm rounded-lg transition-colors flex items-center gap-2">
                        Save Product
                    </button>
                </div>
            </div>

            {/* Split Form Layout */}
            <div className="grid lg:grid-cols-3 gap-8 items-start">

                {/* Main Content Column (2/3) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Product Details Card */}
                    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8">
                        <h2 className="text-xl font-serif font-bold text-sai-charcoal tracking-tight mb-6">Product Details</h2>

                        <div className="space-y-6">
                            {/* Product Name */}
                            <div>
                                <label className="block text-sm font-semibold text-sai-charcoal mb-2">Product Name</label>
                                <input
                                    type="text"
                                    className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sai-charcoal focus:outline-none focus:ring-2 focus:ring-sai-pink/20 focus:border-sai-pink transition-all"
                                    placeholder="e.g. Red Velvet Dream Cake"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-sai-charcoal mb-2">Description</label>
                                <textarea
                                    className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sai-charcoal focus:outline-none focus:ring-2 focus:ring-sai-pink/20 focus:border-sai-pink transition-all h-32 resize-y"
                                    placeholder="Describe the flavors, texture, and ingredients..."
                                ></textarea>
                                <p className="text-xs text-neutral-400 mt-2">Keep it short and sweet. Markdown is supported.</p>
                            </div>

                            {/* Category & Tags Row */}
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-sai-charcoal mb-2">Category</label>
                                    <select className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sai-charcoal focus:outline-none focus:ring-2 focus:ring-sai-pink/20 focus:border-sai-pink transition-all appearance-none bg-white">
                                        <option value="custom-cakes">Custom Cakes</option>
                                        <option value="cupcakes">Cupcakes</option>
                                        <option value="cookies">Cookies</option>
                                        <option value="pastries">Pastries</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-sai-charcoal mb-2">Dietary Tags</label>
                                    <input
                                        type="text"
                                        className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sai-charcoal focus:outline-none focus:ring-2 focus:ring-sai-pink/20 focus:border-sai-pink transition-all"
                                        placeholder="e.g. Gluten-Free, Vegan"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Inventory Card */}
                    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8">
                        <h2 className="text-xl font-serif font-bold text-sai-charcoal tracking-tight mb-6">Pricing & Inventory</h2>

                        <div className="space-y-6">
                            {/* Base Price & Premium Row */}
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-sai-charcoal mb-2">Base Price (RM)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">RM</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full border border-neutral-200 rounded-lg pl-12 pr-4 py-3 text-sai-charcoal focus:outline-none focus:ring-2 focus:ring-sai-pink/20 focus:border-sai-pink transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-sai-charcoal mb-2">Premium / Custom Price (RM)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">RM</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full border border-neutral-200 rounded-lg pl-12 pr-4 py-3 text-sai-charcoal focus:outline-none focus:ring-2 focus:ring-sai-pink/20 focus:border-sai-pink transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Enable Bulk Discount Toggle */}
                            <div className="bg-pink-50/50 border border-pink-100 rounded-xl p-5 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-sai-charcoal text-sm">Enable Bulk Discount</h3>
                                    <p className="text-xs text-neutral-500 mt-1">Apply automatic 10% off for orders over 12 units.</p>
                                </div>
                                {/* Visual Toggle Switch (Mock) */}
                                <div className="w-11 h-6 bg-[#F48FB1] rounded-full flex items-center p-1 cursor-pointer transition-colors relative">
                                    <div className="w-4 h-4 bg-white rounded-full shadow-sm absolute right-1"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column (1/3) */}
                <div className="space-y-6">

                    {/* Visibility Card */}
                    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6">
                        <h2 className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-6">Visibility</h2>

                        <div className="space-y-5">
                            {/* Available Check */}
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="mt-0.5 relative flex items-center justify-center w-5 h-5 rounded-full border-2 border-[#F48FB1] bg-[#F48FB1]">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                                <div>
                                    <span className="block text-sm font-semibold text-sai-charcoal group-hover:text-[#F48FB1] transition-colors">Available for Purchase</span>
                                    <span className="block text-xs text-neutral-400 mt-0.5">Show this product on the storefront.</span>
                                </div>
                            </label>

                            {/* Customizable Check */}
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="mt-0.5 relative flex items-center justify-center w-5 h-5 rounded-full border-2 border-neutral-300 bg-white group-hover:border-[#F48FB1] transition-colors">
                                </div>
                                <div>
                                    <span className="block text-sm font-semibold text-sai-charcoal group-hover:text-[#F48FB1] transition-colors">Customizable</span>
                                    <span className="block text-xs text-neutral-400 mt-0.5">Allow customers to add custom messages or toppings.</span>
                                </div>
                            </label>

                            <div className="pt-4 border-t border-neutral-100">
                                <label className="block text-sm font-semibold text-sai-charcoal mb-2">Publish Status</label>
                                <select className="w-full border border-neutral-200 rounded-lg px-4 py-2 text-sm text-sai-charcoal focus:outline-none focus:ring-2 focus:ring-sai-pink/20 focus:border-sai-pink transition-all appearance-none bg-white">
                                    <option value="published">Published</option>
                                    <option value="draft">Draft</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Product Image Card */}
                    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6">
                        <h2 className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-6">Product Image</h2>

                        <div className="border-2 border-dashed border-neutral-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-neutral-50 hover:border-sai-pink transition-all cursor-pointer">
                            <CloudUpload className="h-8 w-8 text-neutral-400 mb-3" />
                            <p className="text-sm font-medium text-neutral-600">
                                <span className="text-[#F48FB1] font-bold">Upload a file</span> or drag and drop
                            </p>
                            <p className="text-xs text-neutral-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                        </div>

                        {/* Image Preview Row */}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className="h-24 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-300 border border-neutral-200">
                                <span className="text-xs font-semibold uppercase tracking-wider">Preview text</span>
                            </div>
                            <div className="h-24 bg-neutral-50 rounded-xl border border-dashed border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-sai-pink hover:bg-pink-50 transition-colors cursor-pointer text-2xl font-light">
                                +
                            </div>
                        </div>
                    </div>

                    {/* SEO Preview Card */}
                    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">SEO Preview</h2>
                            <Edit2 className="h-3 w-3 text-neutral-400 cursor-pointer hover:text-sai-pink" />
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[11px] text-[#202124]">
                                <Globe className="h-3 w-3 text-neutral-400" />
                                <span>https://sugarandicing.com/products/...</span>
                            </div>
                            <h3 className="text-[15px] font-medium text-[#1a0dab] line-clamp-1 hover:underline cursor-pointer">
                                New Product Title - Sugar and Icing Bakery
                            </h3>
                            <p className="text-[13px] text-[#4d5156] line-clamp-2">
                                The description of the product will appear here in search results.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
