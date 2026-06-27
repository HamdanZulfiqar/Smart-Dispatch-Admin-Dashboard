'use client';

import React, { useState } from 'react';
import { Menu, Bell, Clock, Activity, LogOut, Compass } from 'lucide-react';

import { useDispatchStore } from '../hooks/useDispatchStore';
import Sidebar, { ScreenType } from '../components/Sidebar';
import AuthScreen from '../components/AuthScreen';
import DashboardOverview from '../components/DashboardOverview';
import DriverManagement from '../components/DriverManagement';
import DispatchManagement from '../components/DispatchManagement';
import LiveTracking from '../components/LiveTracking';
import CustomerManagement from '../components/CustomerManagement';
import Analytics from '../components/Analytics';
import NotificationsCenter from '../components/NotificationsCenter';
import SettingsScreen from '../components/SettingsScreen';

export default function Home() {
  const store = useDispatchStore();
  const [currentScreen, setScreen] = useState<ScreenType>('overview');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Loading state
  if (!store.initialized) {
    return (
      <div className="min-h-screen bg-[#0e1017] flex flex-col items-center justify-center font-mono text-xs text-gray-400 space-y-4">
        <div className="h-10 w-10 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
        <p className="animate-pulse">SYNCHRONIZING FLEET CLOUD NODES...</p>
      </div>
    );
  }

  // Auth Guard
  if (!store.currentUser) {
    return (
      <AuthScreen 
        onLogin={store.login} 
        onSignup={store.signup} 
      />
    );
  }

  // Count unread notifications
  const unreadCount = store.notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#0e1017] text-gray-200 flex">
      {/* Sidebar - Desktop persistent, Mobile drawer */}
      <Sidebar
        currentScreen={currentScreen}
        setScreen={setScreen}
        unreadCount={unreadCount}
        adminProfile={store.adminProfile}
        onLogout={store.logout}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Control Bar Header */}
        <header className="h-16 border-b border-[#262936] bg-[#141620] px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
          {/* Left section: Hamburger for mobile + current page name */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1c28] lg:hidden"
            >
              <Menu className="h-5.5 w-5.5" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <Compass className="h-4.5 w-4.5 text-blue-400" />
              <span className="text-[10px] font-mono font-bold text-[#e1e2ed] uppercase tracking-wider bg-[#212535] px-2 py-0.5 rounded">
                SECURE CONSOLE PATHWAY
              </span>
            </div>
          </div>

          {/* Right section: System clock & notifications status widget */}
          <div className="flex items-center gap-4 text-xs font-mono">
            {/* Live Clock indicator */}
            <div className="hidden md:flex items-center gap-2 text-gray-400 bg-[#11131b] border border-[#262936] px-3 py-1.5 rounded-lg">
              <Clock className="h-3.5 w-3.5 text-blue-400 animate-spin-slow" />
              <span>UTC SERVER LIVE</span>
            </div>

            {/* Notifications Button Badge Shortcut */}
            <button
              onClick={() => setScreen('notifications')}
              className="p-2 bg-[#191b23] border border-[#262936] hover:bg-[#212535] text-gray-300 hover:text-white rounded-lg relative transition-all"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose-500 border border-[#141620]" />
              )}
            </button>
          </div>
        </header>

        {/* Scrollable Main Screen Canvas */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {(() => {
            switch (currentScreen) {
              case 'overview':
                return (
                  <DashboardOverview
                    drivers={store.drivers}
                    dispatches={store.dispatches}
                    notifications={store.notifications}
                    setScreen={setScreen}
                  />
                );
              case 'drivers':
                return (
                  <DriverManagement
                    drivers={store.drivers}
                    dispatches={store.dispatches}
                    updateDriverProfile={store.updateDriverProfile}
                    assignDriverToJob={store.assignDriverToJob}
                  />
                );
              case 'dispatches':
                return (
                  <DispatchManagement
                    dispatches={store.dispatches}
                    drivers={store.drivers}
                    customers={store.customers}
                    addDispatchJob={store.addDispatchJob}
                    updateDispatchStatus={store.updateDispatchStatus}
                    assignDriverToJob={store.assignDriverToJob}
                  />
                );
              case 'tracking':
                return (
                  <LiveTracking
                    drivers={store.drivers}
                    dispatches={store.dispatches}
                  />
                );
              case 'customers':
                return (
                  <CustomerManagement
                    customers={store.customers}
                    dispatches={store.dispatches}
                    setScreen={setScreen}
                    addDispatchJob={store.addDispatchJob}
                  />
                );
              case 'analytics':
                return (
                  <Analytics
                    drivers={store.drivers}
                    dispatches={store.dispatches}
                  />
                );
              case 'notifications':
                return (
                  <NotificationsCenter
                    notifications={store.notifications}
                    dismissNotification={store.dismissNotification}
                    clearAllNotifications={store.clearAllNotifications}
                    markAllNotificationsRead={store.markAllNotificationsRead}
                  />
                );
              case 'settings':
                return (
                  <SettingsScreen
                    adminProfile={store.adminProfile}
                    settings={store.settings}
                    updateAdminProfile={store.updateAdminProfile}
                    updateSettings={store.updateSettings}
                    resetDemoData={store.resetDemoData}
                  />
                );
              default:
                return (
                  <DashboardOverview
                    drivers={store.drivers}
                    dispatches={store.dispatches}
                    notifications={store.notifications}
                    setScreen={setScreen}
                  />
                );
            }
          })()}
        </main>
      </div>
    </div>
  );
}
