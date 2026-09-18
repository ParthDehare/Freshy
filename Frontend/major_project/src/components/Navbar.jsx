import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { LogOut, Shield, User, Truck, ShoppingBag, Sprout, Cpu } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return { color: 'bg-neutral-900 text-neutral-200 border-neutral-700 shadow-sm', icon: Shield, label: 'Platform Admin' };
      case 'PRODUCER':
        return { color: 'bg-neutral-900 text-neutral-200 border-neutral-700 shadow-sm', icon: Sprout, label: 'Farmer' };
      case 'DRIVER':
        return { color: 'bg-neutral-900 text-neutral-200 border-neutral-700 shadow-sm', icon: Truck, label: 'Driver' };
      case 'RETAILER':
        return { color: 'bg-neutral-900 text-neutral-200 border-neutral-700 shadow-sm', icon: ShoppingBag, label: 'Shop Owner' };
      default:
        return { color: 'bg-neutral-900 text-neutral-400 border-neutral-700 shadow-sm', icon: User, label: role || 'User' };
    }
  };

  const badge = getRoleBadge(user?.role);
  const Icon = badge.icon;

  return (
    <header className="h-16 border-b border-neutral-800 bg-black/95 backdrop-blur-xl sticky top-0 z-50 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-lg text-white">
          <Cpu className="w-5 h-5 text-neutral-300" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base text-white tracking-tight font-sans">Freshy</span>

          </div>
          <div className="text-[11px] text-neutral-500 font-medium">Smart Apple Supply Chain</div>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold ${badge.color}`}>
            <Icon className="w-3.5 h-3.5 text-neutral-300" />
            <span>{badge.label}</span>
          </div>

          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-neutral-200">{user.name}</div>
            <div className="text-xs text-neutral-500 font-mono">{user.email}</div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition text-xs font-semibold border border-neutral-800 shadow-sm cursor-pointer"
            title="Log out"
          >
            <LogOut className="w-4 h-4 text-neutral-400" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      )}
    </header>
  );
}
