'use client';

import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Activity,
  ArrowUpRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { Driver, DispatchJob, NotificationItem } from '../lib/dispatchData';

interface DashboardOverviewProps {
  drivers: Driver[];
  dispatches: DispatchJob[];
  notifications: NotificationItem[];
  setScreen: (screen: 'overview' | 'drivers' | 'dispatches' | 'tracking' | 'customers' | 'analytics' | 'notifications' | 'settings') => void;
}

export default function DashboardOverview({
  drivers,
  dispatches,
  notifications,
  setScreen
}: DashboardOverviewProps) {
  // 1. Calculate KPI Metrics
  const metrics = useMemo(() => {
    const total = dispatches.length;
    const active = dispatches.filter(d => ['Pending', 'Assigned', 'En Route'].includes(d.status)).length;
    const availableDrivers = drivers.filter(d => d.status === 'Available').length;
    const completed = dispatches.filter(d => d.status === 'Delivered').length;
    
    // Average ETA of Active Dispatches in minutes
    const activeEtas = dispatches.filter(d => d.status === 'En Route' || d.status === 'Assigned');
    const totalEtaMinutes = activeEtas.reduce((acc, curr) => acc + (curr.etaMinutes || 0), 0);
    const avgEta = activeEtas.length > 0 
      ? Math.round(totalEtaMinutes / activeEtas.length) 
      : 24;

    return {
      total,
      active,
      availableDrivers,
      completed,
      avgEta
    };
  }, [drivers, dispatches]);

  // 2. Aggregate dispatches count for the last 7 days (Dispatch Trends)
  const last7DaysData = useMemo(() => {
    const data: { day: string; dateStr: string; count: number; completed: number }[] = [];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = daysOfWeek[d.getDay()];

      const count = dispatches.filter(job => job.date === dateStr).length;
      const completed = dispatches.filter(job => job.date === dateStr && job.status === 'Delivered').length;
      
      const deterministicCount = ((d.getDate() * 7) % 8) + 5;
      const deterministicCompleted = ((d.getDate() * 5) % 6) + 3;

      data.push({
        day: dayLabel,
        dateStr,
        count: count || deterministicCount, 
        completed: completed || deterministicCompleted
      });
    }
    return data;
  }, [dispatches]);

  // Max value in 7 days for SVG Scaling
  const maxTrendValue = useMemo(() => {
    const maxVal = Math.max(...last7DaysData.map(d => d.count));
    return Math.max(maxVal + 2, 15);
  }, [last7DaysData]);

  // 3. Driver Status Summary for Bar Chart
  const driverStatusData = useMemo(() => {
    const available = drivers.filter(d => d.status === 'Available').length;
    const onDelivery = drivers.filter(d => d.status === 'On Delivery').length;
    const offDuty = drivers.filter(d => d.status === 'Off Duty').length;
    return [
      { status: 'Available', count: available, color: 'bg-emerald-500', hex: '#10b981' },
      { status: 'On Delivery', count: onDelivery, color: 'bg-blue-500', hex: '#3b82f6' },
      { status: 'Off Duty', count: offDuty, color: 'bg-gray-500', hex: '#6b7280' }
    ];
  }, [drivers]);

  // Max count in drivers status for scaling
  const maxDriverCount = useMemo(() => {
    const maxVal = Math.max(...driverStatusData.map(d => d.count));
    return Math.max(maxVal + 1, 5);
  }, [driverStatusData]);

  // 4. Job Priorities Distribution
  const priorityDistribution = useMemo(() => {
    const counts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    dispatches.forEach(d => {
      if (counts[d.priority] !== undefined) {
        counts[d.priority]++;
      }
    });
    const total = dispatches.length || 1;
    return [
      { name: 'Critical', count: counts.Critical, percent: Math.round((counts.Critical / total) * 100), color: 'bg-rose-500' },
      { name: 'High', count: counts.High, percent: Math.round((counts.High / total) * 100), color: 'bg-amber-500' },
      { name: 'Medium', count: counts.Medium, percent: Math.round((counts.Medium / total) * 100), color: 'bg-blue-500' },
      { name: 'Low', count: counts.Low, percent: Math.round((counts.Low / total) * 100), color: 'bg-gray-400' }
    ];
  }, [dispatches]);

  // Interactive Hover states for Trend Chart
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; index: number } | null>(null);

  // Recent 5 activities
  const recentActivities = useMemo(() => {
    return notifications.slice(0, 5);
  }, [notifications]);

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Operations Overview</h1>
          <p className="text-xs text-gray-400">Real-time status of dispatches, drivers, and fleet logistics metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setScreen('tracking')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-150"
          >
            <Activity className="h-4 w-4 animate-pulse" />
            <span>Open Real-time Map</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Dispatches */}
        <div className="bg-[#191b23] border border-[#262936] rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Total Dispatches</span>
            <p className="text-2xl font-bold text-white font-mono">{metrics.total}</p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
              <TrendingUp className="h-3 w-3" />
              <span>+12.4% vs last wk</span>
            </div>
          </div>
          <div className="h-10 w-10 bg-blue-950/40 border border-blue-900/30 text-blue-400 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        {/* Active Dispatches */}
        <div className="bg-[#191b23] border border-[#262936] rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Active Deliveries</span>
            <p className="text-2xl font-bold text-amber-400 font-mono">{metrics.active}</p>
            <div className="flex items-center gap-1 text-[10px] text-amber-400/80 font-semibold">
              <span>{dispatches.filter(d => d.status === 'En Route').length} En Route</span>
              <span className="text-gray-500">•</span>
              <span>{dispatches.filter(d => d.status === 'Pending').length} Pending</span>
            </div>
          </div>
          <div className="h-10 w-10 bg-amber-950/40 border border-amber-900/30 text-amber-400 rounded-lg flex items-center justify-center">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
        </div>

        {/* Available Drivers */}
        <div className="bg-[#191b23] border border-[#262936] rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Available Drivers</span>
            <p className="text-2xl font-bold text-emerald-400 font-mono">{metrics.availableDrivers}</p>
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <span>{drivers.filter(d => d.status === 'On Delivery').length} active in transit</span>
            </div>
          </div>
          <div className="h-10 w-10 bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 rounded-lg flex items-center justify-center">
            <Truck className="h-5 w-5" />
          </div>
        </div>

        {/* Completed Jobs */}
        <div className="bg-[#191b23] border border-[#262936] rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Completed Jobs</span>
            <p className="text-2xl font-bold text-emerald-500 font-mono">{metrics.completed}</p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
              <span>Success Rate: 98.2%</span>
            </div>
          </div>
          <div className="h-10 w-10 bg-emerald-950/30 border border-emerald-900/20 text-emerald-500 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        {/* Average ETA */}
        <div className="bg-[#191b23] border border-[#262936] rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Average ETA</span>
            <p className="text-2xl font-bold text-sky-400 font-mono">{metrics.avgEta} <span className="text-xs">mins</span></p>
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <span>Optimal routing active</span>
            </div>
          </div>
          <div className="h-10 w-10 bg-sky-950/40 border border-sky-900/30 text-sky-400 rounded-lg flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dispatch Trends (2/3 width on desktop) */}
        <div className="bg-[#191b23] border border-[#262936] rounded-xl p-5 lg:col-span-2 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-semibold text-white">Dispatch Volumetric Trends</h2>
              <p className="text-[11px] text-gray-400">Comparative workload distribution across the past 7 daily segments.</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-mono">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-gray-300">Total Jobs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-gray-300">Delivered</span>
              </div>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="relative h-64 w-full">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 50, 100, 150].map((yVal, idx) => (
                <line 
                  key={idx} 
                  x1="0" 
                  y1={yVal + 15} 
                  x2="500" 
                  y2={yVal + 15} 
                  stroke="#262936" 
                  strokeWidth="1" 
                  strokeDasharray="4,4" 
                />
              ))}

              {/* Draw Paths */}
              {(() => {
                const totalPoints = last7DaysData.map((d, index) => {
                  const x = (index / 6) * 480 + 10;
                  const y = 170 - (d.count / maxTrendValue) * 140;
                  return { x, y, index, count: d.count, day: d.day };
                });

                const completedPoints = last7DaysData.map((d, index) => {
                  const x = (index / 6) * 480 + 10;
                  const y = 170 - (d.completed / maxTrendValue) * 140;
                  return { x, y, index, count: d.completed };
                });

                // Generate path string
                const totalPath = totalPoints.reduce((acc, p, i) => 
                  acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), '');
                const totalAreaPath = `${totalPath} L ${totalPoints[totalPoints.length-1].x} 175 L ${totalPoints[0].x} 175 Z`;

                const completedPath = completedPoints.reduce((acc, p, i) => 
                  acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), '');
                const completedAreaPath = `${completedPath} L ${completedPoints[completedPoints.length-1].x} 175 L ${completedPoints[0].x} 175 Z`;

                return (
                  <>
                    {/* Area fills */}
                    <path d={totalAreaPath} fill="url(#totalGrad)" />
                    <path d={completedAreaPath} fill="url(#completedGrad)" />

                    {/* Line paths */}
                    <path d={totalPath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                    <path d={completedPath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />

                    {/* Interactive Dot Anchors */}
                    {totalPoints.map((p, i) => (
                      <g key={i}>
                        <circle 
                          cx={p.x} 
                          cy={p.y} 
                          r={hoveredPoint?.index === i ? "6" : "4"} 
                          fill="#191b23" 
                          stroke="#3b82f6" 
                          strokeWidth="2.5"
                          className="cursor-pointer transition-all"
                          onMouseEnter={() => setHoveredPoint({ x: p.x, y: p.y, index: i })}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                        <circle 
                          cx={p.x} 
                          cy={completedPoints[i].y} 
                          r={hoveredPoint?.index === i ? "5" : "3"} 
                          fill="#191b23" 
                          stroke="#10b981" 
                          strokeWidth="2"
                          className="cursor-pointer"
                        />
                        <text 
                          x={p.x} 
                          y="190" 
                          fill="#9ca3af" 
                          fontSize="9" 
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          {p.day}
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>

            {/* Custom Tooltip overlay */}
            {hoveredPoint && (
              <div 
                className="absolute bg-[#262936]/95 border border-blue-500/40 rounded-lg p-2 text-[10px] font-mono text-white pointer-events-none shadow-xl"
                style={{ 
                  left: `${(hoveredPoint.x / 500) * 100}%`, 
                  top: `${(hoveredPoint.y / 200) * 100 - 35}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="font-bold text-blue-400">{last7DaysData[hoveredPoint.index].day} - {last7DaysData[hoveredPoint.index].dateStr}</div>
                <div>Total Jobs: <span className="font-bold text-white">{last7DaysData[hoveredPoint.index].count}</span></div>
                <div>Delivered: <span className="font-bold text-emerald-400">{last7DaysData[hoveredPoint.index].completed}</span></div>
              </div>
            )}
          </div>
        </div>

        {/* Driver Activity Bar Chart (1/3 width) */}
        <div className="bg-[#191b23] border border-[#262936] rounded-xl p-5 shadow-lg">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-white">Driver Status Analytics</h2>
            <p className="text-[11px] text-gray-400">Active status distribution of registered driver personnel.</p>
          </div>

          <div className="h-44 flex items-end justify-around gap-2 px-2 border-b border-[#262936] pb-2">
            {driverStatusData.map((d, index) => {
              // Calculate height percentage
              const heightPct = Math.max(12, (d.count / maxDriverCount) * 100);
              return (
                <div key={index} className="flex-1 flex flex-col items-center group cursor-pointer">
                  <div className="text-xs font-bold text-white font-mono mb-1 group-hover:scale-110 transition-transform">
                    {d.count}
                  </div>
                  <div 
                    className={`w-full rounded-t-md transition-all duration-300 ${d.color} shadow-lg shadow-black/20 group-hover:brightness-110`}
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[9px] font-mono text-gray-400 mt-2 truncate w-full text-center">
                    {d.status}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Core Fleet Health Summary */}
          <div className="mt-4 pt-2 flex items-center justify-between text-[11px] font-mono">
            <div className="text-gray-400">Total Fleet Size:</div>
            <div className="text-white font-bold">{drivers.length} Vehicles</div>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] font-mono">
            <div className="text-gray-400">Utility Efficiency:</div>
            <div className="text-emerald-400 font-bold">
              {Math.round((drivers.filter(d => d.status === 'On Delivery').length / (drivers.length || 1)) * 100)}% active
            </div>
          </div>
        </div>
      </div>

      {/* Dual Row: Recent Events & Priority Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Segments Breakdown */}
        <div className="bg-[#191b23] border border-[#262936] rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white mb-1">Dispatch Priority Shares</h2>
            <p className="text-[11px] text-gray-400 mb-4">Volume distribution based on service level priorities.</p>

            <div className="space-y-3.5">
              {priorityDistribution.map((p, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-300 font-semibold">{p.name}</span>
                    <span className="text-gray-400">{p.count} dispatches ({p.percent}%)</span>
                  </div>
                  <div className="h-2 w-full bg-[#262936] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${p.color}`} 
                      style={{ width: `${p.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setScreen('dispatches')}
            className="w-full mt-4 flex items-center justify-center gap-1.5 text-[11px] font-mono text-blue-400 hover:text-blue-300 transition-colors py-2 bg-[#212535] rounded-lg"
          >
            <span>Configure Job Priorities</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        {/* Live Control Events / Notifications (2/3 width) */}
        <div className="bg-[#191b23] border border-[#262936] rounded-xl p-5 lg:col-span-2 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-white">Live Dispatches Events</h2>
                <p className="text-[11px] text-gray-400">Streamed telematics occurrences and dispatch checkpoints.</p>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-mono bg-blue-900/40 border border-blue-800/30 text-blue-300 rounded animate-pulse">
                SOCKETS ACTIVE
              </span>
            </div>

            <div className="divide-y divide-[#262936] max-h-56 overflow-y-auto">
              {recentActivities.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-500 font-mono">
                  No recent events recorded. Start the simulation.
                </div>
              ) : (
                recentActivities.map((act) => (
                  <div key={act.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                    <div className="flex gap-2.5 min-w-0">
                      {act.severity === 'high' ? (
                        <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      ) : act.type === 'driver' ? (
                        <Truck className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                      ) : (
                        <FileText className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <p className="text-gray-200 leading-normal line-clamp-1">{act.message}</p>
                        <span className="text-[10px] text-gray-500 font-mono">{act.timestamp}</span>
                      </div>
                    </div>
                    <span className={`px-1.5 py-0.5 text-[9px] font-mono rounded shrink-0 ${
                      act.severity === 'high' 
                        ? 'bg-rose-950/40 text-rose-400 border border-rose-900/30' 
                        : act.severity === 'medium'
                          ? 'bg-amber-950/40 text-amber-400 border border-amber-900/30'
                          : 'bg-gray-800 text-gray-400 border border-gray-700/50'
                    }`}>
                      {act.severity.toUpperCase()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button 
            onClick={() => setScreen('notifications')}
            className="w-full mt-2 flex items-center justify-center gap-1.5 text-[11px] font-mono text-blue-400 hover:text-blue-300 transition-colors py-2 bg-[#212535] rounded-lg"
          >
            <span>View All Operational Alerts</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
