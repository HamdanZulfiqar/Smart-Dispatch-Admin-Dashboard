'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  X, 
  Truck, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  MapPin,
  Calendar,
  Layers
} from 'lucide-react';
import { DispatchJob, Driver, Customer } from '../lib/dispatchData';

interface DispatchManagementProps {
  dispatches: DispatchJob[];
  drivers: Driver[];
  customers: Customer[];
  addDispatchJob: (jobData: Omit<DispatchJob, 'id' | 'date' | 'time' | 'etaMinutes' | 'eta'>) => void;
  updateDispatchStatus: (jobId: string, status: DispatchJob['status'], details?: Partial<DispatchJob>) => void;
  assignDriverToJob: (jobId: string, driverId: string | null) => void;
}

export default function DispatchManagement({
  dispatches,
  drivers,
  customers,
  addDispatchJob,
  updateDispatchStatus,
  assignDriverToJob
}: DispatchManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for new job
  const [newCustomerId, setNewCustomerId] = useState('');
  const [newDriverId, setNewDriverId] = useState('');
  const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [newOrigin, setNewOrigin] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [newAmount, setNewAmount] = useState('1200');

  // Predefined origin/destinations matching our visual map logic
  const CITY_COORDS = {
    'Chicago, IL': { x: 55, y: 35 },
    'Dallas, TX': { x: 42, y: 78 },
    'Los Angeles, CA': { x: 12, y: 62 },
    'New York, NY': { x: 88, y: 28 },
    'Atlanta, GA': { x: 68, y: 68 },
    'Denver, CO': { x: 30, y: 44 },
    'Seattle, WA': { x: 10, y: 12 },
    'Miami, FL': { x: 78, y: 90 },
    'Phoenix, AZ': { x: 22, y: 68 },
    'Boston, MA': { x: 92, y: 22 },
    'Kansas City, MO': { x: 48, y: 46 },
    'Indianapolis, IN': { x: 58, y: 39 },
    'Minneapolis, MN': { x: 49, y: 24 },
    'Nashville, TN': { x: 62, y: 55 },
    'Charlotte, NC': { x: 76, y: 56 }
  };

  // Filter Dispatches
  const filteredDispatches = useMemo(() => {
    return dispatches.filter(job => {
      const matchesSearch = job.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (job.assignedDriverName && job.assignedDriverName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            job.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            job.destination.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || job.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [dispatches, searchTerm, statusFilter, priorityFilter]);

  // List of available drivers
  const availableDrivers = useMemo(() => {
    return drivers.filter(d => d.status === 'Available');
  }, [drivers]);

  // Compute metrics for quick stats cards
  const b2bStats = useMemo(() => {
    const totalValuation = dispatches.reduce((acc, c) => acc + (c.status !== 'Cancelled' ? c.amount : 0), 0);
    const activeCount = dispatches.filter(d => ['Pending', 'Assigned', 'En Route'].includes(d.status)).length;
    const pendingCount = dispatches.filter(d => d.status === 'Pending').length;
    const deliveredValue = dispatches.filter(d => d.status === 'Delivered').reduce((acc, c) => acc + c.amount, 0);

    return {
      totalValuation,
      activeCount,
      pendingCount,
      deliveredValue
    };
  }, [dispatches]);

  // Handle Form Submission
  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerId || !newOrigin || !newDestination) return;

    const cust = customers.find(c => c.id === newCustomerId);
    if (!cust) return;

    const originC = CITY_COORDS[newOrigin as keyof typeof CITY_COORDS] || { x: 40, y: 40 };
    const destC = CITY_COORDS[newDestination as keyof typeof CITY_COORDS] || { x: 60, y: 60 };

    const selectedDriver = drivers.find(d => d.id === newDriverId);

    addDispatchJob({
      customerId: cust.id,
      customerName: cust.companyName,
      assignedDriverId: selectedDriver ? selectedDriver.id : null,
      assignedDriverName: selectedDriver ? selectedDriver.name : null,
      status: selectedDriver ? 'Assigned' : 'Pending',
      priority: newPriority,
      origin: newOrigin,
      destination: newDestination,
      originCoords: originC,
      destCoords: destC,
      amount: parseFloat(newAmount) || 800
    });

    // Reset Form & Close
    setNewCustomerId('');
    setNewDriverId('');
    setNewPriority('Medium');
    setNewOrigin('');
    setNewDestination('');
    setNewAmount('1200');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dispatch Queue</h1>
          <p className="text-xs text-gray-400">Manage real-time logistics tickets, adjust dispatch routing, and issue manual updates.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-md transition-all shrink-0 self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Issue Dispatch Ticket</span>
        </button>
      </div>

      {/* Filter and Search Hub */}
      <div className="bg-[#191b23] border border-[#262936] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, customer, origin, driver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#11131b] border border-[#262936] text-xs text-white placeholder-gray-500 pl-9 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-gray-400 uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#11131b] border border-[#262936] text-xs text-gray-300 p-2 rounded-lg focus:outline-none font-mono"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="En Route">En Route</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Priority */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-gray-400 uppercase">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-[#11131b] border border-[#262936] text-xs text-gray-300 p-2 rounded-lg focus:outline-none font-mono"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dispatches Main Queue Table */}
      <div className="bg-[#191b23] border border-[#262936] rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#212535]/30 border-b border-[#262936] text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Dispatch ID</th>
                <th className="py-3.5 px-4 font-semibold">Customer Portfolio</th>
                <th className="py-3.5 px-4 font-semibold">Assigned Pilot</th>
                <th className="py-3.5 px-4 font-semibold">Freight Route</th>
                <th className="py-3.5 px-4 font-semibold text-center">Priority</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold text-center">ETA</th>
                <th className="py-3.5 px-4 font-semibold text-right">Route Value</th>
                <th className="py-3.5 px-4 font-semibold text-right">Update controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262936] text-xs font-mono">
              {filteredDispatches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-500 font-mono">
                    No matching dispatch tickets found in database.
                  </td>
                </tr>
              ) : (
                filteredDispatches.map((job) => (
                  <tr key={job.id} className="hover:bg-[#1f222e]/30 transition-colors">
                    <td className="py-4 px-4 text-blue-400 font-bold">{job.id}</td>
                    <td className="py-4 px-4 font-semibold text-white">{job.customerName}</td>
                    <td className="py-4 px-4">
                      {job.assignedDriverId ? (
                        <span className="flex items-center gap-1.5 text-gray-300">
                          <Truck className="h-3 w-3 text-sky-400" />
                          {job.assignedDriverName}
                        </span>
                      ) : (
                        <span className="text-gray-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-300 flex items-center gap-1 text-[11px]">
                        <span>{job.origin.split(',')[0]}</span>
                        <span className="text-gray-600">➔</span>
                        <span>{job.destination.split(',')[0]}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold border ${
                        job.priority === 'Critical'
                          ? 'bg-rose-950/40 text-rose-400 border-rose-900/30'
                          : job.priority === 'High'
                            ? 'bg-amber-950/40 text-amber-400 border-amber-900/30'
                            : job.priority === 'Medium'
                              ? 'bg-blue-950/40 text-blue-400 border-blue-900/30'
                              : 'bg-gray-800 text-gray-400 border-gray-700/50'
                      }`}>
                        {job.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        job.status === 'Delivered'
                          ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/30'
                          : job.status === 'En Route'
                            ? 'bg-blue-950/50 text-blue-400 border border-blue-900/30'
                            : job.status === 'Assigned'
                              ? 'bg-indigo-950/50 text-indigo-400 border border-indigo-900/30'
                              : job.status === 'Cancelled'
                                ? 'bg-rose-950/20 text-rose-500 border border-rose-950/30'
                                : 'bg-amber-950/50 text-amber-400 border border-amber-900/30'
                      }`}>
                        <span className={`h-1 w-1 rounded-full ${
                          job.status === 'Delivered'
                            ? 'bg-emerald-400'
                            : job.status === 'En Route'
                              ? 'bg-blue-400 animate-pulse'
                              : job.status === 'Assigned'
                                ? 'bg-indigo-400'
                                : job.status === 'Cancelled'
                                  ? 'bg-rose-400'
                                  : 'bg-amber-400 animate-ping'
                        }`} />
                        {job.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-300">
                      {job.status === 'Delivered' ? (
                        <span className="text-emerald-400 flex items-center justify-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Done
                        </span>
                      ) : (
                        job.eta
                      )}
                    </td>
                    <td className="py-4 px-4 text-right text-emerald-400 font-bold">
                      ${job.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        {/* Assignment dropdown if unassigned */}
                        {!job.assignedDriverId && job.status === 'Pending' && (
                          <select
                            onChange={(e) => assignDriverToJob(job.id, e.target.value)}
                            defaultValue=""
                            className="bg-[#11131b] border border-[#262936] text-[10px] text-gray-300 p-1.5 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                          >
                            <option value="" disabled>Assign Pilot</option>
                            {availableDrivers.map((drv) => (
                              <option key={drv.id} value={drv.id}>
                                {drv.name} ({drv.vehicleType})
                              </option>
                            ))}
                          </select>
                        )}

                        {/* Status updates buttons */}
                        {job.status === 'Assigned' && (
                          <button
                            onClick={() => updateDispatchStatus(job.id, 'En Route')}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-bold px-2 py-1 rounded"
                          >
                            Dispatch Out
                          </button>
                        )}

                        {job.status === 'En Route' && (
                          <button
                            onClick={() => updateDispatchStatus(job.id, 'Delivered')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-bold px-2 py-1 rounded"
                          >
                            Set Completed
                          </button>
                        )}

                        {job.status !== 'Delivered' && job.status !== 'Cancelled' && (
                          <button
                            onClick={() => updateDispatchStatus(job.id, 'Cancelled')}
                            className="text-rose-500 hover:bg-rose-950/20 text-[9px] font-bold border border-rose-950 px-2 py-1 rounded"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* B2B Logistics quick statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#191b23] border border-[#262936] rounded-xl p-4 flex items-center gap-3 shadow-md">
          <DollarSign className="h-8 w-8 text-emerald-400 bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-900/30" />
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-gray-400 uppercase">Booked Freight Value</span>
            <p className="text-sm font-bold text-white font-mono">${b2bStats.totalValuation.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-[#191b23] border border-[#262936] rounded-xl p-4 flex items-center gap-3 shadow-md">
          <Clock className="h-8 w-8 text-sky-400 bg-sky-950/40 p-1.5 rounded-lg border border-sky-900/30 animate-pulse" />
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-gray-400 uppercase">Active Transit Pipelines</span>
            <p className="text-sm font-bold text-white font-mono">{b2bStats.activeCount} active</p>
          </div>
        </div>

        <div className="bg-[#191b23] border border-[#262936] rounded-xl p-4 flex items-center gap-3 shadow-md">
          <AlertTriangle className="h-8 w-8 text-amber-400 bg-amber-950/40 p-1.5 rounded-lg border border-amber-900/30" />
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-gray-400 uppercase">Pending Ticket Backlog</span>
            <p className="text-sm font-bold text-white font-mono">{b2bStats.pendingCount} unassigned</p>
          </div>
        </div>

        <div className="bg-[#191b23] border border-[#262936] rounded-xl p-4 flex items-center gap-3 shadow-md">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 bg-emerald-950/30 p-1.5 rounded-lg border border-emerald-900/20" />
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-gray-400 uppercase">Delivered Revenue</span>
            <p className="text-sm font-bold text-white font-mono">${b2bStats.deliveredValue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Create Ticket Modal Backdrop overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#191b23] border border-[#262936] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-zoom-in">
            <div className="px-6 py-4 border-b border-[#262936] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Create Dispatch Ticket</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded bg-[#11131b] border border-[#262936] hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="p-6 space-y-4">
              {/* Customer */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 uppercase block">Enterprise Client *</label>
                <select
                  value={newCustomerId}
                  onChange={(e) => setNewCustomerId(e.target.value)}
                  className="w-full bg-[#11131b] border border-[#262936] text-xs text-white p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  required
                >
                  <option value="">-- Choose Corporate Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.region} Region)
                    </option>
                  ))}
                </select>
              </div>

              {/* Locations Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 uppercase block">Origin Hub *</label>
                  <select
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value)}
                    className="w-full bg-[#11131b] border border-[#262936] text-xs text-white p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    required
                  >
                    <option value="">-- Select Hub --</option>
                    {Object.keys(CITY_COORDS).map((city) => (
                      <option key={city} value={city} disabled={city === newDestination}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 uppercase block">Destination Hub *</label>
                  <select
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    className="w-full bg-[#11131b] border border-[#262936] text-xs text-white p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    required
                  >
                    <option value="">-- Select Hub --</option>
                    {Object.keys(CITY_COORDS).map((city) => (
                      <option key={city} value={city} disabled={city === newOrigin}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Priority & Valuation */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 uppercase block">Priority Category *</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-[#11131b] border border-[#262936] text-xs text-white p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    required
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 uppercase block">Valuation ($ Amount) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-xs text-gray-500">$</span>
                    <input
                      type="number"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className="w-full bg-[#11131b] border border-[#262936] text-xs text-white pl-7 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                      placeholder="e.g. 1500"
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Driver Manual Assignment optional */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 uppercase block">Initial Driver Assignment (Optional)</label>
                <select
                  value={newDriverId}
                  onChange={(e) => setNewDriverId(e.target.value)}
                  className="w-full bg-[#11131b] border border-[#262936] text-xs text-white p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                >
                  <option value="">Leave Unassigned (Pending Queue)</option>
                  {availableDrivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.vehicleType} • Rating {d.rating})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-[#262936] flex items-center justify-end gap-3 font-mono">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors border border-[#262936]"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors shadow-md shadow-blue-900/30"
                >
                  Execute Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
