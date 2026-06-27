'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Award, 
  TrendingUp, 
  Briefcase, 
  ExternalLink, 
  Plus, 
  User, 
  CheckCircle2,
  X
} from 'lucide-react';
import { Customer, DispatchJob } from '../lib/dispatchData';

interface CustomerManagementProps {
  customers: Customer[];
  dispatches: DispatchJob[];
  setScreen: (screen: 'overview' | 'drivers' | 'dispatches' | 'tracking' | 'customers' | 'analytics' | 'notifications' | 'settings') => void;
  addDispatchJob: (jobData: Omit<DispatchJob, 'id' | 'date' | 'time' | 'etaMinutes' | 'eta'>) => void;
}

export default function CustomerManagement({
  customers,
  dispatches,
  setScreen,
  addDispatchJob
}: CustomerManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('All');
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Filter Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(cust => {
      const matchesSearch = cust.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            cust.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            cust.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTier = tierFilter === 'All' || cust.tier === tierFilter;
      const matchesRegion = regionFilter === 'All' || cust.region === regionFilter;

      return matchesSearch && matchesTier && matchesRegion;
    });
  }, [customers, searchTerm, tierFilter, regionFilter]);

  // Retrieve top 5 customers by Lifetime Value
  const topCustomers = useMemo(() => {
    return [...customers]
      .sort((a, b) => b.lifetimeValue - a.lifetimeValue)
      .slice(0, 5);
  }, [customers]);

  // Retrieve dispatch history of selected customer
  const customerHistory = useMemo(() => {
    if (!selectedCustomer) return [];
    return dispatches.filter(d => d.customerId === selectedCustomer.id);
  }, [selectedCustomer, dispatches]);

  const handleContactCustomer = (cust: Customer) => {
    alert(`Initiating contact with ${cust.contactPerson} (${cust.companyName}) at ${cust.email}...`);
  };

  const handleCreateFastTicket = (cust: Customer) => {
    // Switch to dispatches with preset customer
    setScreen('dispatches');
    // We can also trigger a toast or alert letting them know
    alert(`Pre-selecting customer ${cust.companyName} for new dispatch ticket.`);
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Customer Portfolio</h1>
          <p className="text-xs text-gray-400">Manage corporate logistics partners, view contractual billing tiers, and monitor dispatch history.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#191b23] border border-[#262936] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search corporate client name, email, point of contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#11131b] border border-[#262936] text-xs text-white placeholder-gray-500 pl-9 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Tier */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-gray-400 uppercase">Tier:</span>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-[#11131b] border border-[#262936] text-xs text-gray-300 p-2 rounded-lg focus:outline-none font-mono"
            >
              <option value="All">All Tiers</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Premium">Premium</option>
              <option value="Standard">Standard</option>
            </select>
          </div>

          {/* Region */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-gray-400 uppercase">Region:</span>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="bg-[#11131b] border border-[#262936] text-xs text-gray-300 p-2 rounded-lg focus:outline-none font-mono"
            >
              <option value="All">All Regions</option>
              <option value="East">East</option>
              <option value="West">West</option>
              <option value="Midwest">Midwest</option>
              <option value="South">South</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Main Customers List (3/4 cols) */}
        <div className="bg-[#191b23] border border-[#262936] rounded-xl overflow-hidden shadow-lg lg:col-span-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#212535]/30 border-b border-[#262936] text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Company Name</th>
                  <th className="py-3.5 px-4 font-semibold">Contact Person</th>
                  <th className="py-3.5 px-4 font-semibold">Operational Region</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Tonnage Tier</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Dispatches</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Lifetime Value</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262936] text-xs font-mono">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500 font-mono">
                      No matching enterprise clients found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust) => (
                    <tr 
                      key={cust.id} 
                      className={`hover:bg-[#1f222e]/40 transition-colors cursor-pointer ${
                        selectedCustomer?.id === cust.id ? 'bg-[#212535]/40' : ''
                      }`}
                      onClick={() => setSelectedCustomer(cust)}
                    >
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="font-semibold text-white leading-tight">{cust.companyName}</div>
                          <span className="text-[10px] text-gray-500">{cust.id}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-300">{cust.contactPerson}</td>
                      <td className="py-3.5 px-4 text-gray-400">{cust.region} Region</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold border ${
                          cust.tier === 'Enterprise'
                            ? 'bg-rose-950/40 text-rose-400 border-rose-900/30'
                            : cust.tier === 'Premium'
                              ? 'bg-blue-950/40 text-blue-400 border-blue-900/30'
                              : 'bg-gray-800 text-gray-400 border-gray-700/50'
                        }`}>
                          {cust.tier}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                          cust.status === 'Active' ? 'bg-emerald-950/40 text-emerald-400' : 'bg-gray-800 text-gray-400'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${cust.status === 'Active' ? 'bg-emerald-400' : 'bg-gray-500'}`} />
                          {cust.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-gray-300">{cust.dispatchesCount}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                        ${cust.lifetimeValue.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1.5">
                          <button 
                            onClick={() => handleContactCustomer(cust)}
                            className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-700"
                            title="Contact Point Person"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => handleCreateFastTicket(cust)}
                            className="p-1 rounded text-blue-400 hover:text-white hover:bg-blue-600 border border-blue-900/40"
                            title="Pre-select for Dispatch Ticket"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Panel: Top Customers & Profile Details (1/4 col) */}
        <div className="space-y-6">
          {/* Focused Customer Drawer */}
          {selectedCustomer ? (
            <div className="bg-[#191b23] border border-[#262936] rounded-xl p-5 shadow-lg space-y-4 font-mono animate-fade-in">
              <div className="flex items-start justify-between border-b border-[#262936] pb-3">
                <div>
                  <h3 className="text-xs font-bold text-white truncate max-w-[150px]">{selectedCustomer.companyName}</h3>
                  <span className="text-[10px] text-gray-400">{selectedCustomer.id}</span>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1 rounded bg-[#11131b] border border-[#262936] hover:bg-gray-800 text-gray-400"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Detailed Contact info */}
              <div className="space-y-2 bg-[#11131b] border border-[#262936] p-3 rounded-lg text-xs">
                <div className="flex items-center gap-2 text-gray-300">
                  <User className="h-3.5 w-3.5 text-gray-500" />
                  <span className="truncate">{selectedCustomer.contactPerson}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Mail className="h-3.5 w-3.5 text-gray-500" />
                  <span className="truncate text-[10px]">{selectedCustomer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Phone className="h-3.5 w-3.5 text-gray-500" />
                  <span>{selectedCustomer.phone}</span>
                </div>
              </div>

              {/* History Sub-queue */}
              <div className="space-y-2">
                <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Dispatch History ({customerHistory.length} Jobs)</span>
                
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {customerHistory.length === 0 ? (
                    <p className="text-[10px] text-gray-500 italic py-2">No historical dispatches found.</p>
                  ) : (
                    customerHistory.slice(0, 4).map((hist) => (
                      <div key={hist.id} className="text-[10px] bg-[#11131b] border border-[#262936] p-2 rounded flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-300">{hist.id}</p>
                          <span className="text-[9px] text-gray-500">{hist.origin.split(',')[0]} ➔ {hist.destination.split(',')[0]}</span>
                        </div>
                        <span className={`px-1 rounded text-[8px] font-bold ${
                          hist.status === 'Delivered' ? 'bg-emerald-950/50 text-emerald-400' : 'bg-amber-950/50 text-amber-400'
                        }`}>
                          {hist.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="border-t border-[#262936] pt-3 flex gap-2">
                <button
                  onClick={() => handleCreateFastTicket(selectedCustomer)}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-mono text-[10px] font-bold py-2 rounded transition-colors text-center"
                >
                  Create Ticket
                </button>
              </div>
            </div>
          ) : (
            // Top Customers Standings
            <div className="bg-[#191b23] border border-[#262936] rounded-xl p-5 shadow-lg space-y-4 font-mono">
              <div className="border-b border-[#262936] pb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-400" />
                  Top Partners
                </h3>
                <p className="text-[10px] text-gray-400">Ranked by overall contract life volume.</p>
              </div>

              <div className="space-y-3">
                {topCustomers.map((cust, idx) => (
                  <div key={cust.id} className="flex items-center justify-between text-xs pb-1.5 border-b border-[#262936]/40 last:border-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-200 truncate leading-tight">
                        {idx + 1}. {cust.companyName}
                      </p>
                      <span className="text-[9px] text-gray-500">{cust.tier} tier</span>
                    </div>
                    <span className="text-emerald-400 font-bold shrink-0">
                      ${Math.round(cust.lifetimeValue / 1000)}k
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-[#11131b] border border-[#262936] p-3 rounded-lg text-[10px] text-gray-400 space-y-1.5">
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <TrendingUp className="h-3.5 w-3.5" /> High Margin Tonnage
                </div>
                <p>Enterprise Tier accounts represent 68% of operational dispatch margins this month.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
