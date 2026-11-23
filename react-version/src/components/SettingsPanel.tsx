import React, { useState } from 'react';

interface SettingsPanelProps {
    onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'visuals' | 'gameplay' | 'audio' | 'account'>('visuals');

    const tabs = [
        { id: 'visuals', label: 'Visuals' },
        { id: 'gameplay', label: 'Gameplay' },
        { id: 'audio', label: 'Audio' },
        { id: 'account', label: 'Account' },
    ];

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1c1c1f] border-2 border-[#3d3e40] rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#3d3e40] bg-[#2a2a2e]">
                    <h2 className="text-xl font-bold text-white">Settings</h2>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs Navigation */}
                <div className="flex bg-[#1c1c1f] border-b border-[#3d3e40] overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-3 text-sm font-bold transition-all ${activeTab === tab.id
                                    ? 'bg-[#3d3e40] text-white border-b-2 border-indigo-500'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'visuals' && (
                        <div className="space-y-6">
                            <h3 className="text-white/60 text-xs uppercase tracking-widest font-bold">Visual Settings</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-white">Brightness</span>
                                    <input type="range" className="w-1/2 accent-indigo-500" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-white">Sprite Scale</span>
                                    <input type="range" className="w-1/2 accent-indigo-500" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-white">UI Scale</span>
                                    <input type="range" className="w-1/2 accent-indigo-500" />
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'gameplay' && (
                        <div className="space-y-6">
                            <h3 className="text-white/60 text-xs uppercase tracking-widest font-bold">Gameplay Settings</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-white">Battle Speed</span>
                                    <select className="bg-[#2a2a2e] text-white border border-[#3d3e40] rounded px-2 py-1">
                                        <option>1x</option>
                                        <option>3x</option>
                                        <option>5x</option>
                                    </select>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-white">Difficulty</span>
                                    <select className="bg-[#2a2a2e] text-white border border-[#3d3e40] rounded px-2 py-1">
                                        <option>Easy</option>
                                        <option>Normal</option>
                                        <option>Hard</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'audio' && (
                        <div className="space-y-6">
                            <h3 className="text-white/60 text-xs uppercase tracking-widest font-bold">Audio Settings</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-white">Music Volume</span>
                                    <input type="range" className="w-1/2 accent-indigo-500" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-white">SFX Volume</span>
                                    <input type="range" className="w-1/2 accent-indigo-500" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-white">Mute Music</span>
                                    <input type="checkbox" className="w-4 h-4 accent-indigo-500" />
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'account' && (
                        <div className="space-y-6">
                            <h3 className="text-white/60 text-xs uppercase tracking-widest font-bold">Account Settings</h3>
                            <div className="space-y-4">
                                <div className="flex flex-col gap-2">
                                    <span className="text-white">Username</span>
                                    <input type="text" className="bg-[#2a2a2e] text-white border border-[#3d3e40] rounded px-3 py-2" defaultValue="Trainer" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-white">Avatar</span>
                                    <div className="w-16 h-16 bg-[#2a2a2e] border border-[#3d3e40] rounded flex items-center justify-center">
                                        <span className="text-white/30">None</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[#3d3e40] flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded font-bold transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
