import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { User, Bell, Shield, PaintBucket, Save, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ToggleButton = ({ active, onClick }) => (
  <div onClick={onClick} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${active ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-slate-700'}`}>
    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow transition-all ${active ? 'right-0.5' : 'left-0.5'}`}></div>
  </div>
);

export default function Settings() {
  const { darkMode, setDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  
  const [firstName, setFirstName] = useState("Ankur");
  const [lastName, setLastName] = useState("Rawat");
  const [email, setEmail] = useState("ankur@airecruiter.com");
  
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Manage your profile, preferences, and workspace settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
           <button 
             onClick={() => setActiveTab('profile')} 
             className={`w-full flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'profile' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
           >
             <User className="w-4 h-4 mr-2"/> Profile
           </button>
           <button 
             onClick={() => setActiveTab('notifications')} 
             className={`w-full flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'notifications' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
           >
             <Bell className="w-4 h-4 mr-2"/> Notifications
           </button>
           <button 
             onClick={() => setActiveTab('security')} 
             className={`w-full flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'security' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
           >
             <Shield className="w-4 h-4 mr-2"/> Security
           </button>
           <button 
             onClick={() => setActiveTab('appearance')} 
             className={`w-full flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'appearance' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
           >
             <PaintBucket className="w-4 h-4 mr-2"/> Appearance
           </button>
        </div>
        
        <div className="md:col-span-3 space-y-6">
          {activeTab === 'profile' && (
            <Card className="animate-in fade-in">
              <CardHeader className="border-b border-gray-50 dark:border-slate-700">
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                     <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm dark:text-white outline-none focus:border-indigo-500 transition-colors" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                     <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm dark:text-white outline-none focus:border-indigo-500 transition-colors" />
                   </div>
                 </div>
                 <div>
                     <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                     <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm dark:text-white outline-none focus:border-indigo-500 transition-colors" />
                 </div>
                 <div className="flex justify-end pt-4">
                   <button onClick={handleSave} className={`flex items-center px-5 py-2 text-white rounded-lg text-sm font-semibold shadow-sm transition-all ${savedSuccess ? 'bg-green-500' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                     {savedSuccess ? <><CheckCircle2 className="w-4 h-4 mr-2"/> Saved successfully!</> : <><Save className="w-4 h-4 mr-2"/> Save Changes</>}
                   </button>
                 </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="animate-in fade-in">
              <CardHeader className="border-b border-gray-50 dark:border-slate-700">
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Email Alerts</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Receive daily candidate summaries via email.</p>
                  </div>
                  <ToggleButton active={emailAlerts} onClick={() => setEmailAlerts(!emailAlerts)} />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">SMS Alerts</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Get immediate pings for candidates scoring &gt; 90%.</p>
                  </div>
                  <ToggleButton active={smsAlerts} onClick={() => setSmsAlerts(!smsAlerts)} />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="animate-in fade-in">
              <CardHeader className="border-b border-gray-50 dark:border-slate-700">
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700 pb-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Secure your recruiter account with 2FA.</p>
                  </div>
                  <ToggleButton active={twoFactor} onClick={() => setTwoFactor(!twoFactor)} />
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Change Password</h4>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                    <input type="password" placeholder="********" className="w-full max-w-sm p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm dark:text-white outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                    <input type="password" placeholder="********" className="w-full max-w-sm p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm dark:text-white outline-none focus:border-indigo-500" />
                  </div>
                  <button onClick={handleSave} className={`px-5 py-2 text-white rounded-lg text-sm font-semibold shadow-sm transition-all ${savedSuccess ? 'bg-green-500' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                    {savedSuccess ? 'Updated successfully!' : 'Update Password'}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card className="animate-in fade-in">
              <CardHeader className="border-b border-gray-50 dark:border-slate-700">
                <CardTitle>Appearance</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                 <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-slate-700 rounded-xl">
                   <div>
                     <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Dark Mode</h4>
                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Toggle between Light and Dark workspace themes.</p>
                     <p className="text-[10px] text-indigo-500 mt-1 italic">Tip: This syncs with the Sun/Moon icon in the top navbar.</p>
                   </div>
                   <ToggleButton active={darkMode} onClick={() => setDarkMode(!darkMode)} />
                 </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
