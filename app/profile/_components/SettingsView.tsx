interface SettingsViewProps {
    handleSignOut: () => Promise<void>;
}

export default function SettingsView({ handleSignOut }: SettingsViewProps) {
    return (
        <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-sai-charcoal mb-6">Settings</h2>

            <div className="space-y-8">
                {/* Account Security Section */}
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                    <h3 className="font-semibold text-sai-charcoal mb-4">Account Security</h3>
                    <div className="space-y-4">
                        <button className="w-full md:w-auto px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            Change Password
                        </button>
                        <div className="pt-4 border-t border-gray-200">
                            <button className="text-sm text-red-600 font-medium hover:underline">
                                Delete Account
                            </button>
                            <p className="text-xs text-gray-500 mt-1">Permanently delete your account and all data.</p>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                    <button
                        onClick={handleSignOut}
                        className="w-full px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
}