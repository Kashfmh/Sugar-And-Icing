import { Tab } from '@/hooks/useProfile';

interface ProfileTabsProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
}

export default function ProfileTabs({ activeTab, setActiveTab }: ProfileTabsProps) {
    return (
        <div className="max-w-7xl mx-auto px-6 border-b border-gray-200">
            <div className="flex gap-8">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`pb-4 font-medium transition-colors relative ${activeTab === 'dashboard' ? 'text-sai-charcoal' : 'text-gray-500'}`}
                >
                    Dashboard
                    {activeTab === 'dashboard' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sai-charcoal"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('edit-profile')}
                    className={`pb-4 font-medium transition-colors relative ${activeTab === 'edit-profile' ? 'text-sai-charcoal' : 'text-gray-500'}`}
                >
                    Edit Profile
                    {activeTab === 'edit-profile' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sai-charcoal"></div>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('settings')}
                    className={`pb-4 font-medium transition-colors relative ${activeTab === 'settings' ? 'text-sai-charcoal' : 'text-gray-500'}`}
                >
                    Settings
                    {activeTab === 'settings' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sai-charcoal"></div>
                    )}
                </button>
            </div>
        </div>
    );
}