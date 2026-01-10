'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, MapPin, Plus, Star } from 'lucide-react';

interface Address {
    id: string;
    label: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postcode: string;
    is_default: boolean;
}

interface AddressManagerProps {
    addresses: Address[];
    onUpdate: () => void;
    userId: string;
}

export default function AddressManager({ addresses, onUpdate, userId }: AddressManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        label: 'Home',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postcode: '',
        is_default: false
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            // If setting as default, first unset other defaults
            if (formData.is_default) {
                await supabase
                    .from('addresses')
                    .update({ is_default: false })
                    .eq('user_id', userId);
            } else if (addresses.length === 0) {
                // First address is always default
                formData.is_default = true;
            }

            const { error } = await supabase
                .from('addresses')
                .insert([{
                    user_id: userId,
                    ...formData
                }]);

            if (error) throw error;

            setFormData({
                label: 'Home',
                address_line1: '',
                address_line2: '',
                city: '',
                state: '',
                postcode: '',
                is_default: false
            });
            setIsAdding(false);
            onUpdate();
        } catch (error) {
            console.error('Error adding address:', error);
            alert('Failed to add address');
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this address?')) return;

        try {
            const { error } = await supabase
                .from('addresses')
                .delete()
                .eq('id', id);

            if (error) throw error;
            onUpdate();
        } catch (error) {
            console.error('Error deleting address:', error);
            alert('Failed to delete address');
        }
    }

    async function handleSetDefault(id: string) {
        try {
            // Unset all
            await supabase
                .from('addresses')
                .update({ is_default: false })
                .eq('user_id', userId);

            // Set specific
            const { error } = await supabase
                .from('addresses')
                .update({ is_default: true })
                .eq('id', id);

            if (error) throw error;
            onUpdate();
        } catch (error) {
            console.error('Error setting default address:', error);
            alert('Failed to update default address');
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-sai-charcoal">Address Book</h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 text-sm font-medium text-sai-pink hover:text-sai-pink/80"
                >
                    <Plus className="w-4 h-4" />
                    Add New
                </button>
            </div>

            {/* Address List */}
            <div className="grid gap-4">
                {addresses.map((addr) => (
                    <div
                        key={addr.id}
                        className={`p-4 rounded-xl border transition-all ${addr.is_default
                                ? 'border-sai-pink bg-pink-50/30'
                                : 'border-gray-200 bg-white hover:border-sai-pink/30'
                            }`}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex gap-3">
                                <div className={`p-2 rounded-lg ${addr.is_default ? 'bg-pink-100 text-sai-pink' : 'bg-gray-100 text-gray-500'}`}>
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sai-charcoal">{addr.label}</span>
                                        {addr.is_default && (
                                            <span className="text-[10px] uppercase font-bold text-sai-pink bg-pink-100 px-2 py-0.5 rounded-full">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {addr.address_line1}
                                        {addr.address_line2 && <>, {addr.address_line2}</>}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {addr.postcode} {addr.city}, {addr.state}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {!addr.is_default && (
                                    <button
                                        onClick={() => handleSetDefault(addr.id)}
                                        className="p-2 text-gray-400 hover:text-yellow-500 transition-colors"
                                        title="Set as Default"
                                    >
                                        <Star className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(addr.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {addresses.length === 0 && !isAdding && (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        No addresses saved yet.
                    </div>
                )}
            </div>

            {/* Add Address Form */}
            {isAdding && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 animate-in fade-in slide-in-from-top-4">
                    <h4 className="font-medium text-sai-charcoal mb-4">Add New Address</h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                                <select
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white"
                                    value={formData.label}
                                    onChange={e => setFormData({ ...formData, label: e.target.value })}
                                >
                                    <option>Home</option>
                                    <option>Office</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
                                <input
                                    required
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200"
                                    placeholder="50450"
                                    value={formData.postcode}
                                    onChange={e => setFormData({ ...formData, postcode: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Make Default?</label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-sai-pink focus:ring-sai-pink"
                                    checked={formData.is_default}
                                    onChange={e => setFormData({ ...formData, is_default: e.target.checked })}
                                />
                                <span className="text-sm text-gray-600">Set as default delivery address</span>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                            <input
                                required
                                className="w-full px-3 py-2 rounded-lg border border-gray-200"
                                placeholder="Unit No, Street Address"
                                value={formData.address_line1}
                                onChange={e => setFormData({ ...formData, address_line1: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                            <input
                                className="w-full px-3 py-2 rounded-lg border border-gray-200"
                                placeholder="Apartment, Studio, or Floor"
                                value={formData.address_line2}
                                onChange={e => setFormData({ ...formData, address_line2: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input
                                    required
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200"
                                    placeholder="Kuala Lumpur"
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                <select
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white"
                                    value={formData.state}
                                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                                >
                                    <option value="">Select State</option>
                                    <option>Kuala Lumpur</option>
                                    <option>Selangor</option>
                                    <option>Johor</option>
                                    <option>Penang</option>
                                    {/* Add others as needed */}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-sai-charcoal text-white rounded-lg text-sm font-medium hover:bg-sai-charcoal/90 disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Address'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
