import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";

export const RegisterPage = () => {
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Dang xu ly...");

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "");
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    try {
      await authService.register(name, email, password);
      const successMessage =
        "Dang ky thanh cong. Vui long dang nhap de tiep tuc.";
      setStatus(successMessage);
      navigate("/login", {
        replace: true,
        state: { statusMessage: successMessage },
      });
    } catch {
      setStatus("Khong the tao tai khoan, vui long thu lai");
    }
  };

  return (
    <section className="mx-auto w-full max-w-xl">
      <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-soft">
        <h2 className="text-xl font-semibold">Dang ky</h2>
        <p className="mt-2 text-sm text-slate-500">
          Tao tai khoan de theo doi don hang.
        </p>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Ho va ten
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-amber-400 focus:outline-none"
              name="name"
              placeholder="Vi du: Nguyen Van A"
              required
            />
          </label>
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
          <button className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
            Tao tai khoan
          </button>
        </form>
        <p className="mt-3 text-xs text-slate-500">{status}</p>
        <p className="mt-4 text-sm text-slate-600">
          Da co tai khoan?{" "}
          <Link className="font-semibold text-slate-900" to="/login">
            Dang nhap
          </Link>
        </p>
      </div>
    </section>
  );
};
