import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileCheck, Settings, HelpCircle, 
  Bell, Search as SearchIcon, Menu, Box, LogOut, User, Loader2,
  Mail, Phone, Shield, Building, Moon, Sun, Star, MessageSquare, ChevronRight
} from 'lucide-react';
import { useCandidates } from '../context/CandidateContext';
import { useTheme } from '../context/ThemeContext';

const ACCOUNTS = [
  { id: 1, name: 'Ankur Rawat', email: 'ankur@airecruiter.com', role: 'Talent Partner', avatar: 'https://i.pravatar.cc/150?img=11' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@airecruiter.com', role: 'Senior Recruiter', avatar: 'https://i.pravatar.cc/150?img=47' }
];

export default function MainLayout() {
  const location = useLocation();
  const { getShortlisted } = useCandidates();
  const { darkMode, setDarkMode } = useTheme();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null); 
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeModal, setActiveModal] = useState(null); 
  
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfileMenu(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      setIsSearching(true);
      setTimeout(() => { setIsSearching(false); setSearchQuery(''); }, 800);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Candidates', path: '/candidates', icon: Users },
    { name: 'Assessments', path: '/assessments', icon: FileCheck },
    { name: 'Shortlist', path: '/shortlist', icon: Star, badge: getShortlisted().length },
    { name: 'AI Interview', path: '/ai-interview', icon: MessageSquare },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 font-sans text-sm overflow-hidden relative transition-colors">
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col z-20 shrink-0 transition-all duration-300 ease-in-out`}>
        <div className="h-16 flex items-center justify-center md:justify-start px-5 border-b border-gray-100 dark:border-slate-700 shrink-0">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm shadow-indigo-200 shrink-0 hover:scale-105 transition-transform cursor-pointer">
            <Box className="w-5 h-5 text-white" />
          </div>
          {isSidebarOpen && <span className="text-xl font-bold text-gray-900 dark:text-white ml-3 whitespace-nowrap animate-in fade-in duration-300">AI Recruiter</span>}
        </div>
        
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.name} to={item.path} title={!isSidebarOpen ? item.name : ''}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
              >
                <div className="flex items-center">
                  <Icon className={`w-5 h-5 shrink-0 ${isSidebarOpen ? 'mr-3' : 'mx-auto'} ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 group-hover:text-indigo-500'} transition-colors`} />
                  {isSidebarOpen && <span className="whitespace-nowrap">{item.name}</span>}
                </div>
                {isSidebarOpen && item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 py-0.5 px-2 rounded-full text-[10px] font-bold">{item.badge}</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-4 lg:px-8 shrink-0 transition-all z-10">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-xl text-gray-500 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mr-2 lg:mr-6">
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative w-48 sm:w-64 lg:w-[400px] group hidden sm:block">
              {isSearching ? (
                <Loader2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500 animate-spin" />
              ) : (
                <SearchIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 transition-colors" />
              )}
              <input 
                type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch}
                placeholder="Search candidates, skills..." 
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3 lg:space-x-5">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              {darkMode ? <Sun className="w-5 h-5 text-yellow-500"/> : <Moon className="w-5 h-5"/>}
            </button>

            {currentUser ? (
              <>
                <div className="relative" ref={notifRef}>
                  <button onClick={() => setShowNotifications(!showNotifications)} className={`relative p-2.5 rounded-xl transition-all ${showNotifications ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                    <Bell className="w-5 h-5" />
                    <div className="absolute top-2 right-2.5 w-2 h-2 bg-indigo-600 border-2 border-white dark:border-slate-800 rounded-full"></div>
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 z-50 animate-in fade-in slide-in-from-top-2 py-2">
                      <div className="px-4 py-2 border-b border-gray-50 dark:border-slate-700 flex justify-between items-center">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Messages & Alerts</h4>
                        <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full">1 New</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        <div onClick={() => setActiveModal('message')} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer bg-indigo-50/30 dark:bg-indigo-900/20">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white flex items-center"><Mail className="w-3 h-3 mr-1.5 text-indigo-500"/> New Candidate Message</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">Alex Morgan: "Hi, I have a question regarding the interview..."</p>
                          <p className="text-[9px] text-gray-400 mt-1">1h ago</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="relative" ref={profileRef}>
                  <div onClick={() => setShowProfileMenu(!showProfileMenu)} className={`flex items-center cursor-pointer p-1.5 pr-3 rounded-xl border transition-all duration-200 ${showProfileMenu ? 'border-indigo-200 dark:border-slate-600 bg-indigo-50/50 dark:bg-slate-700' : 'border-transparent hover:border-gray-200 dark:hover:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                    <img src={currentUser.avatar} alt="Profile" className="w-9 h-9 rounded-full mr-0 lg:mr-3 object-cover border-2 border-white dark:border-slate-800 shadow-sm" />
                    <div className="hidden lg:block">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">{currentUser.name}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 font-medium">{currentUser.role}</p>
                    </div>
                  </div>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 z-50 animate-in fade-in slide-in-from-top-2 py-2">
                      <div className="px-4 py-3 border-b border-gray-50 dark:border-slate-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{currentUser.email}</p>
                      </div>
                      <div className="border-t border-gray-50 dark:border-slate-700 py-1 mt-1">
                        <button onClick={() => { setCurrentUser(null); setShowProfileMenu(false); }} className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium">
                          <LogOut className="w-4 h-4 mr-3 text-red-500" /> Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button className="flex items-center px-5 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 text-sm font-semibold rounded-xl cursor-not-allowed">
                <Shield className="w-4 h-4 mr-2" /> Locked
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-[#f8fafc] dark:bg-slate-900 p-4 lg:p-6 relative">
          {currentUser ? (
             <Outlet /> 
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/80 dark:bg-slate-900/90 backdrop-blur-sm animate-in fade-in z-50">
               <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200 dark:shadow-none">
                  <Box className="w-8 h-8 text-white" />
               </div>
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to AI Recruiter</h2>
               <p className="text-gray-500 dark:text-gray-400 mb-8">Select an account to access your workspace.</p>
               
               <div className="w-full max-w-md space-y-3">
                 {ACCOUNTS.map(acc => (
                   <div 
                    key={acc.id} 
                    onClick={() => setCurrentUser(acc)}
                    className="flex items-center p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all group"
                   >
                     <img src={acc.avatar} alt={acc.name} className="w-12 h-12 rounded-full mr-4 border border-gray-100 dark:border-slate-600 group-hover:scale-105 transition-transform" />
                     <div className="flex-1">
                       <h3 className="font-semibold text-gray-900 dark:text-white">{acc.name}</h3>
                       <p className="text-xs text-gray-500 dark:text-gray-400">{acc.role}</p>
                     </div>
                     <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition-colors" />
                   </div>
                 ))}
               </div>
            </div>
          )}
        </main>
      </div>

      {activeModal === 'message' && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg p-6 border border-gray-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-slate-700 pb-4">
              <div className="flex items-center">
                <img src="https://i.pravatar.cc/150?img=33" alt="Candidate" className="w-10 h-10 rounded-full mr-3" />
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">Alex Morgan</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Candidate - Data Scientist</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">X</button>
            </div>
            
            <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-xl mb-4 text-sm text-gray-700 dark:text-gray-300">
              "Hi, thank you for shortlisting my profile. Could you please let me know the tentative dates for the AI interview round?"
            </div>
            
            <textarea className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 mb-4" rows="3" placeholder="Type your reply here..."></textarea>
            
            <div className="flex justify-end gap-3">
              <button onClick={() => setActiveModal(null)} className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm">Send Reply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
