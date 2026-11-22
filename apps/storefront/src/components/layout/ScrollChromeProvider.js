"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const MOBILE_BREAKPOINT_QUERY = "(max-width: 767.98px)";
const TOP_LOCK_Y = 40;
const SCROLL_DELTA_THRESHOLD = 10;

export const CHROME_OFFSETS = {
  mobileNavHeight: 76,
  floatingGap: 16,
  filtersFabHeight: 40,
  floatingStackGap: 14,
  whatsappStackGap: 54,
};

const ScrollChromeContext = createContext(null);

function getDirection(delta, fallback) {
  if (delta > 0) return "down";
  if (delta < 0) return "up";
  return fallback;
}

export function ScrollChromeProvider({ children }) {
  const [chrome, setChrome] = useState({
    headerVisible: true,
    mobileNavVisible: true,
    isNearTop: true,
    isMobileViewport: false,
    isFooterInView: false,
    scrollDirection: "up",
    scrollY: 0,
  });

  const chromeRef = useRef(chrome);
  const isMobileViewportRef = useRef(false);
  const isFooterInViewRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    chromeRef.current = chrome;
  }, [chrome]);

  const setChromeSafe = useCallback((updater) => {
    setChrome((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (
        prev.headerVisible === next.headerVisible &&
        prev.mobileNavVisible === next.mobileNavVisible &&
        prev.isNearTop === next.isNearTop &&
        prev.isMobileViewport === next.isMobileViewport &&
        prev.isFooterInView === next.isFooterInView &&
        prev.scrollDirection === next.scrollDirection &&
        prev.scrollY === next.scrollY
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT_QUERY);

    const applyViewportState = (matches) => {
      isMobileViewportRef.current = matches;

      setChromeSafe((prev) => {
        const shouldShowFromScroll =
          prev.isNearTop || prev.scrollDirection === "up";
        return {
          ...prev,
          isMobileViewport: matches,
          mobileNavVisible: matches
            ? prev.isFooterInView
              ? true
              : shouldShowFromScroll
            : false,
        };
      });
    };

    applyViewportState(mediaQuery.matches);

    const handleViewportChange = (event) => applyViewportState(event.matches);
    mediaQuery.addEventListener("change", handleViewportChange);

    return () => mediaQuery.removeEventListener("change", handleViewportChange);
  }, [setChromeSafe]);

  useEffect(() => {
    const footer = document.getElementById("site-footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;
        isFooterInViewRef.current = inView;

        setChromeSafe((prev) => {
          const shouldShowFromScroll =
            prev.isNearTop || prev.scrollDirection === "up";
          return {
            ...prev,
            isFooterInView: inView,
            mobileNavVisible: prev.isMobileViewport
              ? inView
                ? true
                : shouldShowFromScroll
              : false,
          };
        });
      },
      { threshold: 0.1 },
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, [setChromeSafe]);

  useEffect(() => {
    const evaluateScroll = () => {
      const currentY = Math.max(window.scrollY, 0);
      const previousY = lastScrollYRef.current;
      const delta = currentY - previousY;

      lastScrollYRef.current = currentY;

      const previous = chromeRef.current;
      const isNearTop = currentY < TOP_LOCK_Y;
      const scrollDirection = getDirection(delta, previous.scrollDirection);

      let headerVisible = previous.headerVisible;
      let mobileNavVisible = previous.mobileNavVisible;

      if (isNearTop) {
        headerVisible = true;
        mobileNavVisible = isMobileViewportRef.current;
      } else if (delta > SCROLL_DELTA_THRESHOLD) {
        headerVisible = false;
        if (isMobileViewportRef.current) mobileNavVisible = false;
      } else if (delta < -SCROLL_DELTA_THRESHOLD) {
        headerVisible = true;
        if (isMobileViewportRef.current) mobileNavVisible = true;
      }

      if (!isMobileViewportRef.current) {
        mobileNavVisible = false;
      } else if (isFooterInViewRef.current) {
        mobileNavVisible = true;
      }

      setChromeSafe({
        headerVisible,
        mobileNavVisible,
        isNearTop,
        isMobileViewport: isMobileViewportRef.current,
        isFooterInView: isFooterInViewRef.current,
        scrollDirection,
        scrollY: currentY,
      });
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      window.requestAnimationFrame(() => {
        evaluateScroll();
        tickingRef.current = false;
      });
    };

    lastScrollYRef.current = Math.max(window.scrollY, 0);
    evaluateScroll();

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, [setChromeSafe]);

  useEffect(() => {
    const mobilePadding =
      chrome.isMobileViewport && chrome.mobileNavVisible
        ? CHROME_OFFSETS.mobileNavHeight
        : 0;
    document.body.style.paddingBottom = `${mobilePadding}px`;

    return () => {
      document.body.style.paddingBottom = "";
    };
  }, [chrome.isMobileViewport, chrome.mobileNavVisible]);

  const value = useMemo(
    () => ({
      ...chrome,
      floatingMobileBaseOffset:
        (chrome.mobileNavVisible ? CHROME_OFFSETS.mobileNavHeight : 0) +
        CHROME_OFFSETS.floatingGap,
    }),
    [chrome],
  );

  return (
    <ScrollChromeContext.Provider value={value}>
      {children}
    </ScrollChromeContext.Provider>
  );
}

export function useScrollChromeVisibility() {
  const context = useContext(ScrollChromeContext);
  if (!context) {
    throw new Error(
      "useScrollChromeVisibility must be used inside ScrollChromeProvider",
    );
  }
  return context;
}
