'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Trash2, Calendar, Plus, Bell, Pencil } from 'lucide-react';
import AlertModal from './AlertModal';

interface SpecialOccasion {
    id: string;
    name: string;
    date: string;
    type: string;
    reminder_enabled: boolean;
}

interface OccasionsManagerProps {
    occasions: SpecialOccasion[];
    onUpdate: () => void;
    userId: string;
}

export default function OccasionsManager({ occasions, onUpdate, userId }: OccasionsManagerProps) {
    const supabase = createClient();
    const [isAdding, setIsAdding] = useState(false);
    const formRef = useRef<HTMLDivElement>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        type: 'Birthday',
        reminder_enabled: true
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

        try {
            let error;

            if (editingId) {
                const { error: updateError } = await supabase
                    .from('special_occasions')
                    .update({
                        ...formData
                    })
                    .eq('id', editingId)
                    .eq('user_id', userId);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('special_occasions')
                    .insert([{
                        user_id: userId,
                        ...formData
                    }]);
                error = insertError;
            }

            if (error) throw error;

            setFormData({
                name: '',
                date: '',
                type: 'Birthday',
                reminder_enabled: true
            });
            setEditingId(null);
            setIsAdding(false);
            onUpdate();
        } catch (error) {
            console.error('Error saving occasion:', error);
            showAlert('Error', 'Failed to save occasion');
        } finally {
            setLoading(false);
        }
    }

    function handleEdit(occ: SpecialOccasion) {
        setFormData({
            name: occ.name,
            date: occ.date,
            type: occ.type,
            reminder_enabled: occ.reminder_enabled
        });
        setEditingId(occ.id);
        setIsAdding(true);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }

    async function handleDelete(id: string) {
        showConfirm(
            'Delete Occasion?',
            'Are you sure you want to delete this occasion? This action cannot be undone.',
            async () => {
                try {
                    const { error } = await supabase
                        .from('special_occasions')
                        .delete()
                        .eq('id', id);

                    if (error) throw error;
                    onUpdate();
                    showAlert('Success', 'Occasion deleted successfully.', 'success');
                } catch (error) {
                    console.error('Error deleting occasion:', error);
                    showAlert('Error', 'Failed to delete occasion.', 'error');
                }
            },
            'delete'
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-sai-charcoal">Special Occasions</h3>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({
                            name: '',
                            date: '',
                            type: 'Birthday',
                            reminder_enabled: true
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
                {occasions.map((occ) => (
                    <div
                        key={occ.id}
                        className="p-3 rounded-xl border border-gray-200 bg-white hover:border-sai-pink/30 flex justify-between items-center transition-all gap-3"
                    >
                        <div className="flex gap-3 items-center flex-1 min-w-0">
                            <div className="p-2 rounded-lg bg-pink-50 text-sai-pink shrink-0">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-sai-charcoal text-sm truncate">{occ.name}</span>
                                    <span className="px-1.5 py-0.5 rounded-md bg-gray-100 text-[10px] uppercase font-bold text-gray-500 whitespace-nowrap shrink-0">
                                        {occ.type}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 mt-0.5 truncate">
                                    {new Date(occ.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                            {occ.reminder_enabled && (
                                <Bell className="w-3.5 h-3.5 text-sai-pink/60 mr-1" />
                            )}
                            <button
                                onClick={() => handleEdit(occ)}
                                className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(occ.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {occasions.length === 0 && !isAdding && (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        No occasions saved yet.
                    </div>
                )}
            </div>

            {isAdding && (
                <div
                    ref={formRef}
                    className="bg-gray-50 rounded-xl p-6 border border-gray-200 animate-in fade-in slide-in-from-top-4"
                >
                    <h4 className="font-medium text-sai-charcoal mb-4">{editingId ? 'Edit Special Occasion' : 'Add Special Occasion'}</h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Occasion Type</label>
                            <select
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option>Birthday</option>
                                <option>Anniversary</option>
                                <option>Graduation</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name / Label</label>
                            <input
                                required
                                className="w-full px-3 py-2 rounded-lg border border-gray-200"
                                placeholder="e.g. Wife's Birthday, Our Anniversary"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                required
                                className="w-full px-3 py-2 rounded-lg border border-gray-200"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-sai-pink focus:ring-sai-pink"
                                    checked={formData.reminder_enabled}
                                    onChange={e => setFormData({ ...formData, reminder_enabled: e.target.checked })}
                                />
                                <span className="text-sm text-gray-600">Send me a reminder 1 week before</span>
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsAdding(false);
                                    setEditingId(null);
                                    setFormData({
                                        name: '',
                                        date: '',
                                        type: 'Birthday',
                                        reminder_enabled: true
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
                                {loading ? 'Saving...' : (editingId ? 'Update Occasion' : 'Save Occasion')}
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