export const CAKE_SIZES = [
    { id: '4inch', label: '4" Bento', weight: '250g', serves: '1-2', basicPrice: 30, premiumPrice: 40 },
    { id: '6inch', label: '6" Cake', weight: '500g', serves: '6-8', basicPrice: 55, premiumPrice: 65 },
    { id: '8inch', label: '8" Cake', weight: '1kg', serves: '12-16', basicPrice: 110, premiumPrice: 125 },
];

export const CAKE_BASES = [
    // basic
    { id: 'vanilla', label: 'Vanilla', type: 'basic' },
    { id: 'chocolate', label: 'Chocolate', type: 'basic' },
    { id: 'butterscotch', label: 'Butterscotch', type: 'basic' },
    { id: 'pineapple', label: 'Pineapple', type: 'basic' },
    { id: 'strawberry', label: 'Strawberry', type: 'basic' },
    { id: 'mango', label: 'Mango', type: 'basic' },
    { id: 'coconut', label: 'Coconut', type: 'basic' },
    { id: 'caramel', label: 'Caramel', type: 'basic' },
    { id: 'honey_cake', label: 'Honey Cake', type: 'basic' },
    { id: 'black_forest', label: 'Black Forest', type: 'basic' },
    // premium
    { id: 'red_velvet', label: 'Red Velvet', type: 'premium' },
    { id: 'paan_gulkand', label: 'Paan Gulkand', type: 'premium' },
    { id: 'choco_nutella', label: 'Choco Nutella', type: 'premium' },
];

export const CAKE_FROSTINGS = [
    // basic
    { id: 'vanilla_frosting', label: 'Vanilla', type: 'basic' },
    { id: 'chocolate_frosting', label: 'Chocolate', type: 'basic' },
    { id: 'whipped_ganache', label: 'Whipped Ganache', type: 'basic' },
    // premium
    { id: 'belgian_chocolate', label: 'Belgian Chocolate', type: 'premium' },
    { id: 'rasmalai_topping', label: 'Rasmalai Topping', type: 'premium' },
    { id: 'gulab_jamun_topping', label: 'Gulab Jamun Topping', type: 'premium' },
];

export const CAKE_DIETARY_OPTIONS = [
    { id: 'eggless', label: 'Eggless', type: 'free', price: 0 },
    { id: 'nutless', label: 'Nutless', type: 'free', price: 0 },
    { id: 'vegan', label: 'Vegan', type: 'premium', price: 10 },
    { id: 'dairy_free', label: 'Dairy-Free', type: 'premium', price: 10 }
];
