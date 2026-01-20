/**
 * Centralized className constants to maintain DRY principles
 * Use these instead of repeating className strings throughout the app
 */

// ============================================
// BUTTON STYLES
// ============================================

export const BUTTON_STYLES = {
    // Primary pink button
    primary: "bg-sai-pink text-white hover:bg-sai-pink/90 transition-colors",

    // Pink with shadow
    primaryWithShadow: "bg-sai-pink text-white hover:bg-sai-pink/90 shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 hover:-translate-y-0.5 transition-all",

    // Outline pink
    outline: "border-2 border-sai-pink text-sai-pink hover:bg-sai-pink hover:text-white transition-colors",

    // Ghost/subtle hover
    ghost: "hover:bg-sai-pink/10 hover:text-sai-pink transition-colors",

    // Charcoal button
    charcoal: "bg-sai-charcoal text-white hover:bg-sai-charcoal/90 transition-colors",
} as const;

// ============================================
// DROPDOWN/MENU ITEM STYLES
// ============================================

export const DROPDOWN_STYLES = {
    // Standard dropdown item (used 17+ times)
    item: "hover:bg-sai-pink/5 focus:bg-sai-pink/10 focus:text-sai-pink cursor-pointer",

    // Active/selected item
    activeItem: "bg-sai-pink/10 text-sai-pink font-medium",
} as const;

// ============================================
// BADGE/CIRCLE STYLES
// ============================================

export const BADGE_STYLES = {
    // Small pink circle (used for cart count, etc)
    cartCount: "absolute -top-1 -right-1 bg-sai-pink text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-in zoom-in duration-200",

    // Number badge circle - small
    numberSm: "w-6 h-6 rounded-full bg-sai-pink text-white flex items-center justify-center text-xs font-semibold",

    // Number badge circle - medium
    numberMd: "w-10 h-10 rounded-full bg-sai-pink text-white flex items-center justify-center text-lg font-bold",

    // Number badge circle - large
    numberLg: "w-12 h-12 rounded-full bg-sai-pink text-white flex items-center justify-center text-xl font-bold",

    // Number badge circle - extra large
    numberXl: "w-14 h-14 rounded-full bg-sai-pink text-white flex items-center justify-center text-2xl font-bold",
} as const;

// ============================================
// TOGGLE SWITCH STYLES
// ============================================

export const TOGGLE_SWITCH = {
    // Complete toggle switch (used 3x in profile settings)
    container: "relative inline-flex items-center cursor-pointer",

    input: "sr-only peer",

    slider: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sai-pink",
} as const;

// ============================================
// SOCIAL ICON STYLES
// ============================================

export const SOCIAL_ICON = {
    // Round social media icons (used 3x on homepage)
    base: "w-8 h-8 rounded-full bg-sai-white flex items-center justify-center hover:bg-sai-pink transition-colors",
} as const;

// ============================================
// FILTER BUTTON STYLES
// ============================================

export const FILTER_BUTTON = {
    // Mobile filter button (used on cakes & treats pages)
    mobile: "relative w-12 h-12 rounded-xl bg-sai-pink text-white flex items-center justify-center hover:bg-sai-pink/90 transition-colors",

    // Filter badge indicator
    badge: "absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-sai-white",
} as const;

// ============================================
// CARD STYLES
// ============================================

export const CARD_STYLES = {
    // Standard card
    base: "bg-white rounded-xl shadow-sm border border-gray-200",

    // Card with hover effect
    hoverable: "bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow",

    // Pink accent card
    pinkAccent: "bg-white rounded-xl border-t-4 border-sai-pink shadow-sm",
} as const;

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Combine multiple className strings
 * @param classes - Array of className strings
 * @returns Combined className string
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}

/**
 * Get button classes with optional additional classes
 * @param variant - Button variant from BUTTON_STYLES
 * @param additionalClasses - Extra classes to add
 */
export function getButtonClasses(
    variant: keyof typeof BUTTON_STYLES,
    additionalClasses?: string
): string {
    return cn(BUTTON_STYLES[variant], additionalClasses);
}

/**
 * Get dropdown item classes
 * @param isActive - Whether item is active/selected
 * @param additionalClasses - Extra classes to add
 */
export function getDropdownItemClasses(
    isActive = false,
    additionalClasses?: string
): string {
    return cn(
        DROPDOWN_STYLES.item,
        isActive && DROPDOWN_STYLES.activeItem,
        additionalClasses
    );
}
