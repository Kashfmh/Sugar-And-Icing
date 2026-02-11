import { useState } from 'react';
import NumberBadge from '@/components/ui/number-badge';
import { Loader2, AlertCircle } from 'lucide-react';
import { isValidEmail, isValidPhone, isValidName } from '@/lib/validators';

interface ContactInfoProps {
    contact: { first_name: string; last_name: string; email: string; phone: string };
    setContact: (c: any) => void;
    loading: boolean;
    user: any;
}

export default function ContactInfo({ contact, setContact, loading, user }: ContactInfoProps) {
    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-sai-pink" /></div>;

    const [errors, setErrors] = useState({ first_name: '', last_name: '', email: '', phone: '' });

    const handleBlur = (field: 'first_name' | 'last_name' | 'email' | 'phone') => {
        const value = contact[field].trim();
        let error = '';

        if (field === 'first_name' || field === 'last_name') {
            if (value && !isValidName(value)) {
                error = 'Must contain only letters and spaces (max 50 chars).';
            }
        }

        if (field === 'email' && value && !isValidEmail(value)) {
            error = 'Please enter a valid email address.';
        }

        if (field === 'phone' && value) {
            if (!value.startsWith('+60')) {
                error = 'Phone number must start with +60 (e.g. +601123456789).';
            } else if (!isValidPhone(value)) {
                error = 'Invalid phone number format. Use numeric digits only, no spaces.';
            }
        }

        setErrors(prev => ({ ...prev, [field]: error }));
        // Also trim the value in state
        setContact({ ...contact, [field]: value });
    };

    const handleChange = (field: string, value: string) => {
        setContact({ ...contact, [field]: value });
        // Clear error as user types
        // @ts-ignore
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    }

    return (
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-bold text-sai-charcoal mb-4 flex items-center gap-2">
                <NumberBadge number={1} size="sm" /> Contact Details
            </h2>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                            required
                            type="text"
                            value={contact.first_name}
                            onChange={e => handleChange('first_name', e.target.value)}
                            onBlur={() => handleBlur('first_name')}
                            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 outline-none transition-all ${errors.first_name ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-sai-pink/50'}`}
                            placeholder="e.g. Aakash"
                        />
                        {errors.first_name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.first_name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                            required
                            type="text"
                            value={contact.last_name}
                            onChange={e => handleChange('last_name', e.target.value)}
                            onBlur={() => handleBlur('last_name')}
                            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 outline-none transition-all ${errors.last_name ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-sai-pink/50'}`}
                            placeholder="e.g. Sharma"
                        />
                        {errors.last_name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.last_name}</p>}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            required
                            type="email"
                            value={contact.email}
                            onChange={e => handleChange('email', e.target.value)}
                            onBlur={() => handleBlur('email')}
                            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 outline-none transition-all ${errors.email ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-sai-pink/50'}`}
                            placeholder="user@example.com"
                            disabled={!!user}
                        />
                        {errors.email && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                            required
                            type="tel"
                            value={contact.phone}
                            onChange={e => handleChange('phone', e.target.value)}
                            onBlur={() => handleBlur('phone')}
                            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 outline-none transition-all ${errors.phone ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-sai-pink/50'}`}
                            placeholder="+60123456789"
                        />
                        {errors.phone && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.phone}</p>}
                    </div>
                </div>
            </div>
        </section>
    );
}