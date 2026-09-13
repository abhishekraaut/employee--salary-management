import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Building2, ShieldCheck, Sparkles, Users, BarChart3 } from 'lucide-react';
import { useLoginMutation } from './authApi';
import { setCredentials } from './authSlice';
import { getApiErrorMessage } from '../../shared/api/axiosBaseQuery';

export function Login() {
  const [email, setEmail] = useState('abhishek.hr@abhitech.com');
  const [password, setPassword] = useState('abhi@123');
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login({ email, password }).unwrap();
      dispatch(setCredentials({ user: result.data.user, token: result.data.token }));
      navigate('/dashboard');
    } catch {
      // RTK Query exposes the normalized error through `error`.
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.2),transparent_30%),linear-gradient(135deg,#f8fbff_0%,#eef4ff_50%,#f8fafc_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:grid-cols-[1.2fr_0.8fr]">
        <div className="relative hidden overflow-hidden bg-slate-950 p-8 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.45),transparent_35%),linear-gradient(135deg,#020817_0%,#111827_55%,#0f172a_100%)]" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-xl font-bold text-white shadow-lg shadow-blue-500/30">
                A
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.32em] text-slate-300">ACME</p>
                <p className="text-xl font-semibold">HR Operations</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 space-y-8">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.26em] text-blue-300">Corporate workforce platform</p>
              <h1 className="mt-4 max-w-md text-4xl font-semibold leading-tight text-white">
                Manage compensation with confidence and clarity.
              </h1>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <Users className="h-6 w-6 text-blue-300" />
                <p className="mt-4 text-2xl font-semibold text-white">10K</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-300">Employees</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <BarChart3 className="h-6 w-6 text-emerald-300" />
                <p className="mt-4 text-2xl font-semibold text-white">24/7</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-300">Insights</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <ShieldCheck className="h-6 w-6 text-violet-300" />
                <p className="mt-4 text-2xl font-semibold text-white">99.9%</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-300">Audit ready</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <Sparkles className="h-5 w-5 text-cyan-300" />
            <span className="text-sm text-slate-200">Built for modern HR teams and executive reporting.</span>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 lg:mx-0">
                <Building2 className="h-7 w-7" />
              </div>
              <h2 className="mt-6 text-3xl font-semibold text-slate-900">Welcome back</h2>
              <p className="mt-2 text-sm text-slate-500">
                Sign in to continue managing employee compensation and analytics.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {getApiErrorMessage(error, 'Failed to login')}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:translate-y-[-1px] hover:shadow-xl hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
