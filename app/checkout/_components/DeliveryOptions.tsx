import { useState, useEffect } from 'react';
import NumberBadge from '@/components/ui/number-badge';
import AddressManager from '../../components/AddressManager';

interface DeliveryOptionsProps {
    deliveryType: 'pickup' | 'delivery';
    setDeliveryType: (type: 'pickup' | 'delivery') => void;
    addresses: any[];
    selectedAddress: string;
    setSelectedAddress: (id: string) => void;
    userId: string;
    onRefresh: () => void;
    deliveryDate: string;
    setDeliveryDate: (date: string) => void;
    deliverySlot: string;
    setDeliverySlot: (slot: string) => void;
}

const ALLOWED_POSTCODES = ['50470'];

export default function DeliveryOptions({
    deliveryType, setDeliveryType, addresses, selectedAddress, setSelectedAddress, userId, onRefresh,
    deliveryDate, setDeliveryDate, deliverySlot, setDeliverySlot
}: DeliveryOptionsProps) {
    const [showAddressManager, setShowAddressManager] = useState(false);

    // Calculate minimum date (tomorrow)
    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const minDate = getMinDate();

    // Generate time slots
    const generateTimeSlots = () => {
        const slots = [];
        const startHour = 10; // 10 AM
        const endHour = 18; // 6 PM

        for (let i = startHour; i < endHour; i++) {
            const hour12 = i > 12 ? i - 12 : i;
            const ampm = i >= 12 ? 'PM' : 'AM';
            slots.push(`${hour12}:00 ${ampm}`);
            slots.push(`${hour12}:30 ${ampm}`);
        }
        // Add 6:00 PM if needed, or stop at 5:30 PM. Let's include 6:00 PM as last slot?
        // Usually bakeries close at 6, so last pickup maybe 5:30 or 6:00. Let's add 6:00 PM.
        slots.push(`6:00 PM`);
        return slots;
    };

    const timeSlots = generateTimeSlots();

    return (
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-bold text-sai-charcoal mb-4 flex items-center gap-2">
                <NumberBadge number={2} size="sm" /> Pickup or Delivery
            </h2>

            <div className="flex gap-4 mb-6">
                <button
                    type="button"
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold border transition-all duration-200 ${deliveryType === 'pickup'
                        ? 'bg-sai-pink text-white border-sai-pink shadow-md shadow-pink-200'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    onClick={() => setDeliveryType('pickup')}
                >
                    Store Pickup
                </button>
                <button
                    type="button"
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold border transition-all duration-200 ${deliveryType === 'delivery'
                        ? 'bg-sai-pink text-white border-sai-pink shadow-md shadow-pink-200'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    onClick={() => setDeliveryType('delivery')}
                >
                    Home Delivery
                </button>
            </div>

            {deliveryType === 'delivery' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-gray-700">Delivery Address</label>
                            {addresses.length > 0 && (
                                <button
                                    type="button"
                                    className="text-xs font-semibold text-sai-pink hover:underline"
                                    onClick={() => setShowAddressManager(!showAddressManager)}
                                >
                                    {showAddressManager ? 'Cancel' : 'Manage Addresses'}
                                </button>
                            )}
                        </div>

                        {showAddressManager ? (
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <AddressManager
                                    addresses={addresses}
                                    onUpdate={() => {
                                        setShowAddressManager(false);
                                        onRefresh();
                                    }}
                                    userId={userId}
                                    initialIsAdding={addresses.length === 0}
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {addresses.length === 0 ? (
                                    <div className="col-span-full py-8 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                        <p className="text-gray-500 text-sm mb-3">No delivery addresses found.</p>
                                        <button
                                            type="button"
                                            className="px-4 py-2 bg-sai-charcoal text-white rounded-lg text-sm font-medium hover:bg-sai-charcoal/90 transition-colors"
                                            onClick={() => setShowAddressManager(true)}
                                        >
                                            Add New Address
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {addresses.map(addr => {
                                            const isSelected = selectedAddress === addr.id;
                                            const isAllowed = ALLOWED_POSTCODES.includes(addr.postcode);

                                            return (
                                                <div
                                                    key={addr.id}
                                                    onClick={() => isAllowed && setSelectedAddress(addr.id)}
                                                    className={`
                                                        relative p-4 rounded-xl border-2 transition-all text-left
                                                        ${!isAllowed
                                                            ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                                                            : 'cursor-pointer hover:shadow-md ' + (isSelected ? 'border-sai-pink bg-pink-50/10' : 'border-gray-200 bg-white hover:border-gray-300')
                                                        }
                                                    `}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isSelected ? 'bg-sai-pink text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                            {addr.label || 'Home'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sai-charcoal text-sm font-medium leading-snug mb-1">
                                                        {addr.address_line1}
                                                    </p>
                                                    <p className="text-gray-500 text-xs">
                                                        {addr.postcode} {addr.city}, {addr.state}
                                                    </p>
                                                    {!isAllowed && <p className="text-[10px] font-medium text-red-500 mt-2">Out of Delivery Zone</p>}
                                                </div>
                                            );
                                        })}
                                        {addresses.length < 5 && (
                                            <button
                                                type="button"
                                                onClick={() => setShowAddressManager(true)}
                                                className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-sai-pink hover:bg-pink-50/30 transition-all group min-h-[100px]"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mb-2 group-hover:bg-sai-pink group-hover:text-white transition-colors text-gray-400">
                                                    <span className="text-xl leading-none mb-0.5">+</span>
                                                </div>
                                                <span className="text-xs font-semibold text-gray-500 group-hover:text-sai-pink">Add Address</span>
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {deliveryType === 'pickup' && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-5 mb-6 animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-indigo-600 flex-shrink-0">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-sai-charcoal mb-1">Pickup Location</h3>
                            <p className="text-sm text-gray-600 leading-relaxed mb-1">
                                Lot 633, Jalan Tebing, Brickfields,<br />
                                50470 Kuala Lumpur
                            </p>
                            <span className="inline-block px-2 py-0.5 bg-white border border-indigo-100 rounded text-xs font-medium text-indigo-600">
                                Unit 09-08
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="border-t border-gray-100 pt-6 mt-6">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-sai-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    Schedule {deliveryType === 'pickup' ? 'Pickup' : 'Delivery'}
                </h3>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Select Date
                        </label>
                        <input
                            type="date"
                            value={deliveryDate}
                            onChange={(e) => setDeliveryDate(e.target.value)}
                            min={minDate}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-sai-pink/20 focus:border-sai-pink focus:bg-white outline-none transition-all cursor-pointer"
                        />
                        <p className="text-xs text-gray-400 mt-2 ml-1">
                            * Please schedule at least 24 hours in advance.
                        </p>
                    </div>

                    <div className={!deliveryDate ? 'opacity-50 pointer-events-none grayscale' : ''}>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Select Time
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                            {timeSlots.map((time) => (
                                <button
                                    key={time}
                                    type="button"
                                    onClick={() => setDeliverySlot(time)}
                                    className={`
                                        py-2 px-1 rounded-lg text-sm font-medium border transition-all duration-200 text-center
                                        ${deliverySlot === time
                                            ? 'bg-sai-pink text-white border-sai-pink shadow-md shadow-pink-200 transform scale-105'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-sai-pink/50 hover:bg-pink-50/50'
                                        }
                                    `}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                        {deliverySlot && (
                            <p className="text-xs text-sai-pink font-medium mt-3 text-center bg-pink-50 py-2 rounded-lg border border-pink-100">
                                Selected: <span className="font-bold">{deliveryDate}</span> at <span className="font-bold">{deliverySlot}</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}