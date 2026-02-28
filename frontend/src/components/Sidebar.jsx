import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

function SidebarLink({ to, active, label, onAfterNavigate }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(to);
    onAfterNavigate?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition ${
        active
          ? 'bg-teal-100/90 text-slate-900 shadow-sm shadow-teal-200'
          : 'text-teal-100/90 hover:bg-teal-800/60'
      }`}
    >
      <span>{label}</span>
      {active && <span className="h-1.5 w-1.5 rounded-full bg-pkk-primary-dark" />}
    </button>
  );
}

function CloseIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function Sidebar({ user, currentPath, onLogout, isOpen = false, onClose }) {
  return (
    <>
      {/* Backdrop hanya di mobile saat sidebar terbuka */}
      {isOpen && (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          aria-label="Tutup menu"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-pkk-primary-dark px-5 py-6 text-sm text-teal-50 shadow-2xl shadow-teal-900/40 transition-transform duration-200 ease-out md:relative md:h-full md:min-h-screen md:translate-x-0 md:shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between gap-3 border-b border-teal-700/40 pb-6">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Logo TP PKK"
              className="h-10 w-10 rounded-full border-2 border-teal-100 bg-white object-contain p-0.5"
            />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-200">
                TP PKK Sungai Ulin
              </p>
              <p className="text-xs font-bold uppercase">SIKESULIN</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-teal-100 hover:bg-teal-700/50 md:hidden"
            aria-label="Tutup menu"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="mt-6 space-y-1">
          <SidebarLink
            to="/dashboard"
            active={currentPath === '/' || currentPath === ''}
            label="Ringkasan"
            onAfterNavigate={onClose}
          />
          <SidebarLink
            to="/dashboard/surat-masuk"
            active={currentPath.startsWith('/surat-masuk')}
            label="Surat Masuk"
            onAfterNavigate={onClose}
          />
          <SidebarLink
            to="/dashboard/surat-keluar"
            active={currentPath.startsWith('/surat-keluar')}
            label="Surat Keluar"
            onAfterNavigate={onClose}
          />
          <SidebarLink
            to="/dashboard/disposisi"
            active={currentPath.startsWith('/disposisi')}
            label="Disposisi"
            onAfterNavigate={onClose}
          />
        </nav>

        <div className="mt-auto border-t border-teal-700/40 pt-6">
          <p className="text-[11px] font-semibold text-teal-100">
            {user?.nama_lengkap || 'Pengguna'}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-teal-300/80">
            {user?.role || 'admin'}
          </p>
          <button
            onClick={onLogout}
            className="mt-3 inline-flex items-center rounded-lg border border-teal-500/60 px-3 py-1.5 text-[11px] font-semibold text-teal-50 shadow-sm shadow-slate-900/30 transition hover:bg-teal-500/20"
          >
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}

