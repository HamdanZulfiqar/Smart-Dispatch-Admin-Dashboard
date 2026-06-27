'use client';

import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  Search, 
  MapPin, 
  Truck, 
  Clock, 
  Navigation, 
  Activity, 
  CheckCircle2, 
  Sliders, 
  Layers,
  ZoomIn,
  ZoomOut,
  AlertCircle
} from 'lucide-react';
import { Driver, DispatchJob } from '../lib/dispatchData';

interface LiveTrackingProps {
  drivers: Driver[];
  dispatches: DispatchJob[];
}

export default function LiveTracking({
  drivers,
  dispatches
}: LiveTrackingProps) {
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [mapLayer, setMapLayer] = useState<'streets' | 'satellite' | 'vector'>('vector');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Gather drivers currently On Delivery (in transit)
  const activeTransitDrivers = useMemo(() => {
    return drivers.filter(d => d.status === 'On Delivery' && d.activeJobId);
  }, [drivers]);

  // All drivers list filtered by search
  const searchedDrivers = useMemo(() => {
    return drivers.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.vehicleType.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [drivers, searchQuery]);

  // Selected driver profile details
  const selectedDriver = useMemo(() => {
    if (!selectedDriverId) return null;
    return drivers.find(d => d.id === selectedDriverId) || null;
  }, [drivers, selectedDriverId]);

  // Selected driver active dispatch details (for route plotting)
  const selectedDispatch = useMemo(() => {
    if (!selectedDriver || !selectedDriver.activeJobId) return null;
    return dispatches.find(disp => disp.id === selectedDriver.activeJobId) || null;
  }, [selectedDriver, dispatches]);

  // Hub cities mapping (same as dispatchData.ts)
  const hubCities = [
    { name: 'Chicago, IL', x: 55, y: 35 },
    { name: 'Dallas, TX', x: 42, y: 78 },
    { name: 'Los Angeles, CA', x: 12, y: 62 },
    { name: 'New York, NY', x: 88, y: 28 },
    { name: 'Atlanta, GA', x: 68, y: 68 },
    { name: 'Denver, CO', x: 30, y: 44 },
    { name: 'Seattle, WA', x: 10, y: 12 },
    { name: 'Miami, FL', x: 78, y: 90 },
    { name: 'Phoenix, AZ', x: 22, y: 68 },
    { name: 'Boston, MA', x: 92, y: 22 },
    { name: 'Kansas City, MO', x: 48, y: 46 },
    { name: 'Indianapolis, IN', x: 58, y: 39 },
    { name: 'Minneapolis, MN', x: 49, y: 24 },
    { name: 'Nashville, TN', x: 62, y: 55 },
    { name: 'Charlotte, NC', x: 76, y: 56 }
  ];

  // Helper to zoom / shift views on SVG
  const transformStyle = useMemo(() => {
    let scale = zoomLevel;
    let translateX = 0;
    let translateY = 0;

    // Focus on focused driver
    if (selectedDriver) {
      scale = 1.6;
      translateX = -(selectedDriver.coords.x - 50) * 1.5;
      translateY = -(selectedDriver.coords.y - 50) * 1.5;
    }

    return {
      transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
      transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
    };
  }, [selectedDriver, zoomLevel]);

  return (
    <div className="space-y-6">
      {/* Live Header info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Live Operations Tracker</h1>
          <p className="text-xs text-gray-400 font-mono">
            Active telemetry grid showing dynamic carrier positions and route path vector overlays.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 bg-[#191b23] border border-[#262936] p-2.5 rounded-lg text-[10px] font-mono text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse border border-emerald-900" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-400 border border-blue-900" />
            <span>On Delivery</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-gray-500 border border-gray-600" />
            <span>Off Duty</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Drivers, Center Map, Right Telematics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        
        {/* Left Side: Drivers Sidebar & Filter */}
        <div className="bg-[#191b23] border border-[#262936] rounded-xl p-4 shadow-lg flex flex-col h-[520px]">
          <div className="space-y-3 mb-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Fleet Directory</h2>
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search pilot, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#11131b] border border-[#262936] text-[10px] text-white placeholder-gray-500 pl-8 pr-3 py-1.5 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-[#262936]/50">
            {searchedDrivers.map((drv) => {
              const isSelected = selectedDriverId === drv.id;
              return (
                <div
                  key={drv.id}
                  onClick={() => setSelectedDriverId(isSelected ? null : drv.id)}
                  className={`pt-2.5 pb-2 px-2 rounded-lg cursor-pointer transition-colors text-xs font-mono space-y-1.5 ${
                    isSelected 
                      ? 'bg-blue-950/40 border border-blue-900/30 text-blue-400' 
                      : 'hover:bg-[#1f222e]/40 text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{drv.name}</span>
                    <span className="text-[10px] text-gray-500">{drv.id}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      {drv.vehicleType}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold ${
                      drv.status === 'Available'
                        ? 'bg-emerald-950/40 text-emerald-400'
                        : drv.status === 'On Delivery'
                          ? 'bg-blue-950/40 text-blue-400'
                          : 'bg-gray-800 text-gray-400'
                    }`}>
                      {drv.status}
                    </span>
                  </div>

                  {drv.status === 'On Delivery' && drv.activeJobId && (
                    <div className="flex items-center justify-between text-[9px] text-blue-400/80 bg-blue-950/20 px-1.5 py-1 rounded">
                      <span className="font-bold">{drv.activeJobId}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        ETA active
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Interactive Map Container (takes 2 cols on desktop) */}
        <div className="bg-[#191b23] border border-[#262936] rounded-xl shadow-lg relative lg:col-span-2 h-[520px] flex flex-col justify-between overflow-hidden">
          
          {/* Map Widget Toolbar */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
            <div className="flex gap-1.5 pointer-events-auto bg-[#11131b]/95 border border-[#262936] p-1 rounded-lg shadow-xl">
              {(['vector', 'streets', 'satellite'] as const).map((layer) => (
                <button
                  key={layer}
                  onClick={() => setMapLayer(layer)}
                  className={`px-2 py-1 text-[9px] font-mono font-bold rounded uppercase ${
                    mapLayer === layer
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {layer}
                </button>
              ))}
            </div>

            <div className="flex gap-1.5 pointer-events-auto bg-[#11131b]/95 border border-[#262936] p-1 rounded-lg shadow-xl font-mono text-[10px]">
              <button 
                onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.3))}
                className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#1a1c28]"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={() => {
                  setZoomLevel(1);
                  setSelectedDriverId(null);
                }}
                className="px-1.5 py-0.5 rounded text-gray-400 hover:text-white hover:bg-[#1a1c28]"
              >
                Reset
              </button>
              <button 
                onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.3))}
                className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#1a1c28]"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Core Interactive Vector Map */}
          <div className="flex-1 bg-[#0e1017] relative cursor-grab active:cursor-grabbing overflow-hidden">
            {/* Map styling backgrounds */}
            {mapLayer === 'satellite' ? (
              <div className="absolute inset-0 opacity-15 mix-blend-overlay bg-[radial-gradient(#111_1px,transparent_1px)] [background-size:16px_16px]" />
            ) : mapLayer === 'streets' ? (
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_0.5px,transparent_0.5px)] [background-size:24px_24px]" />
            ) : null}

            {/* Matrix style grid lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#262936_1px,transparent_1px),linear-gradient(to_bottom,#262936_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.15]" />

            {/* SVG Overlay representing geographic routes */}
            <div className="w-full h-full p-4 flex items-center justify-center">
              <svg 
                viewBox="0 0 100 100" 
                className="w-full h-full max-h-[440px] overflow-visible"
                style={transformStyle}
              >
                {/* 1. Plot Selected Driver active route path */}
                {selectedDispatch && (
                  <g>
                    {/* Glowing outer line path */}
                    <line
                      x1={selectedDispatch.originCoords.x}
                      y1={selectedDispatch.originCoords.y}
                      x2={selectedDispatch.destCoords.x}
                      y2={selectedDispatch.destCoords.y}
                      stroke="#3b82f6"
                      strokeWidth="1.2"
                      strokeOpacity="0.8"
                      strokeLinecap="round"
                    />
                    {/* Flowing dashes representing package flow */}
                    <line
                      x1={selectedDispatch.originCoords.x}
                      y1={selectedDispatch.originCoords.y}
                      x2={selectedDispatch.destCoords.x}
                      y2={selectedDispatch.destCoords.y}
                      stroke="#4edea3"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeDasharray="3, 4"
                      className="animate-dash"
                    />
                  </g>
                )}

                {/* 2. Render and Connect all Cities/Hub nodes */}
                {hubCities.map((city, idx) => (
                  <g key={idx}>
                    {/* Draw connecting lines lightly for aesthetic topology */}
                    {idx < hubCities.length - 1 && (
                      <line 
                        x1={city.x} 
                        y1={city.y} 
                        x2={hubCities[idx+1].x} 
                        y2={hubCities[idx+1].y} 
                        stroke="#262936" 
                        strokeWidth="0.15" 
                      />
                    )}

                    <circle
                      cx={city.x}
                      cy={city.y}
                      r="1"
                      fill="#1e293b"
                      stroke="#475569"
                      strokeWidth="0.25"
                    />
                    
                    {/* Node Text Label */}
                    <text
                      x={city.x}
                      y={city.y - 1.8}
                      fill="#64748b"
                      fontSize="1.6"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="pointer-events-none select-none"
                    >
                      {city.name.split(',')[0]}
                    </text>
                  </g>
                ))}

                {/* 3. Render Driver Markers on current coordinates */}
                {drivers.map((drv) => {
                  const isFocused = selectedDriverId === drv.id;
                  
                  // Choose marker color
                  const markerColor = drv.status === 'Available' 
                    ? '#10b981' // green
                    : drv.status === 'On Delivery'
                      ? '#3b82f6' // blue
                      : '#6b7280'; // gray

                  return (
                    <g 
                      key={drv.id} 
                      className="cursor-pointer group"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDriverId(isFocused ? null : drv.id);
                      }}
                    >
                      {/* Pulse rings for active and selected ones */}
                      {drv.status === 'On Delivery' && (
                        <circle
                          cx={drv.coords.x}
                          cy={drv.coords.y}
                          r={isFocused ? "4" : "2"}
                          fill="none"
                          stroke={markerColor}
                          strokeWidth="0.3"
                          className="animate-ping"
                        />
                      )}

                      <circle
                        cx={drv.coords.x}
                        cy={drv.coords.y}
                        r={isFocused ? "1.8" : "1"}
                        fill={isFocused ? "#ffffff" : markerColor}
                        stroke={isFocused ? markerColor : "#11131b"}
                        strokeWidth="0.4"
                        className="transition-all duration-300"
                      />

                      {/* Display small driver label if focused or hovered */}
                      <text
                        x={drv.coords.x}
                        y={drv.coords.y + 3}
                        fill={isFocused ? "#3b82f6" : "#e2e8f0"}
                        fontSize="2"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="pointer-events-none select-none filter drop-shadow bg-[#11131b]"
                      >
                        {isFocused ? `★ ${drv.name.split(' ')[1]}` : drv.name.split(' ')[1]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Footer scrolling telemetry feed ticker */}
          <div className="h-10 bg-[#11131b] border-t border-[#262936] px-4 flex items-center justify-between text-[10px] font-mono text-gray-400">
            <div className="flex items-center gap-1.5 shrink-0">
              <Activity className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
              <span className="font-bold text-gray-300">TELEMETRY STREAM:</span>
            </div>
            
            <div className="flex-1 mx-4 overflow-x-auto whitespace-nowrap flex items-center gap-6 scrollbar-none">
              {activeTransitDrivers.length > 0 ? (
                activeTransitDrivers.map((drv) => (
                  <span key={drv.id} className="text-[9px] text-gray-400">
                    🚚 Pilot <strong className="text-white">{drv.name}</strong> en route with <strong className="text-blue-400">{drv.activeJobId}</strong> coordinates focused: <span className="text-emerald-400">{drv.coords.x.toFixed(1)}N, {drv.coords.y.toFixed(1)}W</span> • ETA {dispatches.find(j => j.id === drv.activeJobId)?.eta || 'Active'}
                  </span>
                ))
              ) : (
                <span className="text-[9px] text-gray-500">No vehicles currently in active freight transit. Manual assignments recommended.</span>
              )}
            </div>

            <span className="shrink-0 text-gray-500">
              UTC COORD STANDARD
            </span>
          </div>
        </div>

        {/* Right Side: Driver Focused Telematics / General Stats Panel */}
        <div className="space-y-4">
          {selectedDriver ? (
            <div className="bg-[#191b23] border border-[#262936] rounded-xl p-5 shadow-lg space-y-4 h-[520px] overflow-y-auto font-mono">
              <div className="flex items-start justify-between border-b border-[#262936] pb-3">
                <div>
                  <h3 className="text-xs font-bold text-white">{selectedDriver.name}</h3>
                  <span className="text-[10px] text-blue-400">{selectedDriver.id}</span>
                </div>
                <button
                  onClick={() => setSelectedDriverId(null)}
                  className="text-[10px] text-gray-500 hover:text-white"
                >
                  Clear focus
                </button>
              </div>

              {/* Status display */}
              <div className="space-y-1">
                <span className="text-[9px] text-gray-500 uppercase">Operational Status</span>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${
                    selectedDriver.status === 'Available' ? 'bg-emerald-400' : selectedDriver.status === 'On Delivery' ? 'bg-blue-400' : 'bg-gray-500'
                  }`} />
                  <span className="text-xs font-bold text-white">{selectedDriver.status}</span>
                </div>
              </div>

              {/* Coordinates */}
              <div className="bg-[#11131b] border border-[#262936] p-3 rounded-lg text-xs space-y-1">
                <span className="text-[9px] text-gray-500 uppercase">Current Map Vector</span>
                <div className="flex items-center justify-between text-white font-bold text-[11px]">
                  <span>LAT GRID: {selectedDriver.coords.x.toFixed(4)}N</span>
                  <span>LNG GRID: {selectedDriver.coords.y.toFixed(4)}W</span>
                </div>
                <div className="text-[10px] text-gray-400 mt-1">
                  Hub region: {selectedDriver.currentLocation}
                </div>
              </div>

              {/* Connected Active Job if any */}
              {selectedDispatch ? (
                <div className="border-t border-[#262936] pt-3 space-y-3">
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase">Active Dispatch Profile</span>
                    <h4 className="text-xs font-bold text-white truncate">{selectedDispatch.id} • {selectedDispatch.customerName}</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] bg-[#11131b] border border-[#262936] p-2.5 rounded-lg">
                    <div>
                      <span className="text-gray-500">From Hub:</span>
                      <p className="text-white font-bold">{selectedDispatch.origin.split(',')[0]}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">To Hub:</span>
                      <p className="text-white font-bold">{selectedDispatch.destination.split(',')[0]}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-[#11131b] border border-[#262936] p-2 rounded-lg text-xs font-bold">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-blue-400" /> Dynamic ETA:
                    </span>
                    <span className="text-blue-400 animate-pulse">{selectedDispatch.eta}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span>Route Contract Value:</span>
                    <span>${selectedDispatch.amount.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="border-t border-[#262936] pt-3 space-y-2 p-3 bg-blue-950/20 border border-blue-900/30 rounded-lg text-[10px] text-blue-400 flex gap-2">
                  <Navigation className="h-4 w-4 shrink-0 mt-0.5 animate-spin-slow" />
                  <span>No active route contract assigned to this carrier. Carrier available in dispatch pool.</span>
                </div>
              )}
            </div>
          ) : (
            // Default Fleet statistics card
            <div className="bg-[#191b23] border border-[#262936] rounded-xl p-5 shadow-lg space-y-4 h-[520px] overflow-y-auto font-mono">
              <h2 className="text-xs font-bold text-white uppercase border-b border-[#262936] pb-2 tracking-wider">Fleet Summary</h2>
              
              <div className="space-y-4">
                <div className="bg-[#11131b] border border-[#262936] p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-500">Transit carriers</span>
                    <p className="text-lg font-bold text-blue-400">{activeTransitDrivers.length}</p>
                  </div>
                  <Truck className="h-7 w-7 text-blue-500/50" />
                </div>

                <div className="bg-[#11131b] border border-[#262936] p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-500">Available pool</span>
                    <p className="text-lg font-bold text-emerald-400">{drivers.filter(d => d.status === 'Available').length}</p>
                  </div>
                  <CheckCircle2 className="h-7 w-7 text-emerald-500/50" />
                </div>

                <div className="bg-[#11131b] border border-[#262936] p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-500">Off-duty units</span>
                    <p className="text-lg font-bold text-gray-400">{drivers.filter(d => d.status === 'Off Duty').length}</p>
                  </div>
                  <Sliders className="h-7 w-7 text-gray-500/50" />
                </div>

                <div className="border-t border-[#262936] pt-4 p-3 bg-[#11131b] border border-[#262936] rounded-lg text-[10px] text-gray-400 flex gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-blue-400" />
                  <span>Click on any dynamic pilot dot on the live coordinates map or select a driver from the left pool to launch active path tracing.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
