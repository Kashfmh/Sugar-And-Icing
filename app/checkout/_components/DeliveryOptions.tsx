import { useState } from 'react';
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
}

const ALLOWED_POSTCODES = ['50470'];

export default function DeliveryOptions({
    deliveryType, setDeliveryType, addresses, selectedAddress, setSelectedAddress, userId, onRefresh
}: DeliveryOptionsProps) {
    const [showAddressManager, setShowAddressManager] = useState(false);

    return (
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-bold text-sai-charcoal mb-4 flex items-center gap-2">
                <NumberBadge number={2} size="sm" /> Pickup or Delivery
            </h2>

            <div className="flex gap-4 mb-4">
                <button
                    type="button"
                    className={`px-6 py-2 rounded-lg font-semibold border transition-all ${deliveryType === 'pickup' ? 'bg-sai-pink text-white border-sai-pink' : 'bg-white border-gray-300 text-sai-charcoal'}`}
                    onClick={() => setDeliveryType('pickup')}
                >Pickup</button>
                <button
                    type="button"
                    className={`px-6 py-2 rounded-lg font-semibold border transition-all ${deliveryType === 'delivery' ? 'bg-sai-pink text-white border-sai-pink' : 'bg-white border-gray-300 text-sai-charcoal'}`}
                    onClick={() => setDeliveryType('delivery')}
                >Delivery</button>
            </div>

            {deliveryType === 'delivery' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700">Delivery Address</label>
                        {addresses.length > 0 && (
                            <button
                                type="button"
                                className="text-xs font-medium text-sai-pink hover:underline flex items-center gap-1"
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
                                <div className="col-span-full py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                    <p className="text-gray-500 text-sm mb-3">No delivery addresses found.</p>
                                    <button
                                        type="button"
                                        className="px-4 py-2 bg-sai-charcoal text-white rounded-lg text-sm hover:bg-sai-charcoal/90 transition-colors"
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
                                                    relative p-4 rounded-xl border-2 transition-all
                                                    ${!isAllowed
                                                        ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                                                        : 'cursor-pointer hover:shadow-md ' + (isSelected ? 'border-sai-pink bg-sai-pink/5' : 'border-gray-200 bg-white hover:border-gray-300')
                                                    }
                                                `}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isSelected ? 'bg-sai-pink text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                        {addr.label || 'Home'}
                                                    </span>
                                                    {!isAllowed && (
                                                        <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">No Delivery</span>
                                                    )}
                                                    {isAllowed && isSelected && (
                                                        <span className="text-sai-pink">
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sai-charcoal text-sm font-medium leading-tight mb-1">
                                                    {addr.address_line1}
                                                </p>
                                                <p className="text-gray-500 text-xs">
                                                    {addr.postcode} {addr.city}, {addr.state}
                                                </p>
                                                {!isAllowed && <p className="text-[10px] text-red-500 mt-1">Outside KL Sentral Zone</p>}
                                            </div>
                                        );
                                    })}
                                    <div
                                        onClick={() => setShowAddressManager(true)}
                                        className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-sai-pink hover:bg-pink-50/50 transition-all group min-h-[100px]"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mb-2 group-hover:bg-sai-pink group-hover:text-white transition-colors text-gray-400">
                                            <span className="text-xl leading-none mb-0.5">+</span>
                                        </div>
                                        <span className="text-xs font-medium text-gray-500 group-hover:text-sai-pink">Add New Address</span>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}

            {deliveryType === 'pickup' && (
                <div className="bg-sai-pink/10 border border-sai-pink/30 rounded-xl p-4 text-sai-charcoal text-sm space-y-2 mb-2">
                    <div><span className="font-bold">Pickup Address:</span> Lot 633, Jalan Tebing, Brickfields, 50470 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur</div>
                    <div><span className="font-bold">Floor/Unit:</span> 09-08</div>
                    <div className="w-full h-48 rounded-lg overflow-hidden my-2">
                        <iframe
                            title="Google Maps - Lot 633, Jalan Tebing"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3983.8539772419504!2d101.68806847923217!3d3.1332604451309667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc49c2f127bec1%3A0xbd153c0952983f28!2s633%20Residency!5e0!3m2!1sen!2sus!4v1769099212891!5m2!1sen!2sus"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                    <div className="text-xs text-gray-500">Timing details will be sent to your preferred contact method after payment.</div>
                </div>
            )}
        </section>
    );
}