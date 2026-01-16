import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, Lock, ArrowLeft } from 'lucide-react';
import { resetPassword } from '../api/services/authService';
import { ApiError } from '../api/client';

interface ResetPasswordViewProps {
  token: string;
  onSuccess: () => void;
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({ token, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Ensure token is valid
  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (newPassword !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
    }

    if (newPassword.length < 8) {
        setError("Password must be at least 8 characters long");
        setLoading(false);
        return;
    }

    try {
      await resetPassword({
          token,
          newPassword,
          confirmPassword
      });
      setSuccess(true);
      setTimeout(() => {
          onSuccess(); // Redirect to login
      }, 3000);
    } catch (err) {
      console.error('Reset password failed:', err);
      if (err instanceof ApiError) {
        setError(err.data?.message || `Failed to reset password: ${err.statusText}`);
      } else {
        setError('Failed to reset password. The link may be expired.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
      return (
        <div className="min-h-screen bg-[#F7F8FD] flex items-center justify-center p-4">
            <div className="bg-[#F7F8FD] p-8 rounded-2xl border border-[#E5E7EB] max-w-md w-full text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Password Reset Successful</h2>
                <p className="text-slate-500 mb-6">Your password has been updated. You will be redirected to the login page shortly.</p>
                <button 
                    onClick={onSuccess}
                    className="w-full bg-[#28375B] text-white py-3 rounded-xl font-medium hover:bg-[#1e2a45] transition-colors"
                >
                    Go to Login
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FD] flex items-center justify-center p-4">
      <div className="bg-[#F7F8FD] p-8 rounded-2xl border border-[#E5E7EB] max-w-md w-full">
        <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-[#28375B]">
                <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">Set New Password</h1>
            <p className="text-sm text-slate-500 mt-2">Please enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">New Password</label>
                <input 
                    type={showPassword ? "text" : "password"} 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full px-4 py-3 bg-[#EDEEF3] border border-[#D1D5DB] rounded-xl text-sm outline-none focus:border-[#28375B] focus:ring-2 focus:ring-[#28375B]/20 transition-all text-slate-700"
                    required 
                />
                <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
                >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Confirm Password</label>
                <input 
                    type={showPassword ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full px-4 py-3 bg-[#EDEEF3] border border-[#D1D5DB] rounded-xl text-sm outline-none focus:border-[#28375B] focus:ring-2 focus:ring-[#28375B]/20 transition-all text-slate-700"
                    required 
                />
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}

            <button 
                type="submit" 
                disabled={loading || !token}
                className="w-full bg-[#28375B] text-white py-3 rounded-xl font-medium text-sm hover:bg-[#1e2a45] transition-all shadow-lg shadow-slate-900/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset Password'}
            </button>

            <div className="text-center pt-2">
                <button 
                    type="button"
                    onClick={onSuccess}
                    className="text-sm text-slate-500 hover:text-[#28375B] font-medium flex items-center justify-center gap-1 mx-auto transition-colors"
                >
                    <ArrowLeft className="w-3 h-3" />
                    Back to Login
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};
