'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Trash2, MapPin, Plus, Star, Pencil } from 'lucide-react';
import AlertModal from './AlertModal';

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
    initialIsAdding?: boolean;
}

const ALLOWED_POSTCODES = ['50470'];
const FIXED_CITY = 'Kuala Lumpur';
const FIXED_STATE = 'Kuala Lumpur';

export default function AddressManager({ addresses, onUpdate, userId, initialIsAdding = false }: AddressManagerProps) {
    const supabase = createClient();
    const [isAdding, setIsAdding] = useState(initialIsAdding);
    const formRef = useRef<HTMLDivElement>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        label: 'Home',
        address_line1: '',
        address_line2: '',
        city: FIXED_CITY,
        state: FIXED_STATE,
        postcode: '',
        is_default: false
    });

    const [alertConfig, setAlertConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'info' | 'error' | 'success' | 'confirm' | 'delete';
        onConfirm?: () => void;
        confirmText?: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    const showAlert = (title: string, message: string, type: 'info' | 'error' | 'success' = 'info') => {
        setAlertConfig({
            isOpen: true,
            title,
            message,
            type
        });
    };

    const showConfirm = (title: string, message: string, onConfirm: () => void, type: 'confirm' | 'delete' = 'confirm') => {
        setAlertConfig({
            isOpen: true,
            title,
            message,
            type,
            onConfirm,
            confirmText: type === 'delete' ? 'Delete' : 'Confirm'
        });
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        if (!ALLOWED_POSTCODES.includes(formData.postcode)) {
            showAlert('Delivery Zone Restriction', `Sorry, we currently only deliver to KL Sentral area (Postcode: ${ALLOWED_POSTCODES.join(', ')}). For other areas, please choose Pickup.`, 'error');
            setLoading(false);
            return;
        }

        try {
            if (formData.is_default) {
                await supabase
                    .from('addresses')
                    .update({ is_default: false })
                    .eq('user_id', userId);
            } else if (addresses.length === 0) {
                formData.is_default = true;
            }

            let error;

            if (editingId) {
                const { error: updateError } = await supabase
                    .from('addresses')
                    .update({
                        ...formData
                    })
                    .eq('id', editingId)
                    .eq('user_id', userId);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('addresses')
                    .insert([{
                        user_id: userId,
                        ...formData
                    }]);
                error = insertError;
            }

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
            setEditingId(null);
            setIsAdding(false);
            onUpdate();
        } catch (error) {
            console.error('Error saving address:', error);
            showAlert('Error', 'Failed to save address. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        showConfirm(
            'Delete Address?',
            'Are you sure you want to delete this address? This action cannot be undone.',
            async () => {
                try {
                    const { error } = await supabase
                        .from('addresses')
                        .delete()
                        .eq('id', id);

                    if (error) throw error;
                    onUpdate();
                    showAlert('Success', 'Address deleted successfully.', 'success');
                } catch (error) {
                    console.error('Error deleting address:', error);
                    showAlert('Error', 'Failed to delete address.', 'error');
                }
            },
            'delete'
        );
    }

    function handleEdit(addr: Address) {
        setFormData({
            label: addr.label,
            address_line1: addr.address_line1,
            address_line2: addr.address_line2 || '',
            city: addr.city,
            state: addr.state,
            postcode: addr.postcode,
            is_default: addr.is_default
        });
        setEditingId(addr.id);
        setIsAdding(true);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }

    async function handleSetDefault(id: string) {
        try {
            await supabase
                .from('addresses')
                .update({ is_default: false })
                .eq('user_id', userId);

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
                    onClick={() => {
                        setEditingId(null);
                        setFormData({
                            label: 'Home',
                            address_line1: '',
                            address_line2: '',
                            city: FIXED_CITY,
                            state: FIXED_STATE,
                            postcode: '',
                            is_default: false
                        });
                        setIsAdding(!isAdding);
                    }}
                    className="flex items-center gap-2 text-sm font-medium text-sai-pink hover:text-sai-pink/80"
                >
                    <Plus className="w-4 h-4" />
                    Add New
                </button>
            </div>

            <div className="grid gap-3">
                {addresses.map((addr) => (
                    <div
                        key={addr.id}
                        className={`p-3 rounded-xl border transition-all ${addr.is_default
                            ? 'border-sai-pink bg-pink-50/30'
                            : 'border-gray-200 bg-white hover:border-sai-pink/30'
                            }`}
                    >
                        <div className="flex justify-between items-start gap-3">
                            <div className="flex gap-3 items-start flex-1 min-w-0">
                                <div className={`p-2 rounded-lg shrink-0 ${addr.is_default ? 'bg-pink-100 text-sai-pink' : 'bg-gray-100 text-gray-500'}`}>
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-sai-charcoal text-sm truncate">{addr.label}</span>
                                        {addr.is_default && (
                                            <span className="text-[10px] uppercase font-bold text-sai-pink bg-pink-100 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-0.5 line-clamp-2 leading-snug break-words">
                                        {addr.address_line1}
                                        {addr.address_line2 && <>, {addr.address_line2}</>}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
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
                                    onClick={() => handleEdit(addr)}
                                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                                    title="Edit"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
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

            {isAdding && (
                <div
                    ref={formRef}
                    className="bg-gray-50 rounded-xl p-6 border border-gray-200 animate-in fade-in slide-in-from-top-4"
                >
                    <h4 className="font-medium text-sai-charcoal mb-4">{editingId ? 'Edit Address' : 'Add New Address'}</h4>
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
                                    readOnly
                                    disabled
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                                    value={formData.city}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                <input
                                    readOnly
                                    disabled
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                                    value={formData.state}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsAdding(false);
                                    setEditingId(null);
                                    setFormData({
                                        label: 'Home',
                                        address_line1: '',
                                        address_line2: '',
                                        city: FIXED_CITY,
                                        state: FIXED_STATE,
                                        postcode: '',
                                        is_default: false
                                    });
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-sai-charcoal text-white rounded-lg text-sm font-medium hover:bg-sai-charcoal/90 disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : (editingId ? 'Update Address' : 'Save Address')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <AlertModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onConfirm={alertConfig.onConfirm}
                confirmText={alertConfig.confirmText}
            />
        </div>
    );
}