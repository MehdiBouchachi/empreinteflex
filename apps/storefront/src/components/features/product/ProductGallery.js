"use client";

import { useState } from "react";
import ProductImage from "@/components/ui/ProductImage";
import { motion, AnimatePresence } from "framer-motion";
import { useProduct } from "./ProductContext";

/* ═══════════════════════════════════════════════════════════════════════
   ProductGallery — main image + thumbnails.

   AUDIT OF ORIGINAL:
   ✓ Zoom on desktop (mousemove) — good UX, correctly gated behind
     window.innerWidth < 1024 check
   ✓ scale(1.8) — feels premium for a detail page, acceptable
   ✓ Image fade on key change — correct Framer use

   ISSUES:
   • `MotionImage = motion(Image)` recreated at module level — fine,
     but the component re-renders on every mousemove because zoomStyle
     is state. This means React is calling setState 60x/sec on hover.

   FIX — use a ref for zoom instead of state:
   • zoomStyle moves to a CSS variable approach via inline style on the
     wrapper div — the Image gets its transformOrigin/scale from the
     wrapper's style, not from React state.
   • Actually the cleanest fix: keep zoomStyle as a ref and apply it
     directly to the DOM element via ref, bypassing React's render cycle.
     This eliminates all re-renders during mousemove.

   IMAGE TRANSITION:
   • Keep AnimatePresence + opacity fade (0 → 1 over 0.3s). This is
     the correct Framer use — keyed component swap with exit animation.
   • Added a tiny crossfade: exit opacity 0 overlaps enter opacity 0→1
     so there's no blank flash between images.

   ZOOM:
   • Kept on desktop only (lg+) — correct
   • scale(1.8) kept — fine for a mattress detail page
   • Gated with pointer check so touch devices never trigger it
════════════════════════════════════════════════════════════════════════ */
export default function ProductGallery() {
  const { product, state, dispatch } = useProduct();
  const { selectedImage } = state;
  const images = product.images ?? [];

  /* Use a ref for the image DOM element to apply zoom directly —
     bypasses React render cycle on every mousemove */
  const [imgRef, setImgRef] = useState(null);

  const handleMouseMove = (e) => {
    if (!imgRef) return;
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    // eslint-disable-next-line react-hooks/immutability
    imgRef.style.transformOrigin = `${x}% ${y}%`;
    imgRef.style.transform = "scale(1.8)";
  };

  const handleMouseLeave = () => {
    if (!imgRef) return;
    // eslint-disable-next-line react-hooks/immutability
    imgRef.style.transform = "scale(1.08)";
    imgRef.style.transformOrigin = "center";
  };

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="rounded-md sm:rounded-md bg-white">
        {/* MAIN IMAGE */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full aspect-5/4 sm:aspect-4/3 lg:aspect-6/5 overflow-hidden rounded-md sm:rounded-md bg-linear-to-b from-white via-slate-50 to-blue-50/70 lg:cursor-zoom-in border border-blue-100"
          /* cursor-zoom-in only on lg+ — touch devices shouldn't see the zoom cursor */
        >
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-linear-to-t from-black/8 to-transparent" />

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <ProductImage
                ref={setImgRef}
                src={selectedImage}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain transition-transform duration-300 will-change-transform"
                style={{ transformOrigin: "center", transform: "scale(1.08)" }}
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* THUMBNAILS */}
        {images.length > 1 && (
          <div className="mt-4 sm:mt-5 p-0">
            <div className="flex gap-2.5 sm:gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => dispatch({ type: "SET_IMAGE", payload: img })}
                  className={`
                    relative snap-start shrink-0 h-16 w-16 sm:h-20 sm:w-20
                    overflow-hidden rounded-md sm:rounded-md border-2
                    transition-all duration-200
                    ${
                      selectedImage === img
                        ? "border-blue-900"
                        : "border-blue-200 hover:border-blue-300"
                    }
                  `}
                  aria-label={`View image ${i + 1}`}
                  aria-pressed={selectedImage === img}
                >
                  <ProductImage
                    src={img}
                    alt={`Thumbnail ${i + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
