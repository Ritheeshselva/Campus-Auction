import React, { useState } from 'react';
import { AlertCircle, Gavel, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const accounts = [
  { label: 'Seller demo', email: 'seller@gmail.com', password: 'seller', role: 'Creates and manages auction listings' },
  { label: 'User demo', email: 'user@gmail.com', password: 'user', role: 'Browses auctions and places bids' }
];

const AuthPage = () => {
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const signIn = async (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
    setLoading(true);
    try {
      await login(account.email, account.password);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        await register({ name, email, password, role });
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to continue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
            <Gavel className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mt-4">CampusBid</h1>
          <p className="text-sm text-slate-500 mt-1">Simple auction demo</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900">
            {isRegistering ? 'Create an account' : 'Sign in to continue'}
          </h2>
          <p className="text-sm text-slate-500 mt-1 mb-5">
            {isRegistering ? 'Choose whether this account will sell or bid.' : 'Choose a demo role or enter its login details.'}
          </p>

          {!isRegistering && <div className="grid gap-3 mb-6">
            {accounts.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => signIn(account)}
                disabled={loading}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition disabled:opacity-60"
              >
                <div className="font-bold text-sm text-slate-900">{account.label}</div>
                <div className="text-xs text-slate-500">{account.email} · {account.role}</div>
              </button>
            ))}
          </div>}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {isRegistering && (
              <>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100"
                />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('user')}
                    className={`p-2.5 rounded-xl border text-sm font-semibold ${role === 'user' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
                  >
                    User
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('seller')}
                    className={`p-2.5 rounded-xl border text-sm font-semibold ${role === 'seller' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
                  >
                    Seller
                  </button>
                </div>
              </>
            )}
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isRegistering ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              {loading ? 'Please wait...' : isRegistering ? 'Register' : 'Sign in'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            className="w-full mt-4 text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            {isRegistering ? 'Already have an account? Sign in' : 'New here? Register an account'}
          </button>
        </div>
      </div>
    </main>
  );
};

export default AuthPage;
