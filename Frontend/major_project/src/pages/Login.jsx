import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Shield, Sprout, Truck, ShoppingBag, ArrowRight, Lock, Mail, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';
import loginBg from '../assets/login-bg.jpg';
import { useToast } from '../components/Toast';


export default function Login() {
  const [email, setEmail] = useState('admin@freshy.com');
  const [password, setPassword] = useState('pass123');
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();


  const roles = [
    {
      role: 'ADMIN',
      title: 'Platform Admin',
      desc: 'Manage all users, shipments & quality reports',
      email: 'admin@freshy.com',
      icon: Shield,
      accent: 'border-purple-500/40 hover:border-purple-500 text-purple-300 shadow-[0_0_20px_-5px_rgba(168,85,247,0.15)]',
      activeAccent: 'border-purple-500 bg-purple-500/10 shadow-[0_0_25px_-5px_rgba(168,85,247,0.4)] ring-1 ring-purple-500',
      badge: 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
    },
    {
      role: 'PRODUCER',
      title: 'Orchard Producer',
      desc: 'Upload apple photos, check quality grades & schedule pickups',
      email: 'producer@freshy.com',
      icon: Sprout,
      accent: 'border-emerald-500/40 hover:border-emerald-500 text-emerald-300 shadow-[0_0_20px_-5px_rgba(16,185,129,0.15)]',
      activeAccent: 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_25px_-5px_rgba(16,185,129,0.4)] ring-1 ring-emerald-500',
      badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
    },
    {
      role: 'DRIVER',
      title: 'Logistics Driver',
      desc: 'Track your delivery route, update trip status & view history',
      email: 'driver@freshy.com',
      icon: Truck,
      accent: 'border-cyan-500/40 hover:border-cyan-500 text-cyan-300 shadow-[0_0_20px_-5px_rgba(6,182,212,0.15)]',
      activeAccent: 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_25px_-5px_rgba(6,182,212,0.4)] ring-1 ring-cyan-500',
      badge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
    },
    {
      role: 'RETAILER',
      title: 'Retailer Hub',
      desc: 'Receive deliveries, check apple quality & understand AI grades',
      email: 'retailer@freshy.com',
      icon: ShoppingBag,
      accent: 'border-amber-500/40 hover:border-amber-500 text-amber-300 shadow-[0_0_20px_-5px_rgba(245,158,11,0.15)]',
      activeAccent: 'border-amber-500 bg-amber-500/10 shadow-[0_0_25px_-5px_rgba(245,158,11,0.4)] ring-1 ring-amber-500',
      badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
    },
  ];

  const handleQuickSelect = (roleEmail) => {
    clearError();
    setEmail(roleEmail);
    setPassword('pass123');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      toast.success('Welcome!', `Logged in as ${user.name || user.email}`);
      switch (user.role) {
        case 'ADMIN': navigate('/admin?tab=overview'); break;
        case 'PRODUCER': navigate('/producer?tab=overview'); break;
        case 'DRIVER': navigate('/driver?tab=active'); break;
        case 'RETAILER': navigate('/retailer?tab=deliveries'); break;
        default: navigate('/'); break;
      }
    } catch (err) {
      toast.error('Login Failed', err.response?.data?.message || 'Please check your credentials.');
      // Error handled by store
    }
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-neutral-800 selection:text-white font-sans">
      {/* Full-Screen Apple Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none scale-[1.03] transition-all duration-1000"
        style={{ backgroundImage: `url(${loginBg})` }}
      />

      {/* High-Contrast Vignette & Glass Overlay to ensure crystal readability while keeping apple details visible */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/55 to-black/95 pointer-events-none" />
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px] pointer-events-none" />

      {/* Subtle High-Tech Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-5xl relative z-10 px-4 animate-fadeIn">
        {/* Brand Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight flex items-center justify-center gap-3 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            <span>Freshy</span>
          </h1>
        </div>

        {/* Persona Selector Cards */}
        <div className="mb-8">
          <h2 className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-widest text-center mb-4 drop-shadow">
            Choose Your Role to Login
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map((item) => {
              const Icon = item.icon;
              const isSelected = email === item.email;
              return (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleQuickSelect(item.email)}
                  className={`p-5 rounded-2xl bg-black/75 backdrop-blur-xl border text-left transition-all duration-300 flex flex-col justify-between relative overflow-hidden cursor-pointer ${
                    isSelected ? item.activeAccent : `${item.accent} bg-black/60`
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-3.5 right-3.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                    </span>
                  )}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-black/80 border border-neutral-800 flex items-center justify-center ${isSelected ? 'text-white' : ''}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-extrabold text-sm text-white tracking-wide">{item.title}</span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed font-sans">{item.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs font-mono font-bold">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${item.badge}`}>
                      {item.role}
                    </span>
                    <span className={isSelected ? 'text-white underline underline-offset-4' : 'text-neutral-400'}>
                      {isSelected ? 'Selected ✓' : 'Select →'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form Box */}
        <div className="bg-black/80 border border-neutral-800/90 rounded-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.9)] p-6 sm:p-8 backdrop-blur-2xl max-w-md mx-auto relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-60" />

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-xs text-center font-bold flex items-center justify-center gap-2">
              <span>⚠️ {error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-950/90 border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition font-mono shadow-inner"
                  placeholder="name@freshy.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-950/90 border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition font-mono shadow-inner"
                  placeholder="••••••••"
                />
              </div>
              <p className="text-[11px] text-neutral-400 mt-1 font-mono flex items-center justify-between">
                <span>Default demo password:</span>
                <span className="text-white font-bold">pass123</span>
              </p>
              <div className="text-right mt-1">
                <button type="button" onClick={() => toast.info('Forgot Password', 'Please contact your administrator to reset your password.')} className="text-xs text-emerald-400 hover:text-emerald-300 transition cursor-pointer underline underline-offset-2">
                  Forgot Password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 bg-gradient-to-r from-white via-neutral-100 to-neutral-300 hover:brightness-110 text-black font-black py-3.5 px-4 rounded-xl shadow-[0_0_25px_-5px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 text-sm cursor-pointer"
            >
              <span>{loading ? 'Logging in...' : 'Login →'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>


        </div>
      </div>
    </div>
  );
}
