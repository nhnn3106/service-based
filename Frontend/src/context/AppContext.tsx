import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { menuService } from "../services/menuService";
import { authStorage } from "../services/authService";
import type { CartItem, MenuItem, UserProfile } from "../types";

type MenuStatus = "idle" | "loading" | "error";

type AppContextValue = {
  user: UserProfile | null;
  token: string | null;
  setAuth: (
    user: UserProfile | null,
    token: string | null,
    expiresAt?: string,
  ) => void;
  clearAuth: () => void;
  menu: MenuItem[];
  menuStatus: MenuStatus;
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  updateQuantity: (id: number, nextQuantity: number) => void;
  clearCart: () => void;
  subTotal: number;
  deliveryFee: number;
  total: number;
};

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [menuStatus, setMenuStatus] = useState<MenuStatus>("idle");
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    let active = true;

    const loadMenu = async () => {
      setMenuStatus("loading");
      try {
        const data = await menuService.getMenu();
        if (active) {
          setMenu(data);
          setMenuStatus("idle");
        }
      } catch {
        if (active) {
          setMenuStatus("error");
        }
      }
    };

    loadMenu();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const stored = authStorage.get();
    if (stored) {
      setUser(stored.user ?? null);
      setToken(stored.token ?? null);
    }
  }, []);

  const setAuth = (
    nextUser: UserProfile | null,
    nextToken: string | null,
    expiresAt?: string,
  ) => {
    setUser(nextUser);
    setToken(nextToken);
    authStorage.set({
      user: nextUser,
      token: nextToken,
      expiresAt,
    });
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    authStorage.clear();
  };

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((entry) => entry.id === item.id);
      if (!existing) {
        return [...prev, { ...item, quantity: 1 }];
      }
      return prev.map((entry) =>
        entry.id === item.id ?
          { ...entry, quantity: entry.quantity + 1 }
        : entry,
      );
    });
  };

  const updateQuantity = (id: number, nextQuantity: number) => {
    if (nextQuantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== id));
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: nextQuantity } : item,
      ),
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const subTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );
  const deliveryFee = subTotal > 0 ? 15000 : 0;
  const total = subTotal + deliveryFee;

  const value: AppContextValue = {
    user,
    token,
    setAuth,
    clearAuth,
    menu,
    menuStatus,
    cart,
    addToCart,
    updateQuantity,
    clearCart,
    subTotal,
    deliveryFee,
    total,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};
