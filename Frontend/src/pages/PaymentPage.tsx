import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { orderService } from "../services/orderService";
import { useAppContext } from "../context/AppContext";
import type { OrderPayload } from "../types";
import { formatVnd } from "../utils/format";

const paymentLabels: Record<OrderPayload["paymentMethod"], string> = {
  cash: "Tien mat khi nhan hang",
  bank: "Chuyen khoan ngan hang",
};

export const PaymentPage = () => {
  const { user, cart, clearCart, subTotal, deliveryFee, total } =
    useAppContext();
  const { state } = useLocation();
  const orderPayload = state as OrderPayload | undefined;
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const getNumericId = (value: string | number) => {
    if (typeof value === "number") return value;
    const matched = value.match(/\d+/g)?.join("");
    return matched ? Number(matched) : NaN;
  };

  const mapPaymentError = (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return "Thanh toan that bai, vui long thu lai";
    }
    const statusCode = error.response?.status;
    const message = error.response?.data?.message as string | undefined;

    if (statusCode === 404) {
      return message ?? "Khong tim thay don hang";
    }
    if (statusCode === 400) {
      return message ?? "Du lieu thanh toan khong hop le";
    }
    if (statusCode === 504) {
      return "He thong don hang dang ban, vui long thu lai";
    }
    if (statusCode === 500) {
      return "Loi he thong, vui long thu lai sau";
    }
    return message ?? "Thanh toan that bai, vui long thu lai";
  };

  const submitPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!orderPayload || loading || !user) return;

    setLoading(true);
    setStatus("Dang thanh toan...");

    try {
      const userId = getNumericId(user.id);
      if (Number.isNaN(userId) || userId < 1) {
        setStatus("Khong the thanh toan: ID khong hop le");
        return;
      }
      if (orderPayload.items.length === 0) {
        setStatus("Khong co mon trong gio hang");
        return;
      }

      const results = await Promise.all(
        orderPayload.items.map((item) =>
          orderService.createOrder({
            userId,
            foodId: item.id,
            quantity: item.quantity,
          }),
        ),
      );
      clearCart();
      const firstOrder = results[0];
      setStatus(
        firstOrder ?
          `Da tao ${results.length} don. Du kien ${firstOrder.etaMinutes} phut.`
        : "Da tao don thanh cong.",
      );
    } catch (error) {
      setStatus(mapPaymentError(error));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 shadow-soft">
        <p>
          Vui long{" "}
          <Link className="font-semibold" to="/login">
            dang nhap
          </Link>{" "}
          truoc khi thanh toan.
        </p>
      </section>
    );
  }

  if (!orderPayload) {
    return (
      <section className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-soft">
        <p className="text-sm text-slate-600">
          Khong co thong tin don hang. Vui long quay lai trang dat hang.
        </p>
        <Link
          className="mt-3 inline-flex text-sm font-semibold text-slate-900"
          to="/order">
          Quay lai dat hang
        </Link>
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-soft">
        <h2 className="text-xl font-semibold">Thanh toan</h2>
        <p className="mt-2 text-sm text-slate-500">
          Xac nhan thong tin va hoan tat thanh toan.
        </p>
        <form className="mt-4 space-y-4" onSubmit={submitPayment}>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">Nguoi nhan</p>
            <p>{orderPayload.customerName}</p>
            <p>{orderPayload.phone}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">
              Phuong thuc thanh toan
            </p>
            <p>{paymentLabels[orderPayload.paymentMethod]}</p>
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={loading || orderPayload.items.length === 0}>
            {loading ? "Dang xu ly..." : "Hoan tat thanh toan"}
          </button>
          <p className="text-xs text-slate-500">
            {status || "Kiem tra don hang truoc khi thanh toan."}
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
        <p className="mt-4 text-xs text-slate-500">
          Gio hang hien co {cart.length} mon.
        </p>
      </div>
    </section>
  );
};
