import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, LogOut, CheckSquare, Bell, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const timeoutRef = useRef(null);

  const clearDelayTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    clearDelayTimeout();
    setIsMenuOpen(true);
  };

  const handleMouseLeave = () => {
    clearDelayTimeout();
    // Keep the dropdown open for at least 5 seconds on mouse leave
    timeoutRef.current = setTimeout(() => {
      setIsMenuOpen(false);
    }, 5000);
  };

  const handleMenuMouseEnter = () => {
    clearDelayTimeout();
  };

  const handleMenuMouseLeave = () => {
    handleMouseLeave();
  };

  const handleProfileClick = (e) => {
    // Prevent toggle if clicking specifically on the bell button
    if (e.target.closest('.bell-btn')) {
      return;
    }
    clearDelayTimeout();
    setIsMenuOpen((prev) => !prev);
  };

  const handleLogout = (e) => {
    e.stopPropagation();
    clearDelayTimeout();
    setIsMenuOpen(false);
    logout();
    navigate('/');
  };

  const handleSwitchAccount = (e) => {
    e.stopPropagation();
    clearDelayTimeout();
    setIsMenuOpen(false);
    logout(); // Logging out enables logging into a different account
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

  // Clean up timeout on unmount
  useEffect(() => {
    return () => clearDelayTimeout();
  }, []);

  return (
    <div className="w-64 bg-mic-navy text-white flex flex-col h-screen fixed left-0 top-0 border-r border-[#2d4a63]">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-[#2d4a63]">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight">
          MIC <span className="text-mic-red">College</span>
        </h1>
        <p className="text-xs text-mic-gray uppercase tracking-widest mt-1 font-semibold">OBE Portal</p>
      </div>

      {/* Redesigned Profile Section */}
      <div 
        className="p-4 border-b border-[#2d4a63] flex flex-col hover:bg-mic-navy-light/30 transition-colors duration-300 cursor-pointer select-none relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleProfileClick}
      >
        <div className="flex items-center justify-between w-full gap-3">
          {/* Notifications Bell */}
          <button 
            type="button"
            className="bell-btn p-1.5 hover:bg-mic-navy-light/60 rounded-full transition-colors duration-200 cursor-pointer relative shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              alert('Notification panel coming soon!');
            }}
          >
            <Bell size={18} className="text-slate-200 hover:text-white" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-mic-red rounded-full ring-1 ring-mic-navy"></span>
          </button>

          {/* User Info */}
          <div className="flex-1 min-w-0 text-center">
            <div className="font-semibold text-sm text-white truncate leading-snug">
              {user?.name || 'User'}
            </div>
            <div className="text-[10px] text-sky-400 font-bold uppercase tracking-wider mt-0.5">
              {role || 'Role'}
            </div>
          </div>

          {/* Avatar (Dark Badge) */}
          <div className="w-9 h-9 rounded-full bg-[#0f2332] border border-[#2d4a63] flex items-center justify-center font-bold text-sm text-white shadow-inner shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>

        {/* Hover-reveal Options Menu with 5-second persistence */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden w-full flex flex-col gap-1 mt-2 bg-[#122432]/80 backdrop-blur-md rounded-lg p-1.5 border border-[#2d4a63]/40 shadow-xl"
              onMouseEnter={handleMenuMouseEnter}
              onMouseLeave={handleMenuMouseLeave}
            >
              <button 
                type="button"
                onClick={handleSwitchAccount}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold text-sky-400 hover:bg-sky-500/10 transition-colors cursor-pointer text-left"
              >
                <RefreshCw size={14} className="shrink-0" />
                Switch Account
              </button>
              <button 
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold text-mic-red hover:bg-mic-red/10 transition-colors cursor-pointer text-left"
              >
                <LogOut size={14} className="shrink-0" />
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation items */}
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
    </div>
  );
}
