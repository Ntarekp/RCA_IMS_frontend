import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginViewProps {
  onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call authentication
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-8 w-full max-w-md animate-in fade-in zoom-in duration-500">
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-24 bg-[#1e293b] rounded-b-[3rem] rounded-t-lg flex items-center justify-center shadow-xl relative overflow-hidden group">
                 <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <Shield className="w-10 h-10 text-white relative z-10" strokeWidth={1.5} />
            </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 w-full">
            <div className="text-center mb-8">
                <h1 className="text-xl font-bold text-slate-800 uppercase tracking-wide">RCA Stock Management System</h1>
                <p className="text-sm text-slate-400 mt-2 font-medium">Log into your Account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1e293b]/20 focus:border-[#1e293b] transition-all placeholder:text-slate-400 text-slate-700"
                        required 
                    />
                </div>
                <div className="relative space-y-1">
                    <input 
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1e293b]/20 focus:border-[#1e293b] transition-all placeholder:text-slate-400 text-slate-700"
                        required 
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 text-slate-500 cursor-pointer hover:text-slate-700 select-none">
                        <input type="checkbox" className="rounded border-slate-300 text-[#1e293b] focus:ring-[#1e293b] w-3.5 h-3.5" />
                        Remember me
                    </label>
                    <button type="button" className="text-slate-500 hover:text-[#1e293b] font-medium transition-colors">
                        Forgot Password
                    </button>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-[#1e293b] text-white py-3 rounded-xl font-medium text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Login'}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};