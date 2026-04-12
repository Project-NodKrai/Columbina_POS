import React from 'react';
import { useAuth } from '../AuthContext';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { LogIn, LogOut, Store as StoreIcon, LayoutDashboard, ShoppingCart, Package, BarChart3, User, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export function Navbar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  const { user, store } = useAuth();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <StoreIcon className="w-6 h-6 text-white" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">NodKrai POS</span>
            </div>

            {user && store && (
              <div className="hidden md:flex items-center gap-1">
                <NavButton 
                  active={activeTab === 'dashboard'} 
                  onClick={() => setActiveTab('dashboard')}
                  icon={<LayoutDashboard className="w-4 h-4" />}
                  label="대시보드"
                />
                <NavButton 
                  active={activeTab === 'pos-seller'} 
                  onClick={() => setActiveTab('pos-seller')}
                  icon={<ShoppingCart className="w-4 h-4" />}
                  label="판매자 POS"
                />
                <NavButton 
                  active={activeTab === 'pos-kiosk'} 
                  onClick={() => setActiveTab('pos-kiosk')}
                  icon={<User className="w-4 h-4" />}
                  label="키오스크"
                />
                <NavButton 
                  active={activeTab === 'inventory'} 
                  onClick={() => setActiveTab('inventory')}
                  icon={<Package className="w-4 h-4" />}
                  label="재고관리"
                />
                <NavButton 
                  active={activeTab === 'settings'} 
                  onClick={() => setActiveTab('settings')}
                  icon={<SettingsIcon className="w-4 h-4" />}
                  label="설정"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">{user.displayName}</p>
                  <p className="text-xs text-slate-500">{store?.name || '매장 미등록'}</p>
                </div>
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                로그인
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
        active 
          ? "bg-indigo-50 text-indigo-700" 
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
