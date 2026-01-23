import AvatarUpload from '@/app/components/AvatarUpload';
import AddressManager from '@/app/components/AddressManager';
import OccasionsManager from '@/app/components/OccasionsManager';
import { Check, AlertCircle } from 'lucide-react';
import { FormData, Status } from '@/hooks/useProfile';
import { UserProfile, Address, SpecialOccasion } from '@/lib/services/authService';

interface EditProfileViewProps {
    user: any;
    profile: UserProfile | null;
    formData: FormData;
    setFormData: (data: FormData) => void;
    setProfile: (profile: UserProfile | null) => void;
    isUpdating: boolean;
    status: Status | null;
    handleUpdateProfile: (e: React.FormEvent) => Promise<void>;
    handleReset: () => void;
    addresses: Address[];
    occasions: SpecialOccasion[];
    initializeProfile: () => Promise<void>;
}

export default function EditProfileView({
    user,
    profile,
    formData,
    setFormData,
    setProfile,
    isUpdating,
    status,
    handleUpdateProfile,
    handleReset,
    addresses,
    occasions,
    initializeProfile
}: EditProfileViewProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Details Section */}
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-200 lg:col-span-2">
                <h2 className="text-2xl font-bold text-sai-charcoal mb-6">Personal Details</h2>

                {/* Status Banner */}
                {status && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${status.type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        {status.type === 'success' ? (
                            <Check className="w-5 h-5 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        )}
                        <p className="font-medium">{status.message}</p>
                    </div>
                )}

                {/* Avatar Upload */}
                <div className="mb-8 pb-8 border-b border-gray-100 flex justify-center">
                    <AvatarUpload
                        userId={user?.id}
                        currentAvatarUrl={profile?.avatar_url || null}
                        onAvatarUpdate={(newUrl) => {
                            if (profile) {
                                setProfile({ ...profile, avatar_url: newUrl });
                            }
                        }}
                    />
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                            <input
                                type="text"
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sai-pink focus:ring-2 focus:ring-sai-pink/20 transition-all outline-none"
                                placeholder="Enter first name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                            <input
                                type="text"
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sai-pink focus:ring-2 focus:ring-sai-pink/20 transition-all outline-none"
                                placeholder="Enter last name"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sai-pink focus:ring-2 focus:ring-sai-pink/20 transition-all outline-none"
                                placeholder="+60 12-345 6789"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                            <input
                                type="date"
                                value={formData.dob}
                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sai-pink focus:ring-2 focus:ring-sai-pink/20 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Contact Method</label>
                        <div className="flex gap-4">
                            {['whatsapp', 'email', 'phone'].map((method) => (
                                <label key={method} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="contact_method"
                                        value={method}
                                        checked={formData.preferred_contact_method === method}
                                        onChange={(e) => setFormData({ ...formData, preferred_contact_method: e.target.value })}
                                        className="text-sai-pink focus:ring-sai-pink"
                                    />
                                    <span className="capitalize text-gray-700">{method}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={isUpdating}
                            className="flex-1 md:flex-none px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="flex-[2] md:flex-none px-6 py-2 bg-sai-charcoal text-white rounded-lg text-sm font-medium hover:bg-sai-charcoal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isUpdating ? (
                                <>
                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Details'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Address Book Section */}
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-200 flex flex-col">
                <AddressManager addresses={addresses} onUpdate={initializeProfile} userId={user?.id} />
            </div>

            {/* Special Occasions Section */}
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-200 flex flex-col">
                <OccasionsManager occasions={occasions} onUpdate={initializeProfile} userId={user?.id} />
            </div>

            {/* Preferences Section */}
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-200 lg:col-span-2">
                <h2 className="text-2xl font-bold text-sai-charcoal mb-6">Sweet Preferences</h2>

                {/* Status Banner */}
                {status && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${status.type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        {status.type === 'success' ? (
                            <Check className="w-5 h-5 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        )}
                        <p className="font-medium">{status.message}</p>
                    </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Favorite Flavors</label>
                        <div className="flex flex-wrap gap-3">
                            {['Chocolate', 'Vanilla', 'Red Velvet', 'Matcha', 'Salted Caramel', 'Fruity', 'Coffee', 'Cheese'].map((flavor) => (
                                <label key={flavor} className={`px-4 py-2 rounded-full border cursor-pointer transition-all ${formData.favorite_flavors.includes(flavor)
                                    ? 'bg-sai-pink text-white border-sai-pink'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-sai-pink/50'
                                    }`}>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={formData.favorite_flavors.includes(flavor)}
                                        onChange={(e) => {
                                            const newFlavors = e.target.checked
                                                ? [...formData.favorite_flavors, flavor]
                                                : formData.favorite_flavors.filter(f => f !== flavor);
                                            setFormData({ ...formData, favorite_flavors: newFlavors });
                                        }}
                                    />
                                    {flavor}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Dietary Restrictions</label>
                        <div className="flex flex-wrap gap-3">
                            {['Nut-Free', 'Gluten-Free', 'Egg-Free', 'Vegan', 'Halal', 'Less Sugar'].map((diet) => (
                                <label key={diet} className={`px-4 py-2 rounded-full border cursor-pointer transition-all ${formData.dietary_restrictions.includes(diet)
                                    ? 'bg-orange-500 text-white border-orange-500'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-orange-500/50'
                                    }`}>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={formData.dietary_restrictions.includes(diet)}
                                        onChange={(e) => {
                                            const newDiet = e.target.checked
                                                ? [...formData.dietary_restrictions, diet]
                                                : formData.dietary_restrictions.filter(d => d !== diet);
                                            setFormData({ ...formData, dietary_restrictions: newDiet });
                                        }}
                                    />
                                    {diet}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={isUpdating}
                            className="flex-1 md:flex-none px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="flex-[2] md:flex-none px-6 py-2 bg-sai-charcoal text-white rounded-lg text-sm font-medium hover:bg-sai-charcoal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isUpdating ? 'Saving...' : 'Save Preferences'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}