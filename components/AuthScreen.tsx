'use client';

import React, { useState } from 'react';
import { Compass, Mail, Lock, User, Shield, AlertCircle } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (email: string, name: string) => void;
  onSignup: (email: string, name: string) => void;
}

export default function AuthScreen({
  onLogin,
  onSignup
}: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('admin@smartdispatch.com');
  const [password, setPassword] = useState('demo1234');
  const [name, setName] = useState('Alex Rivera');
  
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide corporate login credentials.');
      return;
    }

    if (password.length < 4) {
      setError('Security protocols require at least 4 characters.');
      return;
    }

    if (isSignUp) {
      if (!name) {
        setError('Please provide full dispatcher name.');
        return;
      }
      onSignup(email, name);
    } else {
      // Allow demo login with standard credentials
      const loginName = email === 'admin@smartdispatch.com' ? 'Alex Rivera' : email.split('@')[0];
      onLogin(email, loginName);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1017] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Visual map background lines for grid aesthetic */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#262936_1px,transparent_1px),linear-gradient(to_bottom,#262936_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.08]" />
      
      {/* Ambient gradient back glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-[#191b23] border border-[#262936] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 relative z-10">
        
        {/* Brand logo & header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 bg-blue-600 rounded-xl items-center justify-center text-white shadow-lg shadow-blue-950/40">
            <Compass className="h-6 w-6 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white uppercase tracking-wider">Smart Dispatch Admin</h1>
            <p className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest">Enterprise Command Portal</p>
          </div>
        </div>

        {/* Validation Errors */}
        {error && (
          <div className="bg-rose-950/40 border border-rose-900/30 rounded-lg p-3 text-rose-400 text-xs font-mono flex items-start gap-2 animate-shake">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Forms */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-gray-400 uppercase text-[10px]">Full Dispatcher Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#11131b] border border-[#262936] rounded-lg pl-9 pr-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-gray-400 uppercase text-[10px]">Corporate Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <input
                type="email"
                placeholder="dispatcher@smartdispatch.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#11131b] border border-[#262936] rounded-lg pl-9 pr-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 uppercase text-[10px]">Terminal Security Code</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#11131b] border border-[#262936] rounded-lg pl-9 pr-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-900/30 transition-all font-mono uppercase tracking-wider text-xs"
          >
            {isSignUp ? 'Activate Console Access' : 'Establish Console Connection'}
          </button>
        </form>

        {/* Form Toggle */}
        <div className="text-center font-mono text-[10px] text-gray-500">
          {isSignUp ? (
            <p>
              Already verified?{' '}
              <button 
                onClick={() => {
                  setIsSignUp(false);
                  setError('');
                }}
                className="text-blue-400 hover:underline font-bold"
              >
                Connect Credentials
              </button>
            </p>
          ) : (
            <p>
              New logistics officer?{' '}
              <button 
                onClick={() => {
                  setIsSignUp(true);
                  setError('');
                }}
                className="text-blue-400 hover:underline font-bold"
              >
                Register Admin Node
              </button>
            </p>
          )}
        </div>

        {/* Security disclaimer footer */}
        <div className="pt-4 border-t border-[#262936]/40 text-center flex items-center justify-center gap-1.5 text-[9px] font-mono text-gray-600">
          <Shield className="h-3 w-3 text-emerald-500/70" />
          <span>AES-256 PORT SECURITY PROTOCOLS ENFORCED</span>
        </div>

      </div>
    </div>
  );
}
