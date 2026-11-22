import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "empreinte_cart";

/* ================= STORAGE ================= */

const loadCart = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
};

/* ================= INITIAL ================= */

const initialState = {
  items: loadCart(),
};

/* ================= SLICE ================= */

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    addToCart: (state, action) => {
      const { id, size, thickness, density } = action.payload;

      const existing = state.items.find(
        (item) =>
          item.id === id &&
          item.size === size &&
          item.thickness === thickness &&
          (item.density || null) === (density || null),
      );

      if (existing) {
        existing.quantity += action.payload.quantity || 1;
      } else {
        state.items.push({
          ...action.payload,
          quantity: action.payload.quantity || 1,
        });
      }

      saveCart(state.items);
    },

    removeFromCart: (state, action) => {
      const { id, size, thickness, density } = action.payload;

      state.items = state.items.filter(
        (item) =>
          !(
            item.id === id &&
            item.size === size &&
            item.thickness === thickness &&
            (item.density || null) === (density || null)
          ),
      );

      saveCart(state.items);
    },

    updateQuantity: (state, action) => {
      const { id, size, thickness, density, quantity } = action.payload;

      const item = state.items.find(
        (item) =>
          item.id === id &&
          item.size === size &&
          item.thickness === thickness &&
          (item.density || null) === (density || null),
      );

      if (item && quantity > 0) {
        item.quantity = quantity;
      }

      saveCart(state.items);
    },

    decreaseQuantity: (state, action) => {
      const { id, size, thickness, density } = action.payload;

      const item = state.items.find(
        (item) =>
          item.id === id &&
          item.size === size &&
          item.thickness === thickness &&
          (item.density || null) === (density || null),
      );

      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          state.items = state.items.filter(
            (i) =>
              !(
                i.id === id &&
                i.size === size &&
                i.thickness === thickness &&
                (i.density || null) === (density || null)
              ),
          );
        }
      }

      saveCart(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      saveCart([]);
    },

    hydrateCart: (state) => {
      state.items = loadCart();
    },
  },
});

/* ================= SELECTORS ================= */

export const selectCartItems = (state) => state.cart.items;

export const selectCartCount = (state) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartTotal = (state) =>
  state.cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

/* ================= EXPORTS ================= */

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  decreaseQuantity,
  clearCart,
  hydrateCart,
} = cartSlice.actions;

export default cartSlice.reducer;
