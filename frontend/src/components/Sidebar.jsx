import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Settings, LogOut, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNavItems = () => {
    const base = [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' }];
    
    if (role === 'faculty') {
      base.push({ id: 'marks', label: 'Enter Marks', icon: FileText, path: '/dashboard/marks' });
    } else if (role === 'coordinator') {
      base.push({ id: 'verify', label: 'Verify Marks', icon: CheckSquare, path: '/dashboard/verify' });
    } else if (role === 'management' || role === 'hod') {
      base.push({ id: 'reports', label: 'Reports', icon: FileText, path: '/dashboard/reports' });
    }
    
    return base;
  };

  return (
    <div className="w-64 bg-mic-navy text-white flex flex-col h-screen fixed left-0 top-0 border-r border-[#2d4a63]">
      <div className="p-6 border-b border-[#2d4a63]">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight">
          MIC <span className="text-mic-red">College</span>
        </h1>
        <p className="text-xs text-mic-gray uppercase tracking-widest mt-1 font-semibold">OBE Portal</p>
      </div>

      <div className="p-6 border-b border-[#2d4a63] flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-mic-red flex items-center justify-center font-bold text-lg">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div>
          <div className="font-semibold text-sm">{user?.name || 'User'}</div>
          <div className="text-xs text-mic-gray capitalize">{role || 'Role'}</div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-1 overflow-y-auto">
        {getNavItems().map(item => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-mic-red text-white shadow-md shadow-mic-red/20' 
                  : 'text-slate-300 hover:bg-mic-navy-light hover:text-white'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-[#2d4a63]">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-semibold border border-mic-gray/40 text-slate-200 hover:bg-mic-navy-light hover:text-white transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}
