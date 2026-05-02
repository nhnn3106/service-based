import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../services/adminService";
import { useAppContext } from "../context/AppContext";
import type { FoodPayload, MenuItem, UserProfile } from "../types";
import { formatVnd } from "../utils/format";

const emptyFood: FoodPayload = {
  name: "",
  description: "",
  price: 0,
};

export const AdminPage = () => {
  const { user } = useAppContext();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [foods, setFoods] = useState<MenuItem[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FoodPayload>(emptyFood);
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, foodsData] = await Promise.all([
        adminService.getUsers(),
        adminService.getFoods(),
      ]);
      setUsers(usersData);
      setFoods(foodsData);
      setStatus("");
    } catch {
      setStatus("Khong the tai du lieu admin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadData();
    }
  }, [user]);

  const handleChange = (field: keyof FoodPayload, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: field === "price" ? Number(value) : value,
    }));
  };

  const resetForm = () => {
    setForm(emptyFood);
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      if (editingId) {
        await adminService.updateFood(editingId, form);
        setStatus("Cap nhat mon thanh cong");
      } else {
        await adminService.createFood(form);
        setStatus("Them mon moi thanh cong");
      }
      resetForm();
      await loadData();
    } catch {
      setStatus("Khong the luu mon an");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setForm({
      name: item.name,
      description: item.description ?? "",
      price: item.price,
    });
    setEditingId(item.id);
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      await adminService.deleteFood(id);
      setStatus("Da xoa mon an");
      await loadData();
    } catch {
      setStatus("Khong the xoa mon an");
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 shadow-soft">
        <p>
          Day la khu vuc danh cho admin. Vui long{" "}
          <Link className="font-semibold" to="/login">
            dang nhap
          </Link>{" "}
          voi tai khoan admin.
        </p>
        <p className="mt-2 text-xs text-amber-700">
          Tai khoan mau: admin@chefhub.vn
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-soft">
        <h2 className="text-2xl font-semibold">Quan tri admin</h2>
        <p className="mt-2 text-sm text-slate-500">
          Quan ly tai khoan va mon an tren he thong.
        </p>
        {status && <p className="mt-3 text-sm text-slate-600">{status}</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1.4fr]">
        <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-soft">
          <h3 className="text-lg font-semibold">Danh sach tai khoan</h3>
          <div className="mt-4 space-y-3">
            {users.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {account.name}
                  </p>
                  <p className="text-xs text-slate-500">{account.email}</p>
                </div>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                  {account.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-soft">
          <h3 className="text-lg font-semibold">
            {editingId ? "Cap nhat mon an" : "Them mon an"}
          </h3>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-slate-700">
              Ten mon
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-amber-400 focus:outline-none"
                value={form.name}
                onChange={(event) => handleChange("name", event.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Mo ta
              <textarea
                className="mt-2 min-h-[80px] w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-amber-400 focus:outline-none"
                value={form.description ?? ""}
                onChange={(event) =>
                  handleChange("description", event.target.value)
                }
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Gia (VND)
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-amber-400 focus:outline-none"
                value={form.price}
                onChange={(event) => handleChange("price", event.target.value)}
                type="number"
                min="0"
                required
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={loading}>
                {editingId ? "Cap nhat" : "Them moi"}
              </button>
              {editingId && (
                <button
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                  onClick={resetForm}
                  type="button">
                  Huy
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Danh sach mon an</h3>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {foods.length} mon
          </span>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {foods.map((item) => (
            <article
              key={item.id}
              className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">
                    {item.name}
                  </h4>
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  {formatVnd(item.price)}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">{item.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                  onClick={() => handleEdit(item)}
                  type="button">
                  Sua
                </button>
                <button
                  className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600"
                  onClick={() => handleDelete(item.id)}
                  type="button">
                  Xoa
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
