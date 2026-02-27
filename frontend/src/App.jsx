import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import logo from './assets/logo.png';
import { authApi, statsApi } from './utils/api';
import SuratMasukPage from './pages/SuratMasukPage';
import SuratKeluarPage from './pages/SuratKeluarPage';
import DisposisiPage from './pages/DisposisiPage';
import DashboardHomePage from './pages/DashboardHomePage';
import { Sidebar } from './components/Sidebar';

const APP_TITLE = 'SIKESULIN - TP PKK Kelurahan Sungai Ulin';

function useAuth() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('sikesulin_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (userData) => {
    localStorage.setItem('sikesulin_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('sikesulin_user');
    setUser(null);
  };

  return { user, login, logout };
}

function App() {
  const { user, login, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    document.title = APP_TITLE;
  }, []);

  return (
    <div className="min-h-screen bg-pkk-primary-soft">
      <Routes>
        <Route path="/login" element={<LoginPage isAuthenticated={!!user} onLogin={login} />} />
        <Route
          path="/dashboard/*"
          element={
            <RequireAuth isAuthenticated={!!user}>
              <DashboardLayout user={user} onLogout={logout} />
            </RequireAuth>
          }
        />
        <Route
          path="*"
          element={
            user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" state={{ from: location }} replace />
          }
        />
      </Routes>
    </div>
  );
}

function RequireAuth({ isAuthenticated, children }) {
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function LoginPage({ isAuthenticated, onLogin }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    suratMasukBulanIni: 0,
    suratKeluarBulanIni: 0,
    disposisiAktif: 0,
    penggunaAktif: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      setStatsLoading(true);
      try {
        const data = await statsApi.summary();
        if (!cancelled && data) {
          setStats({
            suratMasukBulanIni: data.suratMasukBulanIni ?? 0,
            suratKeluarBulanIni: data.suratKeluarBulanIni ?? 0,
            disposisiAktif: data.disposisiAktif ?? 0,
            penggunaAktif: data.penggunaAktif ?? 0,
          });
        }
      } catch (err) {
        // tidak perlu tampilkan error di UI login, hanya log
        console.error('Gagal memuat statistik', err);
      } finally {
        if (!cancelled) {
          setStatsLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authApi.login(username, password);
      if (!data?.user) {
        throw new Error('Respon server tidak sesuai.');
      }
      onLogin(data.user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-5xl grid-cols-1 gap-8 rounded-3xl bg-white/90 p-8 shadow-2xl shadow-teal-200 backdrop-blur-md md:grid-cols-2 md:p-10">
        <div className="flex flex-col justify-between space-y-6">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Logo TP PKK" className="h-16 w-16 rounded-full border-4 border-pkk-primary bg-white object-contain p-1" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-pkk-primary-dark">
                TP PKK Kelurahan Sungai Ulin
              </p>
              <h1 className="mt-1 text-2xl font-extrabold uppercase text-slate-800">
                SIKESULIN
              </h1>
              <p className="text-xs font-medium text-slate-500">
                Sistem Surat Masuk, Surat Keluar &amp; Disposisi
              </p>
            </div>
          </div>

          <div className="hidden md:block">
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              Selamat datang di Dashboard PKK
            </p>
            <p className="mt-3 text-sm text-slate-600">
              Kelola surat masuk, surat keluar, dan disposisi kelurahan dengan lebih
              rapi dan terstruktur.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
              <StatCard
                label="Surat Masuk / bln ini"
                value={statsLoading ? '...' : stats.suratMasukBulanIni}
              />
              <StatCard
                label="Surat Keluar / bln ini"
                value={statsLoading ? '...' : stats.suratKeluarBulanIni}
              />
              <StatCard
                label="Disposisi Aktif"
                value={statsLoading ? '...' : stats.disposisiAktif}
              />
              <StatCard
                label="Pengguna Aktif"
                value={statsLoading ? '...' : stats.penggunaAktif}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <form
            onSubmit={handleSubmit}
            className="w-full space-y-6 rounded-2xl bg-slate-50/80 p-6 shadow-inner shadow-teal-100"
          >
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Masuk ke SIKESULIN
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Gunakan akun admin atau operator untuk mengelola data surat.
              </p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <label htmlFor="username" className="block text-xs font-semibold text-slate-700">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-teal-100 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none ring-0 transition focus:border-pkk-primary focus:shadow-md focus:shadow-teal-100"
                  placeholder="contoh: admin"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-teal-100 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-pkk-primary focus:shadow-md focus:shadow-teal-100"
                  placeholder="contoh: admin123"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700 shadow-sm shadow-red-100">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-pkk-primary px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-teal-200 transition hover:bg-pkk-primary-dark hover:shadow-xl hover:shadow-teal-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-teal-100 bg-white/90 p-3 shadow-sm shadow-teal-50">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-pkk-primary-dark">{value}</p>
    </div>
  );
}

function DashboardLayout({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname.replace('/dashboard', '') || '/';

  const handleLogout = () => {
    onLogout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} currentPath={currentPath} onLogout={handleLogout} />

      <div className="flex min-h-screen flex-1 flex-col bg-slate-50/70">
        <header className="flex items-center justify-between border-b border-teal-100/70 bg-white/90 px-4 py-3 shadow-sm shadow-teal-50 md:px-6">
          <div className="flex items-center gap-3 md:hidden">
            <img
              src={logo}
              alt="Logo TP PKK"
              className="h-8 w-8 rounded-full border border-pkk-primary bg-white object-contain p-0.5"
            />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-pkk-primary-dark">
                TP PKK Sungai Ulin
              </p>
              <p className="text-xs font-bold uppercase text-slate-800">
                SIKESULIN
              </p>
            </div>
          </div>
          <div className="hidden text-sm font-semibold text-slate-700 md:block">
            Dashboard Administrasi PKK
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="hidden text-right md:block">
              <p className="font-semibold text-slate-700">
                {user?.nama_lengkap || 'Pengguna'}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">
                {user?.role || 'admin'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-full bg-pkk-primary px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-teal-300 transition hover:bg-pkk-primary-dark hover:shadow-md"
            >
              Keluar
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-4 md:px-6 md:py-6">
          <Routes>
            <Route index element={<DashboardHomePage />} />
            <Route path="surat-masuk" element={<SuratMasukPage />} />
            <Route path="surat-keluar" element={<SuratKeluarPage />} />
            <Route path="disposisi" element={<DisposisiPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

 

export default App;

