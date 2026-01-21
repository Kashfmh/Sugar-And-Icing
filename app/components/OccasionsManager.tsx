'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Calendar, Plus, Bell, Pencil } from 'lucide-react';

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

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            let error;

            if (editingId) {
                // Update existing
                const { error: updateError } = await supabase
                    .from('special_occasions')
                    .update({
                        ...formData
                    })
                    .eq('id', editingId)
                    .eq('user_id', userId);
                error = updateError;
            } else {
                // Insert new
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
            alert('Failed to save occasion');
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
        if (!confirm('Are you sure you want to delete this occasion?')) return;

        try {
            const { error } = await supabase
                .from('special_occasions')
                .delete()
                .eq('id', id);

            if (error) throw error;
            onUpdate();
        } catch (error) {
            console.error('Error deleting occasion:', error);
            alert('Failed to delete occasion');
        }
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

            {/* Occasion List */}
            <div className="grid gap-4">
                {occasions.map((occ) => (
                    <div
                        key={occ.id}
                        className="p-4 rounded-xl border border-gray-200 bg-white hover:border-sai-pink/30 flex justify-between items-center transition-all"
                    >
                        <div className="flex gap-3 items-center">
                            <div className="p-2 rounded-lg bg-pink-50 text-sai-pink">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sai-charcoal">{occ.name}</span>
                                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] uppercase font-bold text-gray-500">
                                        {occ.type}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                    {new Date(occ.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {occ.reminder_enabled && (
                                <Bell className="w-4 h-4 text-sai-pink/60" />
                            )}
                            <button
                                onClick={() => handleEdit(occ)}
                                className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(occ.id)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
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

            {/* Add Occasion Form */}
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
        </div>
    );
}
