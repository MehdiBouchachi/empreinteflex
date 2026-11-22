import { createSlice } from "@reduxjs/toolkit";

const PRICE_BASE = 2400; // Starting price in DZD
const PRICE_MODIFIERS = {
  size: {
    "90x190": 0,
    "120x190": 500,
    "140x190": 800,
  },
  thickness: {
    20: 0,
    25: 300,
    30: 600,
  },
  comfort: {
    Confort: 0,
    Équilibré: 0,
    Ferme: 400,
  },
};

const initialState = {
  selectedSize: "90x190",
  selectedThickness: "25",
  selectedComfort: "Équilibré",
};

const empreinteFlexSlice = createSlice({
  name: "empreinteF1ex",
  initialState,
  reducers: {
    setSize: (state, action) => {
      state.selectedSize = action.payload;
    },
    setThickness: (state, action) => {
      state.selectedThickness = action.payload;
    },
    setComfort: (state, action) => {
      state.selectedComfort = action.payload;
    },
    resetConfigurator: () => initialState,
  },
});

export const { setSize, setThickness, setComfort, resetConfigurator } =
  empreinteFlexSlice.actions;

export const selectCurrentPrice = (state) => {
  const config = state.empreinteF1ex;
  const sizeModifier = PRICE_MODIFIERS.size[config.selectedSize] || 0;
  const thicknessModifier =
    PRICE_MODIFIERS.thickness[config.selectedThickness] || 0;
  const comfortModifier = PRICE_MODIFIERS.comfort[config.selectedComfort] || 0;

  return PRICE_BASE + sizeModifier + thicknessModifier + comfortModifier;
};

export default empreinteFlexSlice.reducer;
