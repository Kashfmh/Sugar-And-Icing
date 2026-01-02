/**
 * Generate SEO-friendly slug from product name
 * Example: "Cupcakes - 12 pieces" -> "cupcakes-12-pieces"
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')      // Replace spaces with hyphens
        .replace(/-+/g, '-')       // Replace multiple hyphens with single
        .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
}

/**
 * Generate product slug from product data
 */
export function generateProductSlug(product: { id: string; name: string }): string {
    const nameSlug = slugify(product.name);
    // Use full UUID for accurate lookups
    return `${nameSlug}-${product.id}`;
}
