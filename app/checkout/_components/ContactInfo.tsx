import NumberBadge from '@/components/ui/number-badge';
import { Loader2 } from 'lucide-react';

interface ContactInfoProps {
    contact: { first_name: string; last_name: string; email: string; phone: string };
    setContact: (c: any) => void;
    loading: boolean;
    user: any;
}

export default function ContactInfo({ contact, setContact, loading, user }: ContactInfoProps) {
    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-sai-pink" /></div>;

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
                            onChange={e => setContact({ ...contact, first_name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-sai-pink/50 outline-none transition-all"
                            placeholder="e.g. Aakash"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                            required
                            type="text"
                            value={contact.last_name}
                            onChange={e => setContact({ ...contact, last_name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-sai-pink/50 outline-none transition-all"
                            placeholder="e.g. Sharma"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            required
                            type="email"
                            value={contact.email}
                            onChange={e => setContact({ ...contact, email: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-sai-pink/50 outline-none transition-all"
                            placeholder="user@example.com"
                            disabled={!!user}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                            required
                            type="tel"
                            value={contact.phone}
                            onChange={e => setContact({ ...contact, phone: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-sai-pink/50 outline-none transition-all"
                            placeholder="012-345 6789"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}