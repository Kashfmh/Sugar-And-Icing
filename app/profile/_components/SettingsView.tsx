'use client';

import { useState } from 'react';
import { Lock, Trash2, LogOut, ChevronRight, Shield } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';
import DeleteAccountModal from './DeleteAccountModal';

interface SettingsViewProps {
    handleSignOut: () => Promise<void>;
}

export default function SettingsView({ handleSignOut }: SettingsViewProps) {
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showDeleteAccount, setShowDeleteAccount] = useState(false);

    return (
        <>
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm p-5 md:p-8 border border-gray-200">
                <h2 className="text-xl md:text-2xl font-bold text-sai-charcoal mb-1 md:mb-2">Settings</h2>
                <p className="text-sm md:text-base text-gray-500 mb-6 md:mb-8">Manage your account preferences and security</p>

                <div className="space-y-5 md:space-y-6">
                    {/* Security Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-3 md:mb-4">
                            <Shield className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                            <h3 className="text-sm md:text-base font-semibold text-sai-charcoal">Security</h3>
                        </div>

                        <div className="space-y-2">
                            {/* Change Password */}
                            <button
                                onClick={() => setShowChangePassword(true)}
                                className="w-full flex items-center justify-between p-3 md:p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 md:w-10 md:h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                                        <Lock className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm md:text-base font-medium text-sai-charcoal">Change Password</p>
                                        <p className="text-xs md:text-sm text-gray-500">Update your account password</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                            </button>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="pt-5 md:pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-3 md:mb-4">
                            <Trash2 className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
                            <h3 className="text-sm md:text-base font-semibold text-red-600">Danger Zone</h3>
                        </div>

                        <div className="p-3 md:p-4 bg-red-50 rounded-xl border border-red-100">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm md:text-base font-medium text-red-700">Delete Account</p>
                                    <p className="text-xs md:text-sm text-red-600/70">Permanently delete your account and all data</p>
                                </div>
                                <button
                                    onClick={() => setShowDeleteAccount(true)}
                                    className="w-full sm:w-auto px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Session */}
                    <div className="pt-5 md:pt-6 border-t border-gray-100">
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm md:text-base font-medium hover:bg-gray-200 transition-colors"
                        >
                            <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                            Log Out
                        </button>
                    </div>
                </div>
            </div>

            <ChangePasswordModal
                isOpen={showChangePassword}
                onClose={() => setShowChangePassword(false)}
            />
            <DeleteAccountModal
                isOpen={showDeleteAccount}
                onClose={() => setShowDeleteAccount(false)}
            />
        </>
    );
}
