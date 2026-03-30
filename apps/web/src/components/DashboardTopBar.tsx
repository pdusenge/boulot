'use client';

import { Search, Bell, ChevronDown, Globe } from 'lucide-react';
import { getUser } from '../lib/auth';
import { useEffect, useState } from 'react';
import { IUser } from '@boulot/types';
import { getStoredLocale, setStoredLocale, Locale } from '../lib/i18n';

export default function DashboardTopBar() {
  const [user, setUser] = useState<IUser | null>(null);
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    setUser(getUser());
    setLocale(getStoredLocale());
  }, []);

  const toggleLocale = () => {
    const next: Locale = locale === 'en' ? 'rw' : 'en';
    setStoredLocale(next);
    setLocale(next);
    window.location.reload();
  };

  return (
    <div className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-40">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search projects, messages, or files..."
            className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-6 focus:ring-2 ring-black transition-all outline-none font-medium text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={toggleLocale}
          className="flex items-center gap-2 px-3 py-2 rounded-2xl hover:bg-gray-50 text-gray-500 transition-all text-xs font-bold uppercase tracking-widest"
          title={locale === 'en' ? 'Switch to Kinyarwanda' : 'Switch to English'}
        >
          <Globe size={16} />
          {locale === 'en' ? 'EN' : 'RW'}
        </button>

        <button className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-gray-50 text-gray-400 relative">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full border-2 border-white" />
        </button>
        
        <div className="h-10 w-[1px] bg-gray-100" />
        
        <button className="flex items-center gap-3 hover:bg-gray-50 p-1 rounded-2xl transition-all">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-black">{user?.firstName} {user?.lastName}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user?.role}</p>
          </div>
          <div className="w-10 h-10 bg-muted flex items-center justify-center rounded-2xl relative overflow-hidden group">
            <div className="w-full h-full bg-black/5 flex items-center justify-center text-gray-400 font-bold group-hover:scale-105 transition-transform">
                {user?.firstName?.charAt(0)}
            </div>
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
}
