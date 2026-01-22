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
}

export default function DeliveryOptions({
    deliveryType, setDeliveryType, addresses, selectedAddress, setSelectedAddress, userId
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
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Address</label>
                    {addresses.length === 0 ? (
                        <div className="text-gray-500 text-sm mb-2">No addresses found. <button type="button" className="text-sai-pink underline" onClick={() => setShowAddressManager(true)}>Add Address</button></div>
                    ) : (
                        <select
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-sai-pink/50 outline-none transition-all"
                            value={selectedAddress}
                            onChange={e => setSelectedAddress(e.target.value)}
                        >
                            <option value="">Select an address...</option>
                            {addresses.map(addr => (
                                <option key={addr.id} value={addr.id}>
                                    {addr.label} - {addr.address_line1}, {addr.city}, {addr.state} {addr.postcode}
                                </option>
                            ))}
                        </select>
                    )}
                    <button type="button" className="text-xs text-sai-pink underline mt-2" onClick={() => setShowAddressManager(true)}>Manage Addresses</button>
                    {showAddressManager && <div className="mt-4"><AddressManager addresses={addresses} onUpdate={() => { }} userId={userId} /></div>}
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