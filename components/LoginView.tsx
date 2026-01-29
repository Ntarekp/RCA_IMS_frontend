import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { login, forgotPassword, LoginRequest } from '../api/services/authService';
import { ApiError } from '../api/client';

interface LoginViewProps {
  onLogin: (token: string, email: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  // Use import.meta.env.BASE_URL to correctly resolve the image path
  const logoPath = `${import.meta.env.BASE_URL}rca-logo.png`;
  const logoWebP = `${import.meta.env.BASE_URL}rca-logo.webp`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const loginRequest: LoginRequest = { email, password };
      const response = await login(loginRequest);
      
      // Store token in localStorage
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userEmail', response.email);
      localStorage.setItem('userRole', response.role);
      
      // Call onLogin callback with token and email
      onLogin(response.token, response.email);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Login failed:', err);
      }
      if (err instanceof ApiError) {
        if (err.status === 0) {
            setError('Network Error: Unable to connect to server. Please check your internet connection or contact support.');
        } else if (err.status === 401) {
            setError('Invalid email or password');
        } else {
            setError(err.data?.message || `Login failed: ${err.statusText}`);
        }
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await forgotPassword({ email: forgotPasswordEmail });
      setError('If an account with that email exists, a password reset link has been sent.');
    } catch (err) {
      setError('Failed to send password reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FD] flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full max-w-4xl animate-in fade-in zoom-in duration-500">
        
        {/* Logo Section (Left Side) */}
        <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
            <div className="w-48 h-48 flex items-center justify-center p-4">
                 <picture>
                   <source srcSet={logoWebP} type="image/webp" />
                   <img src={logoPath} alt="RCA Logo" className="w-full h-full object-contain" width="192" height="192" />
                 </picture>
            </div>
        </div>

        {/* Login Card (Right Side) */}
        <div className="bg-[#F7F8FD] rounded-2xl border border-[#E5E7EB] p-8 w-full max-w-md">
            {forgotPasswordMode ? (
                <>
                    <div className="text-left mb-8">
                        <h1 className="text-xl font-bold text-[#797A7C] uppercase tracking-wide">Reset Password</h1>
                        <p className="text-sm text-[#9CA3AF] mt-2 font-medium">Enter your email to receive a reset link</p>
                    </div>
                    <form onSubmit={handleForgotPassword} className="space-y-5">
                        <div className="space-y-1">
                            <input 
                                type="email" 
                                value={forgotPasswordEmail}
                                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                placeholder="Email" 
                                className="w-full px-4 py-3 bg-[#EDEEF3] border border-[#D1D5DB] rounded-xl text-sm outline-none transition-all placeholder:text-[#9CA3AF] text-slate-700"
                                required 
                            />
                        </div>
                        
                        {error && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-center mt-6">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-2/5 bg-[#1e293b] text-white py-3 rounded-[50px] font-medium text-sm hover:bg-[#334155] transition-all shadow-lg shadow-slate-900/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
                            </button>
                        </div>

                        <div className="text-center text-xs pt-1">
                            <button type="button" onClick={() => { setForgotPasswordMode(false); setError(null); }} className="text-[#1E293B] hover:text-[#334155] font-medium transition-colors">
                                Back to Login
                            </button>
                        </div>
                    </form>
                </>
            ) : (
                <>
                    <div className="text-left mb-8">
                        <h1 className="text-xl font-bold text-[#797A7C] uppercase tracking-wide">welcome Back</h1>
                        <p className="text-sm text-[#9CA3AF] mt-2 font-medium">Log into your account to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email" 
                                className="w-full px-4 py-3 bg-[#EDEEF3] border border-[#D1D5DB] rounded-xl text-sm outline-none transition-all placeholder:text-[#9CA3AF] text-slate-700"
                                required 
                            />
                        </div>
                        <div className="relative space-y-1">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password" 
                                className="w-full px-4 py-3 bg-[#EDEEF3] border border-[#D1D5DB] rounded-xl text-sm outline-none transition-all placeholder:text-[#9CA3AF] text-slate-700"
                                required 
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <div className="flex items-center justify-between text-xs pt-1">
                            <label className="flex items-center gap-2 text-[#9CA3AF] cursor-pointer hover:text-slate-700 select-none">
                                <input type="checkbox" className="rounded border-[#D1D5DB] text-[#1e293b] focus:ring-[#1e293b] w-3.5 h-3.5 bg-[#EDEEF3]" />
                                Remember me
                            </label>
                            <button type="button" onClick={() => { setForgotPasswordMode(true); setError(null); }} className="text-[#1E293B] hover:text-[#334155] font-medium transition-colors">
                                Forgot Password
                            </button>
                        </div>

                        <div className="flex justify-center mt-6">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-2/5 bg-[#1e293b] text-white py-3 rounded-[50px] font-medium text-sm hover:bg-[#334155] transition-all shadow-lg shadow-slate-900/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Login'}
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
      </div>
    </div>
  );
};