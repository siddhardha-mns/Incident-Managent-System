import React from 'react';
import { NavLink } from 'react-router-dom';
import { Mic, LayoutDashboard, BarChart3, ShieldAlert, Radio } from 'lucide-react';

const Sidebar: React.FC = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      isActive
        ? 'bg-emergency-red text-white shadow-md'
        : 'text-gray-700 hover:bg-beige-medium'
    }`;

  return (
    <div className="w-64 bg-beige-light border-r border-beige-dark h-screen flex flex-col fixed left-0 top-0 z-20">
      <div className="p-6 border-b border-beige-dark flex items-center gap-2">
        <ShieldAlert className="w-8 h-8 text-emergency-red" />
        <h1 className="font-bold text-xl text-emergency-darkerRed leading-none">
          SENTINEL<br/>
          <span className="text-xs text-gray-600 font-normal">RESPONSE SYSTEM</span>
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavLink to="/" className={linkClass}>
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/voice-agent" className={linkClass}>
          <Radio className="w-5 h-5" />
          <span>Voice Intake Agent</span>
        </NavLink>
        <NavLink to="/analytics" className={linkClass}>
          <BarChart3 className="w-5 h-5" />
          <span>Analytics</span>
        </NavLink>
      </nav>

      <div className="p-4 border-t border-beige-dark">
         <div className="bg-white/50 p-3 rounded text-xs text-gray-500">
            System Status: <span className="text-green-600 font-bold">Online</span>
            <br/>
            Region: <span className="font-mono">NY-METRO</span>
         </div>
      </div>
    </div>
  );
};

export default Sidebar;