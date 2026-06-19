// frontend/src/layouts/DashboardLayout.jsx
import React from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { MessageSquare, BrainCircuit, Settings, LogOut } from 'lucide-react';

const DashboardLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Rip up the VIP Wristband
    localStorage.removeItem('token');
    // 2. Kick them back to the login screen
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-background text-textMain overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-surface border-r border-gray-800 flex flex-col">
        {/* App Branding */}
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <BrainCircuit className="h-6 w-6 text-primary mr-2" />
          <span className="text-lg font-bold tracking-wide">Human API</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button className="w-full flex items-center px-4 py-3 bg-primary/10 text-primary rounded-lg transition-colors">
            <MessageSquare className="h-5 w-5 mr-3" />
            <span className="font-medium">Conversations</span>
          </button>
          
          <button className="w-full flex items-center px-4 py-3 text-textMuted hover:bg-gray-800/50 hover:text-textMain rounded-lg transition-colors">
            <BrainCircuit className="h-5 w-5 mr-3" />
            <span className="font-medium">Memory Core</span>
          </button>

          <button className="w-full flex items-center px-4 py-3 text-textMuted hover:bg-gray-800/50 hover:text-textMain rounded-lg transition-colors">
            <Settings className="h-5 w-5 mr-3" />
            <span className="font-medium">Settings</span>
          </button>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative">
        {/* This <Outlet /> is magic. React Router uses it as a placeholder. 
          Whatever specific page we navigate to (like Settings or Chat) 
          will get injected right here!
        */}
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet /> 
        </div>
      </main>

    </div>
  );
};

export default DashboardLayout;