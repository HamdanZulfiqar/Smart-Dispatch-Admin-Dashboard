'use client';

import React, { useState } from 'react';
import { 
  Sliders, 
  User, 
  Trash2, 
  CheckCircle2, 
  Palette, 
  Play, 
  Pause, 
  FastForward, 
  Mail, 
  ShieldAlert,
  BellRing
} from 'lucide-react';
import { AdminProfile, SystemSettings } from '../hooks/useDispatchStore';

interface SettingsProps {
  adminProfile: AdminProfile;
  settings: SystemSettings;
  updateAdminProfile: (profile: Partial<AdminProfile>) => void;
  updateSettings: (settings: Partial<SystemSettings>) => void;
  resetDemoData: () => void;
}

export default function SettingsScreen({
  adminProfile,
  settings,
  updateAdminProfile,
  updateSettings,
  resetDemoData
}: SettingsProps) {
  // Local profile edits
  const [name, setName] = useState(adminProfile.name);
  const [email, setEmail] = useState(adminProfile.email);
  const [role, setRole] = useState(adminProfile.role);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdminProfile({ name, email, role });
    alert('Admin profile updated successfully.');
  };

  const handleResetData = () => {
    if (confirm('Are you absolutely sure you want to restore the simulation database to original mock levels? Any custom dispatch tickets will be lost.')) {
      resetDemoData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">System Settings</h1>
        <p className="text-xs text-gray-400 font-mono">Configure dispatch user settings, visual presets, and telematics simulation triggers.</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Left Col: Admin Profile & Theme Selection */}
        <div className="space-y-6">
          {/* Admin Profile Form Card */}
          <div className="bg-[#191b23] border border-[#262936] rounded-xl p-5 shadow-lg space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-[#262936] pb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-400" />
              Dispatcher Profile
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex items-center gap-4">
                <img 
                  src={adminProfile.avatarUrl} 
                  alt={adminProfile.name} 
                  className="h-14 w-14 rounded-full border border-[#262936] object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white font-mono">{adminProfile.name}</p>
                  <p className="text-[10px] text-gray-400 font-mono">Local Auth: {adminProfile.email}</p>
                </div>
              </div>

              {/* Input grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase">Dispatcher Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#11131b] border border-[#262936] p-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase">Director Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#11131b] border border-[#262936] p-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-white"
                    required
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] text-gray-500 uppercase">Contact Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#11131b] border border-[#262936] p-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold px-4 py-2 rounded shadow transition-colors"
              >
                Save Profile Parameters
              </button>
            </form>
          </div>

          {/* Interface Theme Selection */}
          <div className="bg-[#191b23] border border-[#262936] rounded-xl p-5 shadow-lg space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-[#262936] pb-2 flex items-center gap-2">
              <Palette className="h-4 w-4 text-blue-400" />
              Visual Interface Theme
            </h2>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              {([
                { id: 'dark', label: 'Cosmic Slate (Dark)' },
                { id: 'light', label: 'Classic Gray (Light)' },
                { id: 'system', label: 'System Default' },
                { id: 'contrast', label: 'High Contrast' }
              ] as const).map((themeOpt) => (
                <button
                  key={themeOpt.id}
                  onClick={() => updateSettings({ theme: themeOpt.id })}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    settings.theme === themeOpt.id
                      ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-bold'
                      : 'bg-[#11131b] border-[#262936] text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="block mb-1">{themeOpt.label}</span>
                  <span className="text-[9px] text-gray-500">Preset colorway configuration</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Telematics Simulation Speed, Rules, and Danger Zone */}
        <div className="space-y-6">
          {/* Telematics Simulation Control Card */}
          <div className="bg-[#191b23] border border-[#262936] rounded-xl p-5 shadow-lg space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-[#262936] pb-2 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-blue-400" />
              Live Telematics Simulator
            </h2>

            <div className="space-y-4 text-xs font-mono">
              <p className="text-gray-400 leading-normal">
                Control the real-time simulation speeds of active carriers, ETA tickdowns, and spontaneous emergency events.
              </p>

              {/* Simulator state triggers */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <button
                  onClick={() => updateSettings({ simulationSpeed: 'paused' })}
                  className={`py-2 px-3 rounded flex flex-col items-center gap-1.5 border transition-all ${
                    settings.simulationSpeed === 'paused'
                      ? 'bg-rose-950/40 border-rose-500 text-rose-400 font-bold'
                      : 'bg-[#11131b] border-[#262936] text-gray-400 hover:text-white'
                  }`}
                >
                  <Pause className="h-4 w-4" />
                  <span className="text-[10px]">Pause Sim</span>
                </button>

                <button
                  onClick={() => updateSettings({ simulationSpeed: 'normal' })}
                  className={`py-2 px-3 rounded flex flex-col items-center gap-1.5 border transition-all ${
                    settings.simulationSpeed === 'normal'
                      ? 'bg-blue-950/40 border-blue-500 text-blue-400 font-bold'
                      : 'bg-[#11131b] border-[#262936] text-gray-400 hover:text-white'
                  }`}
                >
                  <Play className="h-4 w-4" />
                  <span className="text-[10px]">Normal (1x)</span>
                </button>

                <button
                  onClick={() => updateSettings({ simulationSpeed: 'fast' })}
                  className={`py-2 px-3 rounded flex flex-col items-center gap-1.5 border transition-all ${
                    settings.simulationSpeed === 'fast'
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 font-bold animate-pulse'
                      : 'bg-[#11131b] border-[#262936] text-gray-400 hover:text-white'
                  }`}
                >
                  <FastForward className="h-4 w-4" />
                  <span className="text-[10px]">Fast (3x)</span>
                </button>
              </div>
            </div>
          </div>

          {/* System configurations & notifications toggles */}
          <div className="bg-[#191b23] border border-[#262936] rounded-xl p-5 shadow-lg space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-[#262936] pb-2 flex items-center gap-2">
              <BellRing className="h-4 w-4 text-blue-400" />
              Routing Configuration
            </h2>

            <div className="space-y-3 text-xs font-mono text-gray-300">
              <label className="flex items-start gap-3 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={(e) => updateSettings({ notificationsEnabled: e.target.checked })}
                  className="mt-0.5 rounded border-[#262936] bg-[#11131b] text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-bold text-white">Enable Socket Audio Alerts</span>
                  <p className="text-[10px] text-gray-500">Play tone for critical latency spikes on transit paths.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={settings.autoOptimizeRoutes}
                  onChange={(e) => updateSettings({ autoOptimizeRoutes: e.target.checked })}
                  className="mt-0.5 rounded border-[#262936] bg-[#11131b] text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-bold text-white">Continuous Route AI Optimization</span>
                  <p className="text-[10px] text-gray-500">Auto recalculate vector coordinates to save fuel (14% efficiency avg).</p>
                </div>
              </label>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-rose-950/10 border border-rose-900/30 rounded-xl p-5 shadow-lg space-y-4">
            <h2 className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono border-b border-rose-900/20 pb-2 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-500" />
              Safety Operations - Danger Zone
            </h2>

            <div className="space-y-4 text-xs font-mono">
              <p className="text-gray-400 leading-normal">
                Resetting deletes custom-designed dispatch entries and restores initial states. This operation is non-reversible.
              </p>

              <button
                type="button"
                onClick={handleResetData}
                className="w-full bg-rose-900 hover:bg-rose-800 text-white font-mono text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow shadow-rose-950"
              >
                <Trash2 className="h-4 w-4" />
                Reset System Mock Database
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
