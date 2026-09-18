import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { LayoutDashboard, Package, MapPin, BarChart3, Users, ShieldCheck, Cpu, Clock, History } from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuthStore();
  const location = useLocation();

  const getNavLinks = (role) => {
    switch (role) {
      case 'ADMIN':
        return [
          { to: '/admin?tab=overview', label: 'Dashboard Overview', icon: LayoutDashboard, tab: 'overview' },
          { to: '/admin?tab=users', label: 'All Users', icon: Users, tab: 'users' },
          { to: '/admin?tab=shipments', label: 'All Shipments', icon: Package, tab: 'shipments' },
          { to: '/admin?tab=analytics', label: 'Quality Reports & Charts', icon: BarChart3, tab: 'analytics' },
        ];
      case 'PRODUCER':
        return [
          { to: '/producer?tab=overview', label: 'My Dashboard', icon: LayoutDashboard, tab: 'overview' },
          { to: '/producer?tab=batches', label: 'My Batches', icon: Package, tab: 'batches' },
          { to: '/producer?tab=schedule', label: 'Pickup Schedule', icon: Clock, tab: 'schedule' },
        ];
      case 'DRIVER':
        return [
          { to: '/driver?tab=active', label: 'Current Delivery', icon: MapPin, tab: 'active' },
          { to: '/driver?tab=history', label: 'Past Deliveries', icon: History, tab: 'history' },
        ];
      case 'RETAILER':
        return [
          { to: '/retailer?tab=deliveries', label: 'My Deliveries', icon: LayoutDashboard, tab: 'deliveries' },
          { to: '/retailer?tab=xai', label: 'Quality Reports', icon: ShieldCheck, tab: 'xai' },
          { to: '/retailer?tab=simulator', label: 'Try AI Grader', icon: Cpu, tab: 'simulator' },
        ];
      default:
        return [];
    }
  };

  const links = getNavLinks(user?.role);
  if (!links.length) return null;

  const currentTab = new URLSearchParams(location.search).get('tab') || links[0].tab;

  return (
    <aside className="w-64 border-r border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md p-4 flex flex-col gap-1.5 min-h-[calc(100vh-4rem)]">
      <div className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-widest px-3 py-2 mb-2">
        {user?.role} Menu
      </div>
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = currentTab === link.tab;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition ${
              isActive
                ? 'bg-neutral-900 text-white border border-neutral-700 shadow-md font-bold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50 border border-transparent'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
            <span>{link.label}</span>
          </NavLink>
        );
      })}
    </aside>
  );
}
