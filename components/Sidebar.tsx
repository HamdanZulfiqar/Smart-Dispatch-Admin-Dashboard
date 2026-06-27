'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  FileText, 
  MapPin, 
  Users, 
  BarChart3, 
  Bell, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Compass
} from 'lucide-react';
import { cn } from '../lib/utils';
import { AdminProfile } from '../hooks/useDispatchStore';

export type ScreenType = 
  | 'overview' 
  | 'drivers' 
  | 'dispatches' 
  | 'tracking' 
  | 'customers' 
  | 'analytics' 
  | 'notifications' 
  | 'settings';

interface SidebarProps {
  currentScreen: ScreenType;
  setScreen: (screen: ScreenType) => void;
  unreadCount: number;
  adminProfile: AdminProfile;
  onLogout: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export default function Sidebar({
  currentScreen,
  setScreen,
  unreadCount,
  adminProfile,
  onLogout,
  isMobileOpen,
  setIsMobileOpen
}: SidebarProps) {
  const menuItems = [
    { id: 'overview' as ScreenType, label: 'Overview', icon: LayoutDashboard },
    { id: 'drivers' as ScreenType, label: 'Driver Management', icon: Truck },
    { id: 'dispatches' as ScreenType, label: 'Dispatch Management', icon: FileText },
    { id: 'tracking' as ScreenType, label: 'Live Tracking', icon: MapPin },
    { id: 'customers' as ScreenType, label: 'Customer Management', icon: Users },
    { id: 'analytics' as ScreenType, label: 'Fleet Analytics', icon: BarChart3 },
    { id: 'notifications' as ScreenType, label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'settings' as ScreenType, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Sidebar overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-[#141620] border-r border-[#262936] flex flex-col z-50 transition-transform duration-300 lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-[#262936] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-900/30">
              <Compass className="h-5 w-5 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-wide text-[#e1e2ed] uppercase">Smart Dispatch</h1>
              <p className="text-[10px] text-emerald-400 font-mono tracking-wider font-medium">FLEET CONTROL v2.4</p>
            </div>
          </div>
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Profile Summary */}
        <div className="p-4 border-b border-[#262936] bg-[#1a1c29]/50">
          <div className="flex items-center gap-3">
            <img 
              src={adminProfile.avatarUrl} 
              alt={adminProfile.name} 
              className="h-10 w-10 rounded-full border border-gray-700 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{adminProfile.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{adminProfile.role}</p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setScreen(item.id);
                  setIsMobileOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group duration-150",
                  isActive 
                    ? "bg-[#212535] text-blue-400 shadow-sm border-l-4 border-blue-500" 
                    : "text-[#c3c6d7] hover:text-white hover:bg-[#1a1c28]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-blue-400" : "text-gray-400 group-hover:text-gray-200"
                  )} />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white animate-pulse">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Logout Footer */}
        <div className="p-4 border-t border-[#262936] bg-[#141620]">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition-all duration-150 group"
          >
            <LogOut className="h-4 w-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>
    </>
  );
}
