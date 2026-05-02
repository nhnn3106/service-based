import { useState, type FormEvent } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { authService } from "../services/authService";
import { useAppContext } from "../context/AppContext";

export const LoginPage = () => {
  const { setAuth } = useAppContext();
  const location = useLocation();
  const [status, setStatus] = useState(() => {
    const message = (location.state as { statusMessage?: string } | null)
      ?.statusMessage;
    return message ?? "";
  });
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Dang xu ly...");

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    try {
      const result = await authService.login(email, password);
      setAuth(result.user, result.token, result.expiresAt);
      setStatus("Dang nhap thanh cong");
      navigate(result.user.role === "admin" ? "/admin" : "/", {
        replace: true,
      });
    } catch (error) {
      const message =
        error instanceof Error ?
          error.message
        : "Khong the dang nhap, vui long thu lai";
      setStatus(message);
    }
  };

  return (
    <section className="mx-auto w-full max-w-xl">
      <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-soft">
        <h2 className="text-xl font-semibold">Dang nhap</h2>
        <p className="mt-2 text-sm text-slate-500">
          Dang nhap de dat hang nhanh hon.
        </p>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-amber-400 focus:outline-none"
              name="email"
              type="email"
              placeholder="hello@chefhub.vn"
              required
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Mat khau
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-amber-400 focus:outline-none"
              name="password"
              type="password"
              placeholder="Nhap mat khau"
              required
            />
          </label>
          <button className="w-full rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600">
            Dang nhap
          </button>
        </form>
        <p className="mt-3 text-xs text-slate-500">{status}</p>
        <p className="mt-4 text-sm text-slate-600">
          Chua co tai khoan?{" "}
          <Link className="font-semibold text-slate-900" to="/register">
            Dang ky ngay
          </Link>
        </p>
      </div>
    </section>
  );
};
