'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  Truck, 
  Phone, 
  MapPin, 
  User, 
  X, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Driver, DispatchJob } from '../lib/dispatchData';

interface DriverManagementProps {
  drivers: Driver[];
  dispatches: DispatchJob[];
  updateDriverProfile: (driverId: string, details: Partial<Driver>) => void;
  assignDriverToJob: (jobId: string, driverId: string | null) => void;
}

export default function DriverManagement({
  drivers,
  dispatches,
  updateDriverProfile,
  assignDriverToJob
}: DriverManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Available' | 'On Delivery' | 'Off Duty'>('All');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [assignJobId, setAssignJobId] = useState('');

  // Filter & Search Drivers
  const filteredDrivers = useMemo(() => {
    return drivers.filter(drv => {
      const matchesSearch = drv.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            drv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            drv.vehicleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            drv.currentLocation.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || drv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [drivers, searchTerm, statusFilter]);

  // Retrieve current detailed driver if selected
  const activeDetailedDriver = useMemo(() => {
    if (!selectedDriver) return null;
    return drivers.find(d => d.id === selectedDriver.id) || selectedDriver;
  }, [drivers, selectedDriver]);

  // List of pending/unassigned jobs for manual dispatching
  const pendingJobs = useMemo(() => {
    return dispatches.filter(j => j.status === 'Pending' || !j.assignedDriverId);
  }, [dispatches]);

  // Handle manual dispatching
  const handleAssignJob = (e: React.FormEvent, driverId: string) => {
    e.preventDefault();
    if (!assignJobId) return;
    
    assignDriverToJob(assignJobId, driverId);
    setAssignJobId('');
    
    // Create soft alert or update local status
    const matchedJob = dispatches.find(j => j.id === assignJobId);
    alert(`Successfully assigned Dispatch ${assignJobId} to Driver ${drivers.find(d => d.id === driverId)?.name}.`);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Driver Management</h1>
          <p className="text-xs text-gray-400">Manage registered driver assets, monitor availability status, and assign dispatches.</p>
        </div>
      </div>

      {/* Main filters & search */}
      <div className="bg-[#191b23] border border-[#262936] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search drivers by ID, name, vehicle type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#11131b] border border-[#262936] text-xs text-white placeholder-gray-500 pl-9 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-mono text-gray-400 flex items-center gap-1 shrink-0">
            <Filter className="h-3 w-3" /> Filter Availability:
          </span>
          {(['All', 'Available', 'On Delivery', 'Off Duty'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-mono font-medium border transition-all shrink-0 ${
                statusFilter === status
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-[#11131b] border-[#262936] text-gray-400 hover:text-white hover:bg-[#1a1c28]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Layout grid containing driver table and side drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Table list */}
        <div className="bg-[#191b23] border border-[#262936] rounded-xl overflow-hidden lg:col-span-2 shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#212535]/30 border-b border-[#262936] text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Driver ID</th>
                  <th className="py-3.5 px-4 font-semibold">Driver Name</th>
                  <th className="py-3.5 px-4 font-semibold">Vehicle Specs</th>
                  <th className="py-3.5 px-4 font-semibold">Current Hub</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Rating</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262936] text-xs font-mono">
                {filteredDrivers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-500 font-mono">
                      No matching driver records found.
                    </td>
                  </tr>
                ) : (
                  filteredDrivers.map((drv) => (
                    <tr 
                      key={drv.id} 
                      className={`hover:bg-[#1f222e]/40 transition-colors cursor-pointer ${
                        selectedDriver?.id === drv.id ? 'bg-[#212535]/40' : ''
                      }`}
                      onClick={() => setSelectedDriver(drv)}
                    >
                      <td className="py-3.5 px-4 text-blue-400 font-bold">{drv.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-white">{drv.name}</td>
                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1.5 text-gray-300">
                          <Truck className="h-3 w-3 text-gray-400" />
                          {drv.vehicleType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-400">{drv.currentLocation}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          drv.status === 'Available'
                            ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/30'
                            : drv.status === 'On Delivery'
                              ? 'bg-blue-950/50 text-blue-400 border border-blue-900/30'
                              : 'bg-gray-800 text-gray-400 border border-gray-700/50'
                        }`}>
                          <span className={`h-1 w-1 rounded-full ${
                            drv.status === 'Available'
                              ? 'bg-emerald-400 animate-pulse'
                              : drv.status === 'On Delivery'
                                ? 'bg-blue-400'
                                : 'bg-gray-400'
                          }`} />
                          {drv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-amber-400">
                          <Star className="h-3 w-3 fill-amber-400" />
                          <span>{drv.rating}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button 
                          className="text-blue-400 hover:text-blue-300 transition-colors text-[10px] uppercase font-bold border border-blue-900/40 hover:bg-blue-950/30 px-2 py-1 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDriver(drv);
                          }}
                        >
                          Telemetry
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Driver Detailed Panel Drawer (Right side) */}
        <div className="space-y-4">
          {activeDetailedDriver ? (
            <div className="bg-[#191b23] border border-[#262936] rounded-xl p-5 shadow-xl space-y-5 animate-fade-in">
              <div className="flex items-start justify-between border-b border-[#262936] pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 bg-blue-950 border border-blue-900 text-blue-400 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white leading-tight">{activeDetailedDriver.name}</h2>
                    <p className="text-[10px] text-gray-400 font-mono">{activeDetailedDriver.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDriver(null)}
                  className="p-1 rounded bg-[#11131b] border border-[#262936] hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Status control */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Set Duty Status</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Available', 'On Delivery', 'Off Duty'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => updateDriverProfile(activeDetailedDriver.id, { status: st })}
                      className={`py-1.5 text-[9px] font-mono font-bold rounded border transition-all ${
                        activeDetailedDriver.status === st
                          ? 'bg-blue-600/30 border-blue-500 text-blue-400'
                          : 'bg-[#11131b] border-[#262936] text-gray-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact and details */}
              <div className="space-y-3 bg-[#11131b] border border-[#262936] p-3 rounded-lg text-xs font-mono">
                <div className="flex items-center gap-2 text-gray-300">
                  <Phone className="h-3.5 w-3.5 text-gray-500" />
                  <span>{activeDetailedDriver.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Truck className="h-3.5 w-3.5 text-gray-500" />
                  <span>{activeDetailedDriver.vehicleType}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="h-3.5 w-3.5 text-gray-500" />
                  <span>Hub Location: {activeDetailedDriver.currentLocation}</span>
                </div>
                {activeDetailedDriver.activeJobId ? (
                  <div className="pt-2 border-t border-[#262936] flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">Active Job:</span>
                    <span className="text-blue-400 font-bold">{activeDetailedDriver.activeJobId}</span>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-[#262936] flex items-center justify-between text-[11px] text-gray-500">
                    <span>No active job assigned</span>
                  </div>
                )}
              </div>

              {/* Performance Scores */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#11131b] border border-[#262936] p-3 rounded-lg text-center space-y-1">
                  <span className="text-[9px] font-mono text-gray-500 uppercase">Jobs Done</span>
                  <p className="text-lg font-bold text-emerald-400 font-mono">{activeDetailedDriver.completedJobsCount}</p>
                </div>
                <div className="bg-[#11131b] border border-[#262936] p-3 rounded-lg text-center space-y-1">
                  <span className="text-[9px] font-mono text-gray-500 uppercase">Efficiency Score</span>
                  <p className="text-lg font-bold text-blue-400 font-mono">{activeDetailedDriver.efficiencyScore}%</p>
                </div>
              </div>

              {/* Manual Dispatching assignment form */}
              {activeDetailedDriver.status === 'Available' ? (
                <div className="border-t border-[#262936] pt-4 space-y-3">
                  <div>
                    <h3 className="text-xs font-bold text-white">Manual Dispatch Assignment</h3>
                    <p className="text-[10px] text-gray-400">Manually issue an unassigned dispatch ticket to this driver.</p>
                  </div>

                  <form onSubmit={(e) => handleAssignJob(e, activeDetailedDriver.id)} className="space-y-3">
                    <select
                      value={assignJobId}
                      onChange={(e) => setAssignJobId(e.target.value)}
                      className="w-full bg-[#11131b] border border-[#262936] text-xs text-white p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                      required
                    >
                      <option value="">-- Choose Unassigned Job --</option>
                      {pendingJobs.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.id} • {j.customerName} ({j.origin} ➔ {j.destination})
                        </option>
                      ))}
                    </select>

                    <button
                      type="submit"
                      disabled={!assignJobId}
                      className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-mono text-xs font-bold py-2 rounded-lg transition-colors"
                    >
                      Dispatch Now
                    </button>
                  </form>
                </div>
              ) : (
                <div className="border-t border-[#262936] pt-4 flex gap-2 p-2 bg-yellow-950/20 border border-yellow-900/30 rounded-lg text-[10px] font-mono text-yellow-500 items-start">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Driver must be set to &quot;Available&quot; duty status to perform manual dispatching assignments.</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#191b23]/50 border border-[#262936] border-dashed rounded-xl p-8 text-center text-xs font-mono text-gray-500 space-y-2">
              <Truck className="h-8 w-8 text-gray-600 mx-auto" />
              <p>Select any driver from the list to view active route coordinates, dispatch performance metrics, and execute manual ticket assignment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
