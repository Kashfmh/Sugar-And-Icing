'use client';

import { useState } from 'react';
import { Lock, Trash2, LogOut, ChevronRight, Shield } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

interface SettingsViewProps {
    handleSignOut: () => Promise<void>;
}

export default function SettingsView({ handleSignOut }: SettingsViewProps) {
    const [showChangePassword, setShowChangePassword] = useState(false);

    return (
        <>
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-sai-charcoal mb-2">Settings</h2>
                <p className="text-gray-500 mb-8">Manage your account preferences and security</p>

                <div className="space-y-6">
                    {/* Security Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="w-5 h-5 text-gray-400" />
                            <h3 className="font-semibold text-sai-charcoal">Security</h3>
                        </div>

                        <div className="space-y-2">
                            {/* Change Password */}
                            <button
                                onClick={() => setShowChangePassword(true)}
                                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                                        <Lock className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-sai-charcoal">Change Password</p>
                                        <p className="text-sm text-gray-500">Update your account password</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                            </button>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Trash2 className="w-5 h-5 text-red-400" />
                            <h3 className="font-semibold text-red-600">Danger Zone</h3>
                        </div>

                        <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-red-700">Delete Account</p>
                                    <p className="text-sm text-red-600/70">Permanently delete your account and all data</p>
                                </div>
                                <button
                                    className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Session */}
                    <div className="pt-6 border-t border-gray-100">
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Log Out
                        </button>
                    </div>
                </div>
            </div>

            <ChangePasswordModal
                isOpen={showChangePassword}
                onClose={() => setShowChangePassword(false)}
            />
        </>
    );
}
