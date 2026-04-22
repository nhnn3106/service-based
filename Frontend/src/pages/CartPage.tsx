import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { formatVnd } from "../utils/format";

export const CartPage = () => {
  const { cart, updateQuantity, subTotal, deliveryFee, total } =
    useAppContext();

  return (
    <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Gio hang</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {cart.length} mon
          </span>
        </div>

        <div className="mt-4 space-y-4">
          {cart.length === 0 ?
            <p className="text-sm text-slate-500">
              Chua co mon nao. Hay chon mon ben Trang chu.
            </p>
          : cart.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {formatVnd(item.price)}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      className="h-7 w-7 rounded-full border border-slate-200 text-sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      type="button">
                      -
                    </button>
                    <span className="text-sm font-medium">{item.quantity}</span>
                    <button
                      className="h-7 w-7 rounded-full border border-slate-200 text-sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      type="button">
                      +
                    </button>
                  </div>
                </div>
                <div className="text-sm font-semibold text-slate-700">
                  {formatVnd(item.price * item.quantity)}
                </div>
              </div>
            ))
          }
        </div>
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
        {cart.length === 0 ?
          <button
            className="mt-5 w-full rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-500"
            disabled
            type="button">
            Dat hang
          </button>
        : <Link
            className="mt-5 inline-flex w-full justify-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
            to="/order">
            Dat hang
          </Link>
        }
      </div>
    </section>
  );
};
