'use client';

import React, { useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Layers, 
  Activity,
  AlertTriangle,
  Award
} from 'lucide-react';
import { Driver, DispatchJob } from '../lib/dispatchData';

interface AnalyticsProps {
  drivers: Driver[];
  dispatches: DispatchJob[];
}

export default function Analytics({
  drivers,
  dispatches
}: AnalyticsProps) {
  
  // 1. Completion rate calculation
  const stats = useMemo(() => {
    const total = dispatches.length || 1;
    const delivered = dispatches.filter(d => d.status === 'Delivered').length;
    const cancelled = dispatches.filter(d => d.status === 'Cancelled').length;
    const completionRate = Math.round((delivered / (total - cancelled)) * 100);

    const totalActiveValue = dispatches
      .filter(d => d.status !== 'Cancelled')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const avgResponseTime = 22; // simulated target in minutes

    return {
      completionRate,
      delivered,
      cancelled,
      totalActiveValue,
      avgResponseTime
    };
  }, [dispatches]);

  // 2. Heatmap Density grid (Days of week vs 4 Hour Slots)
  // Days: Mon - Sun
  // Slots: Morning (06-12), Afternoon (12-18), Evening (18-24), Night (00-06)
  const heatmapData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const slots = ['Morning', 'Afternoon', 'Evening', 'Night'];
    
    // Hardcoded realistic densities that align with standard shipping patterns
    // values between 1 and 10 representing workload weight
    const rawMatrix = [
      [8, 9, 6, 2], // Mon
      [9, 10, 7, 3], // Tue
      [8, 8, 8, 4], // Wed
      [7, 9, 9, 3], // Thu
      [9, 10, 5, 2], // Fri
      [4, 5, 3, 1], // Sat
      [3, 2, 4, 3]  // Sun
    ];

    const grid: { day: string; slot: string; value: number }[] = [];
    days.forEach((day, dayIdx) => {
      slots.forEach((slot, slotIdx) => {
        grid.push({
          day,
          slot,
          value: rawMatrix[dayIdx][slotIdx]
        });
      });
    });

    return { grid, days, slots };
  }, []);

  // 3. Driver efficiency list (Top 5)
  const topEfficientDrivers = useMemo(() => {
    return [...drivers]
      .sort((a, b) => b.efficiencyScore - a.efficiencyScore)
      .slice(0, 5);
  }, [drivers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Fleet Performance Analytics</h1>
        <p className="text-xs text-gray-400">Deep-dive audit logs into carrier response times, delivery fulfillment ratios, and route densities.</p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
        <div className="bg-[#191b23] border border-[#262936] rounded-xl p-4 flex items-center gap-3.5 shadow-md">
          <Clock className="h-8 w-8 text-blue-400 bg-blue-950/40 p-1.5 rounded-lg border border-blue-900/30" />
          <div>
            <span className="text-[9px] text-gray-500 uppercase">Avg Response Time</span>
            <p className="text-lg font-bold text-white">{stats.avgResponseTime} mins</p>
          </div>
        </div>

        <div className="bg-[#191b23] border border-[#262936] rounded-xl p-4 flex items-center gap-3.5 shadow-md">
          <CheckCircle2 className="h-8 w-8 text-emerald-400 bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-900/30" />
          <div>
            <span className="text-[9px] text-gray-500 uppercase">Fulfillment Ratio</span>
            <p className="text-lg font-bold text-white">{stats.completionRate}% completion</p>
          </div>
        </div>

        <div className="bg-[#191b23] border border-[#262936] rounded-xl p-4 flex items-center gap-3.5 shadow-md">
          <Layers className="h-8 w-8 text-purple-400 bg-purple-950/40 p-1.5 rounded-lg border border-purple-900/30" />
          <div>
            <span className="text-[9px] text-gray-500 uppercase">Revenue Pipeline</span>
            <p className="text-lg font-bold text-white">${(stats.totalActiveValue / 1000).toFixed(1)}k booked</p>
          </div>
        </div>

        <div className="bg-[#191b23] border border-[#262936] rounded-xl p-4 flex items-center gap-3.5 shadow-md">
          <Activity className="h-8 w-8 text-amber-400 bg-amber-950/40 p-1.5 rounded-lg border border-amber-900/30 animate-pulse" />
          <div>
            <span className="text-[9px] text-gray-500 uppercase">Active Dispatch Rate</span>
            <p className="text-lg font-bold text-white">8.5 dispatches/hr</p>
          </div>
        </div>
      </div>

      {/* Analytics Graphs & Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Day/Time Dispatch Volume Heatmap (2/3 width) */}
        <div className="bg-[#191b23] border border-[#262936] rounded-xl p-5 lg:col-span-2 shadow-lg flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-white">Fulfillment Despatch Density Heatmap</h2>
            <p className="text-[11px] text-gray-400 font-mono">Heat density tracking active freight loading volumes based on Day and Hourly Shift Segments.</p>
          </div>

          {/* Grid visualizer */}
          <div className="space-y-4">
            {/* Header hourly shift labels */}
            <div className="grid grid-cols-5 gap-1.5 pl-12 text-[9px] font-mono text-gray-400 text-center">
              <span>Shift:</span>
              <span>Morning (6am-12)</span>
              <span>Afternoon (12-6)</span>
              <span>Evening (6pm-12)</span>
              <span>Night (12am-6)</span>
            </div>

            {/* Heat Rows */}
            <div className="space-y-1.5">
              {heatmapData.days.map((day, dIdx) => (
                <div key={day} className="grid grid-cols-5 gap-1.5 items-center">
                  <span className="text-[10px] font-mono text-gray-400 font-bold w-12 text-right pr-2">
                    {day}
                  </span>
                  
                  {heatmapData.slots.map((slot, sIdx) => {
                    const cell = heatmapData.grid.find(g => g.day === day && g.slot === slot);
                    const val = cell ? cell.value : 0;
                    
                    // Style cell backgrounds based on density values (1-10)
                    let bgClass = 'bg-[#141620]';
                    let textClass = 'text-gray-600';
                    if (val >= 9) {
                      bgClass = 'bg-emerald-500 shadow shadow-emerald-500/10';
                      textClass = 'text-[#00311f] font-bold';
                    } else if (val >= 7) {
                      bgClass = 'bg-emerald-600/70 border border-emerald-500/20';
                      textClass = 'text-emerald-100';
                    } else if (val >= 5) {
                      bgClass = 'bg-blue-600/50 border border-blue-500/10';
                      textClass = 'text-blue-100';
                    } else if (val >= 3) {
                      bgClass = 'bg-[#212535]';
                      textClass = 'text-gray-400';
                    }

                    return (
                      <div 
                        key={slot} 
                        className={`h-9 rounded-lg flex items-center justify-center text-[10px] font-mono transition-all hover:scale-[1.03] ${bgClass}`}
                        title={`${day} ${slot}: Density weight ${val}`}
                      >
                        <span className={textClass}>{val}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#262936] flex items-center justify-between text-[10px] font-mono text-gray-500">
            <span>Color code: Mon-Fri Afternoons represent peak dispatch demands</span>
            <span>SCALE: 1 (LOW) - 10 (CRITICAL)</span>
          </div>
        </div>

        {/* Right Side: Driver Efficiency Standings (1/3 width) */}
        <div className="bg-[#191b23] border border-[#262936] rounded-xl p-5 shadow-lg space-y-4 font-mono">
          <div className="border-b border-[#262936] pb-2 flex items-center gap-2">
            <Award className="h-4 w-4 text-emerald-400" />
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Top Pilots Efficiency</h3>
              <p className="text-[10px] text-gray-400">Ranked by completion speed & ratings.</p>
            </div>
          </div>

          <div className="space-y-4">
            {topEfficientDrivers.map((drv, idx) => (
              <div key={drv.id} className="space-y-1.5 pb-2 border-b border-[#262936]/50 last:border-0 last:pb-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-200">{idx + 1}. {drv.name}</span>
                  <span className="text-blue-400 font-bold">{drv.efficiencyScore}% score</span>
                </div>
                
                {/* Horizontal progress bar */}
                <div className="h-1.5 w-full bg-[#11131b] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${drv.efficiencyScore}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-[9px] text-gray-500">
                  <span>Rating: {drv.rating} ★</span>
                  <span>{drv.completedJobsCount} jobs completed</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-yellow-950/25 border border-yellow-900/30 p-3 rounded-lg text-[10px] text-yellow-500 flex gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Operational safety metrics mandate minimum 4.4 rating scores for premium parcel routing rights.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
