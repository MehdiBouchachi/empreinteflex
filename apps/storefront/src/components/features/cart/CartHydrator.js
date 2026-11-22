"use client";

import { hydrateCart } from "@/store/slices/cartSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function CartHydrator({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(hydrateCart());
  }, [dispatch]);

  return children;
}
