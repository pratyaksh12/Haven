'use client';

import { 
  HardDrive, Folder, Lock, Star, Trash2, 
  Search, Plus, LayoutGrid, Shield 
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LogOut } from 'lucide-react';

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black flex text-gray-100 font-sans selection:bg-blue-500/30">
      
      <aside className="w-64 border-r border-white/5 backdrop-blur-xl flex flex-col fixed h-full bg-slate-950/40 z-20 md:flex">
        
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-white/5">
           <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 ring-1 ring-white/10 group cursor-pointer hover:scale-105 transition-transform">
             <Shield className="w-5 h-5 group-hover:animate-pulse" strokeWidth={2.5} />
           </div>
           <span className="ml-4 font-bold text-xl tracking-tight bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">Haven</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <NavItem icon={<HardDrive size={18} />} label="All Files" href="/vault" active={pathname === '/vault'} />
          <NavItem icon={<Folder size={18} />} label="Folders" href="/vault/folders" />
          <NavItem icon={<Lock size={18} />} label="Encrypted" href="/vault/encrypted" />
          <NavItem icon={<Star size={18} />} label="Starred" href="/vault/starred" />
          <div className="pt-4 mt-4 border-t border-white/5">
            <NavItem icon={<Trash2 size={18} />} label="Trash" href="/vault/trash" />
          </div>
        </nav>

        <div className="p-6 border-t border-white/5 bg-linear-to-b from-transparent to-black/20">
          <div className="flex justify-between text-xs mb-3 font-medium">
            <span className="text-gray-400">Storage Used</span>
            <span className="text-gray-200">7.2 GB / 10 GB</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-linear-to-r from-blue-500 to-cyan-400 w-[72%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          </div>
          <p className="text-[10px] text-gray-500 mt-2.5 font-medium">Auto-encryption active</p>
        </div>
      </aside>

      <main className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen relative">
        
        
        <header className="h-20 border-b border-white/5 sticky top-0 z-10 px-8 flex items-center justify-between bg-slate-950/70 backdrop-blur-2xl">
          
          
          <div className="flex items-center text-sm gap-2.5">
             <Link href="/vault" className="text-gray-400 hover:text-white transition-colors font-medium">Home</Link>
             <span className="text-gray-700">/</span>
             <span className="text-gray-100 font-semibold bg-white/5 px-3 py-1 rounded-full border border-white/5">Documents</span>
          </div>

          
          <div className="flex items-center gap-4">
             <div className="relative group hidden sm:block">
               <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search files..." 
                 className="bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 w-64 transition-all placeholder:text-gray-600 hover:bg-black/30 text-gray-200"
               />
             </div>

             <div className="h-6 w-px bg-white/10 mx-1" />

             <button className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all active:scale-95">
               <LayoutGrid size={20} />
             </button>
             
             <button 
               onClick={logout}
               className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 border border-red-500/20 transition-all active:scale-95"
             >
               <LogOut size={18} />
               <span>Log Out</span>
             </button>

             <button className="ml-2 w-9 h-9 rounded-full bg-linear-to-br from-purple-500 to-pink-500 border-2 border-slate-900 ring-2 ring-white/5 shadow-lg" />
          </div>
        </header>

        
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, href, active }: any) {
  return (
    <Link 
      href={href} 
      className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 relative overflow-hidden ${
        active 
          ? 'text-blue-400 bg-blue-500/10 ring-1 ring-blue-500/20' 
          : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
      }`}
    >
      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />}
      <span className="relative z-10 transition-transform group-hover:scale-110 duration-200">{icon}</span>
      <span className="relative z-10">{label}</span>
    </Link>
  );
}