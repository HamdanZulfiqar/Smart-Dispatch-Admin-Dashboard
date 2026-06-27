'use client';

import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  Check, 
  Trash2, 
  AlertTriangle, 
  Truck, 
  FileText, 
  Activity, 
  CheckCircle2, 
  SlidersHorizontal,
  X
} from 'lucide-react';
import { NotificationItem } from '../lib/dispatchData';

interface NotificationsCenterProps {
  notifications: NotificationItem[];
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
  markAllNotificationsRead: () => void;
}

export default function NotificationsCenter({
  notifications,
  dismissNotification,
  clearAllNotifications,
  markAllNotificationsRead
}: NotificationsCenterProps) {
  const [filterType, setFilterType] = useState<'all' | 'alert' | 'driver' | 'dispatch' | 'system'>('all');

  // Filter Notifications
  const filteredNotifications = useMemo(() => {
    if (filterType === 'all') return notifications;
    return notifications.filter(n => n.type === filterType);
  }, [notifications, filterType]);

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Notifications Hub</h1>
          <p className="text-xs text-gray-400">Stream of critical telematics alerts, driver status transitions, and dispatch system checkpoints.</p>
        </div>

        {/* Global Bulk Actions */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <button
            onClick={markAllNotificationsRead}
            disabled={notifications.length === 0}
            className="flex items-center gap-1 bg-[#212535] hover:bg-[#2a2f45] disabled:opacity-40 text-gray-300 px-3 py-1.5 rounded-lg border border-[#262936] transition-colors"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Mark All Read</span>
          </button>
          
          <button
            onClick={clearAllNotifications}
            disabled={notifications.length === 0}
            className="flex items-center gap-1 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 px-3 py-1.5 rounded-lg border border-rose-950/30 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Log</span>
          </button>
        </div>
      </div>

      {/* Categories filter bar */}
      <div className="bg-[#191b23] border border-[#262936] p-3.5 rounded-xl flex items-center justify-between gap-4 shadow-lg overflow-x-auto">
        <div className="flex items-center gap-1.5 font-mono">
          <SlidersHorizontal className="h-4 w-4 text-gray-400" />
          <span className="text-[10px] text-gray-400 uppercase mr-2">Filter category:</span>
          {(['all', 'alert', 'driver', 'dispatch', 'system'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded text-[11px] font-bold uppercase transition-all shrink-0 ${
                filterType === type
                  ? 'bg-blue-600 border border-blue-500 text-white'
                  : 'bg-[#11131b] border border-[#262936] text-gray-400 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="text-[10px] font-mono text-gray-500 shrink-0">
          Unread: <strong className="text-rose-400">{notifications.filter(n => !n.read).length}</strong>
        </div>
      </div>

      {/* List content */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-[#191b23] border border-[#262936] rounded-xl p-12 text-center text-xs font-mono text-gray-500 space-y-2">
            <Bell className="h-8 w-8 text-gray-600 mx-auto" />
            <p>No logged activities matching the selected filters found.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            // Pick aesthetic styling parameters based on category
            let iconColor = 'text-blue-400 bg-blue-950/40 border-blue-900/30';
            let IconComp = Bell;

            if (notif.type === 'alert') {
              iconColor = 'text-rose-400 bg-rose-950/40 border-rose-900/30 animate-pulse';
              IconComp = AlertTriangle;
            } else if (notif.type === 'driver') {
              iconColor = 'text-sky-400 bg-sky-950/40 border-sky-900/30';
              IconComp = Truck;
            } else if (notif.type === 'dispatch') {
              iconColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-900/30';
              IconComp = FileText;
            } else if (notif.type === 'system') {
              iconColor = 'text-purple-400 bg-purple-950/40 border-purple-900/30';
              IconComp = CheckCircle2;
            }

            return (
              <div 
                key={notif.id} 
                className={`bg-[#191b23] border rounded-xl p-4 flex items-start gap-4 shadow-md transition-all ${
                  notif.read ? 'border-[#262936]' : 'border-blue-500/30 bg-blue-950/5'
                }`}
              >
                <div className={`h-9 w-9 rounded-lg border flex items-center justify-center shrink-0 ${iconColor}`}>
                  <IconComp className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{notif.type} Event</span>
                    <span className="text-[10px] font-mono text-gray-500">{notif.timestamp}</span>
                  </div>
                  <p className={`text-xs font-mono leading-normal text-gray-200 ${notif.read ? 'opacity-80' : 'font-semibold text-white'}`}>
                    {notif.message}
                  </p>
                </div>

                <button
                  onClick={() => dismissNotification(notif.id)}
                  className="p-1 rounded bg-[#11131b] border border-[#262936] text-gray-500 hover:text-white hover:bg-[#1a1c28] transition-all shrink-0 self-center"
                  title="Dismiss Event"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
