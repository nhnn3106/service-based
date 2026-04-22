import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import type { OrderPayload } from "../types";
import { formatVnd } from "../utils/format";

const paymentOptions = [
  { value: "cash", label: "Tien mat khi nhan hang" },
  { value: "bank", label: "Chuyen khoan ngan hang" },
] as const;

export const OrderPage = () => {
  const { user, cart, subTotal, deliveryFee, total } = useAppContext();
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    note: "",
    paymentMethod: "cash" as OrderPayload["paymentMethod"],
  });

  useEffect(() => {
    if (user?.name) {
      setForm((prev) => ({ ...prev, customerName: user.name }));
    }
  }, [user]);

  const navigate = useNavigate();

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (cart.length === 0 || !user) return;

    const payload: OrderPayload = {
      customerName: form.customerName,
      phone: form.phone,
      note: form.note,
      paymentMethod: form.paymentMethod,
      items: cart.map((item) => ({ id: item.id, quantity: item.quantity })),
    };

    setStatus("");
    navigate("/payment", { state: payload });
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Dat hang</h2>
          {!user && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              Can dang nhap
            </span>
          )}
        </div>

        {!user && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Vui long{" "}
            <Link className="font-semibold" to="/login">
              dang nhap
            </Link>{" "}
            truoc khi dat hang.
          </div>
        )}

        <form className="mt-4 space-y-4" onSubmit={submitOrder} id="order-form">
          <label className="block text-sm font-medium text-slate-700">
            Ten nguoi nhan
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-amber-400 focus:outline-none"
              value={form.customerName}
              onChange={(event) =>
                handleChange("customerName", event.target.value)
              }
              placeholder="Vi du: Le Thi B"
              required
              disabled={!user}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            So dien thoai
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-amber-400 focus:outline-none"
              value={form.phone}
              onChange={(event) => handleChange("phone", event.target.value)}
              placeholder="09xx xxx xxx"
              required
              disabled={!user}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Ghi chu
            <textarea
              className="mt-2 min-h-[70px] w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-amber-400 focus:outline-none"
              value={form.note}
              onChange={(event) => handleChange("note", event.target.value)}
              placeholder="Khong hanh, it cay..."
              disabled={!user}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Thanh toan
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-amber-400 focus:outline-none"
              value={form.paymentMethod}
              onChange={(event) =>
                handleChange(
                  "paymentMethod",
                  event.target.value as OrderPayload["paymentMethod"],
                )
              }
              disabled={!user}>
              {paymentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <p className="text-xs text-slate-500">
            {status || "Kiem tra gio hang truoc khi xac nhan."}
          </p>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-soft">
        <h2 className="text-xl font-semibold">Tong quan</h2>
        <div className="mt-4 space-y-2 border-t border-dashed border-slate-200 pt-4 text-sm">
          <div className="flex justify-between">
            <span>Tam tinh</span>
            <span className="font-semibold">{formatVnd(subTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Phi giao hang</span>
            <span className="font-semibold">{formatVnd(deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-slate-900">
            <span>Tong</span>
            <span>{formatVnd(total)}</span>
          </div>
        </div>
        <button
          className="mt-5 w-full rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-amber-200"
          form="order-form"
          type="submit"
          disabled={!user || cart.length === 0}>
          Thanh toan
        </button>
        <p className="mt-4 text-xs text-slate-500">
          Don hang se duoc xu ly sau khi xac nhan.
        </p>
      </div>
    </section>
  );
};
