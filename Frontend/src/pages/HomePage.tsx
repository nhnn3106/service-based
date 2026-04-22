import { useAppContext } from "../context/AppContext";
import { formatVnd } from "../utils/format";

export const HomePage = () => {
  const { menu, menuStatus, addToCart } = useAppContext();

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Danh sach mon</h2>
          <p className="text-sm text-slate-500">Lua chon hom nay cua ban</p>
        </div>
        <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">
          {menuStatus === "loading" ? "Dang tai..." : `${menu.length} mon`}
        </div>
      </div>

      {menuStatus === "error" && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Khong the tai thuc don. Vui long thu lai sau.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {menu.map((item) => (
          <article
            key={item.id}
            className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-soft transition hover:-translate-y-1">
            <div className="absolute right-4 top-4 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
              {formatVnd(item.price)}
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-200 via-orange-200 to-emerald-200 text-xl font-semibold text-slate-800">
              {item.name.charAt(0)}
            </div>
            <div className="mt-4 space-y-2">
              <h3 className="text-lg font-semibold text-slate-900">
                {item.name}
              </h3>
              <p className="text-sm text-slate-500">
                {item.description ?? "Khong co mo ta"}
              </p>
            </div>
            <button
              className="mt-5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
              onClick={() => addToCart(item)}
              type="button">
              Them vao gio
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};
