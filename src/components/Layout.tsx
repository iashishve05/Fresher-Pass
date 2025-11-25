import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, ShieldCheck, LogOut } from 'lucide-react';
import { isAdminLoggedIn, adminLogout } from '../services/mockBackend';
import Button from './ui/Button';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const loggedIn = isAdminLoggedIn();

  return (
    <div className="min-h-screen relative text-white font-sans selection:bg-accent-violet selection:text-white">
      {/* Cosmic Background */}
      <div className="fixed inset-0 z-[-2] bg-cosmic-900" />
      <div className="bg-noise" />
      
      {/* Animated Aurora Gradients */}
      <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] bg-accent-violet/20 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-accent-blue/20 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
      <div className="fixed top-[40%] left-[50%] transform -translate-x-1/2 w-[500px] h-[500px] bg-accent-pink/10 rounded-full blur-[100px] animate-pulse-slow delay-2000" />

      {/* Floating Navbar */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="glass-card rounded-full px-6 py-3 flex items-center justify-between w-full max-w-4xl shadow-2xl shadow-accent-violet/10">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-1.5 rounded-full bg-gradient-to-br from-accent-violet to-accent-blue group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl tracking-wide">
                SAARANG<span className="text-accent-cyan">FEST</span>
              </span>
            </Link>

            <div className="flex items-center gap-6">
              {!isAdmin && (
                <div className="flex items-center gap-3">
                  <Link to="/register" className="hidden md:inline-block">
                    <Button variant="solid">Register</Button>
                  </Link>
                  <Link to="/admin" className="text-sm font-medium text-gray-400 hover:text-white transition-colors relative group">
                    Admin
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-cyan transition-all group-hover:w-full"></span>
                  </Link>
                </div>
              )}
              {isAdmin && loggedIn && (
                 <button 
                  onClick={() => {
                    adminLogout();
                    window.location.href = '/admin';
                  }}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors bg-red-500/10 px-3 py-1.5 rounded-full"
                 >
                   <LogOut className="w-3 h-3" /> Logout
                 </button>
              )}
            </div>
        </nav>
      </div>

      <main className="pt-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-12 relative z-10">
        {children}
      </main>
      <footer className="mt-12 pb-8 text-center text-sm text-gray-400 relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <p>© {new Date().getFullYear()} AURORA FEST — Built with ❤️ for campus events</p>
          <p className="text-xs text-gray-500 mt-2">Made by the dev team • Demo project</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;