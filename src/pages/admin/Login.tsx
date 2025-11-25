
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Loader2, KeyRound } from 'lucide-react';
import { adminLogin } from '../../services/mockBackend';
import { useToast } from '../../components/ui/Toast';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [creds, setCreds] = useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await adminLogin(creds.email, creds.password);
      if (success) {
        addToast('success', 'Welcome back, Admin');
        navigate('/admin/dashboard');
      } else {
        addToast('error', 'Invalid credentials');
      }
    } catch (e) {
      addToast('error', 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="glass-card p-10 rounded-3xl w-full max-w-md shadow-2xl shadow-black/50">
        <div className="text-center mb-10">
          <div className="bg-gradient-to-tr from-white/10 to-transparent w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white border border-white/10">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="font-display text-3xl font-bold">Command Center</h2>
          <p className="text-gray-400 mt-2">Authenticate to access admin controls</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs text-gray-500 uppercase font-bold tracking-wider ml-1">Admin Email</label>
            <input
              type="email"
              value={creds.email}
              onChange={(e) => setCreds({ ...creds, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl input-modern text-white"
              placeholder="admin@college.edu"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-gray-500 uppercase font-bold tracking-wider ml-1">Secure Password</label>
            <input
              type="password"
              value={creds.password}
              onChange={(e) => setCreds({ ...creds, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl input-modern text-white"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-black font-bold rounded-xl mt-6 hover:bg-gray-200 transition-colors flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><KeyRound className="w-4 h-4" /> Authenticate</>}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-600 bg-white/5 inline-block px-3 py-1 rounded-full">Demo: admin@college.edu / admin123</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;