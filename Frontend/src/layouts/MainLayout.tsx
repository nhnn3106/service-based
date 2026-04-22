import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
  }`;

export const MainLayout = () => {
  const { cart, user, clearAuth } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f7f2e8] text-slate-900">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-40 top-10 h-72 w-72 rounded-full bg-amber-200/60 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-28 h-80 w-80 rounded-full bg-emerald-200/70 blur-[90px]" />
        <header className="relative mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              ChefHub
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              Dat mon nhanh, an ngon moi ngay
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs text-slate-600 shadow-soft sm:flex">
              <span>Hotline 1900 1234</span>
              <span className="h-4 w-px bg-slate-200" />
              <span>Mo cua 07:00 - 22:30</span>
            </div>
            <div className="rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 shadow-soft">
              {user ? `Xin chao, ${user.name}` : "Chua dang nhap"}
            </div>
          </div>
        </header>
      </div>

      <div className="mx-auto w-full max-w-6xl px-6">
        <nav className="flex flex-wrap items-center gap-2 rounded-3xl border border-slate-200/70 bg-white/90 p-3 shadow-soft">
          <NavLink to="/" className={navLinkClass} end>
            Trang chu
          </NavLink>
          <NavLink to="/cart" className={navLinkClass}>
            Gio hang ({cart.length})
          </NavLink>
          <NavLink to="/order" className={navLinkClass}>
            Dat hang
          </NavLink>
          {user?.role === "admin" && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}
          <div className="ml-auto flex items-center gap-2">
            {user ?
              <>
                <Link
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                  to="/">
                  Tai khoan
                </Link>
                <button
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                  type="button"
                  onClick={handleLogout}>
                  Dang xuat
                </button>
              </>
            : <>
                <NavLink to="/login" className={navLinkClass}>
                  Dang nhap
                </NavLink>
                <NavLink to="/register" className={navLinkClass}>
                  Dang ky
                </NavLink>
              </>
            }
          </div>
        </nav>
      </div>

      <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-6">
        <Outlet />
      </main>
    </div>
  );
};
