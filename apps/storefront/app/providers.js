"use client";

import { store } from "@/store/store";
import { Provider } from "react-redux";
import { ScrollChromeProvider } from "@/components/layout/ScrollChromeProvider";
import { useEffect } from "react";
import { initPixel } from "@/lib/meta-pixel";

function MetaPixelProvider({ children }) {
  // Initialize Meta Pixel on first load (FBC cookie setup)
  useEffect(() => {
    initPixel();
  }, []);

  return children;
}

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <ScrollChromeProvider>
        <MetaPixelProvider>{children}</MetaPixelProvider>
      </ScrollChromeProvider>
    </Provider>
  );
}
