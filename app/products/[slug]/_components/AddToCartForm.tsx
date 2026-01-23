import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { ProductOption } from '@/hooks/useProductDetails';
import Counter from '@/app/components/Counter';
import { ChevronDown, Check, ShoppingCart } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AddToCartFormProps {
    product: any;
    options: ProductOption[];
}

export default function AddToCartForm({ product, options }: AddToCartFormProps) {
    const { addItem } = useCart();

    const [selectedBase, setSelectedBase] = useState<string>('');
    const [selectedFrosting, setSelectedFrosting] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [designNotes, setDesignNotes] = useState('');
    const [selectedTopping, setSelectedTopping] = useState<string>('None');
    const [selectedDietaryOptions, setSelectedDietaryOptions] = useState<string[]>([]);
    const [isAdded, setIsAdded] = useState(false);

    const baseOptions = options.filter(opt => opt.option_category === 'base');
    const frostingOptions = options.filter(opt => opt.option_category === 'frosting');
    const toppingOptions = options.filter(opt => opt.option_category === 'topping');
    const dietaryOptions = options.filter(opt => opt.option_category === 'dietary');

    const calculatePrice = () => {
        if (!product) return 0;

        // For cupcakes with tiered pricing (6pc and 12pc sets)
        if (product.product_type === 'cupcake_basic' || product.product_type === 'cupcake_premium') {
            let baseTotal = 0;
            // Quantity 1 = 6 pieces = base_price
            // Quantity 2 = 12 pieces = premium_price (discounted)
            if (quantity === 1) {
                baseTotal = product.base_price;
            } else if (quantity === 2 && product.premium_price) {
                baseTotal = product.premium_price;
            } else if (quantity > 2 && product.premium_price) {
                // For quantities > 2, calculate proportionally from the 12pc price
                baseTotal = product.premium_price * (quantity / 2);
            } else {
                baseTotal = product.base_price * quantity;
            }

            // Calculate dietary cost (per piece logic: 6 pieces per quantity unit)
            const totalPieces = quantity * 6;
            let dietaryCost = 0;

            selectedDietaryOptions.forEach(dietaryName => {
                const dietaryOption = dietaryOptions.find(opt => opt.option_name === dietaryName);
                if (dietaryOption) {
                    dietaryCost += (dietaryOption.price_modifier * totalPieces);
                }
            });

            return baseTotal + dietaryCost;
        }

        // For brownies (per piece pricing with toppings and dietary options)
        if (product.product_type === 'brownie') {
            let pricePerPiece = product.base_price; // RM 3

            // Check if premium topping selected (any topping makes it RM 4)
            if (selectedTopping && selectedTopping !== 'None') {
                const toppingOption = toppingOptions.find(opt => opt.option_name === selectedTopping);
                if (toppingOption?.is_premium) {
                    pricePerPiece = product.premium_price; // RM 4
                }
            }

            // Add dietary option costs (cumulative)
            selectedDietaryOptions.forEach(dietaryName => {
                const dietaryOption = dietaryOptions.find(
                    opt => opt.option_name === dietaryName
                );
                if (dietaryOption) {
                    pricePerPiece += dietaryOption.price_modifier;
                }
            });

            return pricePerPiece * quantity;
        }

        // For other products (Fruitcake, Bread, Other)
        // Pricing is per unit
        let basePrice = product.base_price;

        let total = basePrice * quantity;

        // Add dietary costs per unit
        selectedDietaryOptions.forEach(dietaryName => {
            const dietaryOption = dietaryOptions.find(opt => opt.option_name === dietaryName);
            if (dietaryOption) {
                total += (dietaryOption.price_modifier * quantity);
            }
        });

        return total;
    };

    const handleAddToCart = () => {
        if (!product) return;

        const finalPrice = calculatePrice();

        // For individual items (not bulk sets like cupcakes 6/12), unit price needs to be derived
        let unitPriceForCart = 0;

        if (product.product_type === 'cupcake_basic' || product.product_type === 'cupcake_premium') {
            // Basic unit price calculation
            unitPriceForCart = finalPrice / quantity;
        } else {
            // Standard items
            unitPriceForCart = finalPrice / quantity;
        }

        const metadata = {
            base: selectedBase,
            frosting: selectedFrosting,
            topping: selectedTopping,
            dietary: selectedDietaryOptions,
            design_notes: designNotes
        };

        // Create a unique ID for this specific customization to separate it in the cart
        const customId = `${product.id}-${JSON.stringify(metadata)}-${unitPriceForCart}`;

        addItem({
            id: customId,
            productId: product.id,
            name: product.name,
            price: unitPriceForCart,
            image_url: product.image_url,
            quantity: quantity,
            description: product.description,
            category: product.category_name,
            metadata: metadata
        });

        // Visual Feedback
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000); // Reset after 2 seconds
    };

    if (!product.customizable) {
        // Simple View for non-customizable products (basic add to cart)
        return (
            <div className="border-t border-gray-200 pt-4 space-y-4">
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Quantity</label>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50"
                        >
                            -
                        </button>
                        <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50"
                        >
                            +
                        </button>
                    </div>
                </div>

                <div>
                    <div className="text-sm text-gray-500 mb-1">Total Price</div>
                    <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold font-serif text-sai-charcoal">RM</span>
                        <Counter
                            value={parseFloat(calculatePrice().toFixed(2))}
                            fontSize={32}
                            padding={0}
                            gap={2}
                            textColor="var(--color-sai-charcoal)"
                            fontWeight="bold"
                            gradientHeight={8}
                            gradientFrom="white"
                            gradientTo="transparent"
                        />
                    </div>
                </div>

                <button
                    onClick={handleAddToCart}
                    disabled={isAdded}
                    className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${isAdded
                        ? 'bg-green-600 text-white'
                        : 'bg-sai-pink text-white hover:opacity-90 active:scale-95'
                        }`}
                >
                    {isAdded ? (
                        <>
                            <Check className="w-5 h-5" />
                            <span>Added to Cart!</span>
                        </>
                    ) : (
                        <>
                            <ShoppingCart className="w-5 h-5" />
                            <span>Add to Cart</span>
                        </>
                    )}
                </button>
            </div>
        );
    }

    return (
        <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-lg mb-3">Customize Your Order</h3>

            {baseOptions.length > 0 && (
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Base Flavor *</label>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex justify-between items-center text-left">
                                <span className="text-sm">{selectedBase || "Select flavor..."}</span>
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                            {baseOptions.map((opt) => (
                                <DropdownMenuItem
                                    key={opt.id}
                                    onSelect={() => setSelectedBase(opt.option_name)}
                                    className="hover:bg-sai-pink/5 focus:bg-sai-pink/10 focus:text-sai-pink cursor-pointer"
                                >
                                    {opt.option_name} {opt.is_premium && <span className="text-sai-pink ml-1">(Premium)</span>}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            {frostingOptions.length > 0 && (
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Frosting *</label>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex justify-between items-center text-left">
                                <span className="text-sm">{selectedFrosting || "Select frosting..."}</span>
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                            {frostingOptions.map((opt) => (
                                <DropdownMenuItem
                                    key={opt.id}
                                    onSelect={() => setSelectedFrosting(opt.option_name)}
                                    className="hover:bg-sai-pink/5 focus:bg-sai-pink/10 focus:text-sai-pink cursor-pointer"
                                >
                                    {opt.option_name} {opt.is_premium && <span className="text-sai-pink ml-1">(Premium)</span>}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            {/* Brownie Topping Selection */}
            {toppingOptions.length > 0 && (
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                        Add Topping <span className="text-gray-400 font-normal">(Optional, +RM 1)</span>
                    </label>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex justify-between items-center text-left">
                                <span className="text-sm">
                                    {selectedTopping === 'None' ? 'No topping (RM 3/pc)' :
                                        selectedTopping ? `${selectedTopping} (+RM 1.00)` : 'Select topping...'}
                                </span>
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                            <DropdownMenuItem
                                onSelect={() => setSelectedTopping('None')}
                                className="hover:bg-sai-pink/5 focus:bg-sai-pink/10 focus:text-sai-pink cursor-pointer"
                            >
                                No topping (RM 3/pc)
                            </DropdownMenuItem>
                            {toppingOptions.map((opt) => (
                                <DropdownMenuItem
                                    key={opt.id}
                                    onSelect={() => setSelectedTopping(opt.option_name)}
                                    className="hover:bg-sai-pink/5 focus:bg-sai-pink/10 focus:text-sai-pink cursor-pointer"
                                >
                                    {opt.option_name} <span className="text-sai-pink ml-1">(+RM {opt.price_modifier.toFixed(2)})</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            {/* Dietary Options (Checkboxes) */}
            {dietaryOptions.length > 0 && (
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Dietary Options</label>
                    <div className="space-y-2">
                        {dietaryOptions.map((opt) => (
                            <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedDietaryOptions.includes(opt.option_name)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedDietaryOptions([...selectedDietaryOptions, opt.option_name]);
                                        } else {
                                            setSelectedDietaryOptions(selectedDietaryOptions.filter(name => name !== opt.option_name));
                                        }
                                    }}
                                    className="w-4 h-4 text-sai-pink border-gray-300 rounded"
                                />
                                <span className="text-sm">
                                    {opt.option_name}
                                    {opt.is_premium ? (
                                        <span className="text-sai-pink ml-1">(+RM {opt.price_modifier.toFixed(2)})</span>
                                    ) : (
                                        <span className="text-green-600 ml-1">(Free)</span>
                                    )}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            )}


            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50"
                    >
                        -
                    </button>
                    <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                    <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Design Notes */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                    Design Notes <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                    value={designNotes}
                    onChange={(e) => setDesignNotes(e.target.value)}
                    placeholder="Describe your desired design, colors, themes, or any special requests..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sai-pink focus:border-sai-pink min-h-[100px] resize-none"
                    maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                    {designNotes.length}/500 characters
                </p>
            </div>

            {/* Price and Add to Cart - Inline */}
            <div className="border-t border-gray-200 pt-4 space-y-4">
                <div>
                    <div className="text-sm text-gray-500 mb-1">Total Price</div>
                    <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold font-serif text-sai-charcoal">RM</span>
                        <Counter
                            value={parseFloat(calculatePrice().toFixed(2))}
                            fontSize={32}
                            padding={0}
                            gap={2}
                            textColor="var(--color-sai-charcoal)"
                            fontWeight="bold"
                            gradientHeight={8}
                            gradientFrom="white"
                            gradientTo="transparent"
                        />
                    </div>
                </div>

                <button
                    disabled={
                        (baseOptions.length > 0 && !selectedBase) ||
                        (frostingOptions.length > 0 && !selectedFrosting) ||
                        isAdded
                    }
                    onClick={handleAddToCart}
                    className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${(baseOptions.length > 0 && !selectedBase) ||
                        (frostingOptions.length > 0 && !selectedFrosting)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : isAdded
                            ? 'bg-green-600 text-white'
                            : 'bg-sai-pink text-white hover:opacity-90 active:scale-95'
                        }`}
                >
                    {isAdded ? (
                        <>
                            <Check className="w-5 h-5" />
                            <span>Added to Cart!</span>
                        </>
                    ) : (
                        <>
                            <ShoppingCart className="w-5 h-5" />
                            {(baseOptions.length > 0 && !selectedBase) || (frostingOptions.length > 0 && !selectedFrosting)
                                ? 'Select Options First'
                                : 'Add to Cart'}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
