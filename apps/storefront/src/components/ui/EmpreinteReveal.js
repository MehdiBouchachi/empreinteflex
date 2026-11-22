"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

/**
 * EmpreinteReveal — animated logo reveal for Empreinte Flex.
 *
 * Self-contained: no external assets or CSS files to wire up. Drop this
 * component into a sized box (it fills its parent responsively, background
 * stays transparent):
 *
 *   <div style={{ width: 480, height: 320 }}>
 *     <EmpreinteReveal onComplete={() => setLoading(false)} />
 *   </div>
 *
 * Plays once automatically as soon as it mounts (drop it in on page load
 * / behind your loader and use onComplete to reveal the rest of the page).
 * Pass loop to replay it continuously instead. An imperative ref exposes
 * replay() if you need to trigger it again later (e.g. on route change).
 */

// ---- brand vector data (wave / face / stras / texture), all in one
// shared 855.25 x 511.29 coordinate space ----
const EMPREINTE = {"vb":[0,0,855.25,511.29],"blueSwoosh":{"d":"M614.68,192.86c-3.57-4.02-5.69-6.35-7.74-8.74-10.24-11.91-22.04-13.44-35.32-4.76-5.18,3.39-10.33,7.08-15.99,9.42-9.97,4.11-19.61,1.9-27.74-4.76-5.94-4.86-11.32-10.5-16.41-16.26-11.55-13.06-24.7-16.91-39.63-7.99-15.39,9.19-29.57,20.48-43.87,31.4-25.05,19.15-51.55,35.46-83.69,38.44-23.03,2.13-46.26,2.99-69.4,2.95-49.4-.08-97.72,5.25-143.78,24.41-.93.39-1.97.5-2.96.75-.23-.55-.45-1.1-.68-1.66,10.2-4.53,20.24-9.49,30.64-13.53,37.55-14.6,76.75-19.47,116.81-19.52,18.45-.02,36.99-.05,55.32-1.8,32.63-3.12,59.83-18.6,83.98-40.05,12.99-11.53,25.53-23.71,39.42-34.06,8.01-5.97,17.92-10.36,27.65-12.84,17.15-4.37,31.53,2.6,43.36,15.12,4.86,5.14,9.45,10.54,14.23,15.76,4.67,5.11,9.86,5.48,15.47,1.51,4.9-3.46,9.71-7.08,14.78-10.27,12.33-7.74,23.99-7.39,35.08,1.96,6.26,5.28,11.91,6.44,19.26,2.64,7.27-3.76,15.04-2.65,22.6-.29,1.84.57,3.72,1.2,5.37,2.16,22.44,13.09,46.48,11.02,70.84,8.18,16.33-1.9,33-4.4,49.23-3.06,31.62,2.61,47.67,20.47,47.31,52.25-.2,17.65-3.77,35.31-6.53,52.85-2.2,13.98-5.82,27.73-8.16,41.69-2.16,12.88-3.16,25.9,1.77,39.41-5.74-1.54-7.77-4.74-8.42-9.39-2.54-18.28-.84-36.36,2.05-54.45,3.42-21.41,6.76-42.84,4.49-64.67-2.76-26.61-14.55-38.65-41.4-39.61-13.63-.49-27.41,1.23-41.02,2.85-19.03,2.27-37.99,4.81-56.82-.9-7.99-2.42-15.97-5.01-23.72-8.12-8.62-3.46-15.49-1.65-21.13,5.47-1.73,2.18-3.21,4.56-5.24,7.47Z","color":"#07399a","x":127.5,"y":129.9,"w":691.7,"h":224.3,"cx":473.3,"cy":242},"redSwoosh":{"d":"M44.7,264.03c16.95,13.8,34.86,25.92,54.15,35.87,34.72,17.91,71.74,28.06,110.49,32.76,54.16,6.57,106.98-1.58,159.71-12.68,35.69-7.51,71.44-14.88,107.4-20.9,50.79-8.5,101.36-5.45,151.59,5.72,40.61,9.03,79.95,21.61,117.36,39.93,4.9,2.4,9.57,5.29,14.74,8.17-21.15-6.73-41.55-13.95-62.37-19.7-67.18-18.54-135.51-23.14-204.2-11.53-45.02,7.61-89.49,18.51-134.2,27.99-37.5,7.96-75.28,13.18-113.73,11.95-48.63-1.56-94.9-12.05-136.96-37.43-24.67-14.88-46.6-32.96-62.48-57.5-.55-.86-1.01-1.78-1.51-2.67Z","color":"#ea2826","x":44.7,"y":264,"w":715.5,"h":98.8,"cx":402.4,"cy":313.4},"stars":[{"d":"M290.46,85.52c26.17-6.44,42.02-21.17,45.6-48.7,2.37,27.79,18.27,42.44,44.46,48.67-26.52,3.93-40.64,19.15-44.39,45.34-5.78-25.12-18.31-42.14-45.67-45.32Z","color":"#ea2826","x":290.5,"y":36.8,"w":90.1,"h":94,"cx":335.5,"cy":83.8},{"d":"M409.44,22.07c11.87-2.9,17.51-10.83,20.29-22.07,2.56,12.61,9.81,20.06,22.41,23.03-11.26,2.61-19.31,8.13-22.37,19.98-3.28-10.76-10.3-17.05-20.33-20.94Z","color":"#ea2826","x":409.4,"y":0,"w":42.7,"h":43,"cx":430.8,"cy":21.5},{"d":"M379.2,55.48c9.22-2.89,15.48-8.01,17.94-17.83,2,9.26,7.27,14.99,16.68,17.58-8.94,2.97-15.42,7.91-17.64,17.81-2.06-9.57-8.29-14.59-16.98-17.57Z","color":"#ea2826","x":379.2,"y":37.6,"w":34.6,"h":35.4,"cx":396.5,"cy":55.3}],"letters":[{"d":"M0,396.07c17.99,0,35.98-.08,53.97.17,1.23.02,3.26,2.4,3.46,3.87.5,3.79.17,7.69.17,12.58-1.05-1.38-1.76-2.02-2.11-2.81-3.03-6.91-8.46-9.7-15.82-10.03-17.68-.79-17.68-.91-17.67,16.54,0,5.58-.18,11.18.15,16.74.09,1.46,1.8,4.06,2.69,4.03,7.94-.29,16.4,2.39,23.76-4.08v9.36c-7.06-.61-14.19-1.24-21.33-1.85-3.39-.29-5.26,1-5.22,4.71.13,10.09-.09,20.19.38,30.26.08,1.76,2.84,4.87,4.34,4.86,7.65-.07,15.66.23,22.82-1.96,4.88-1.49,8.58-6.86,12.64-10.35-.28,3.32-.33,7.86-1.23,12.22-.28,1.35-2.88,3.14-4.43,3.16-18.42.22-36.85.14-53.86.14,1.03-5.14,2.72-9.85,2.79-14.59.29-19.53.08-39.07.07-58.61,0-5.31-.5-10.38-5.57-14.36Z","color":"#07399a","x":0,"y":396,"w":62.2,"h":87.7,"cx":31.1,"cy":439.9},{"d":"M134.88,482.29h-19.97s2.42-28.87,1.12-43.67c-.6-6.8-6.74-9.75-14.76-8.75-7.39.92-10.54,4.36-10.54,11.55,0,8.59-.3,17.2.11,25.77.26,5.32,2.5,16.1,2.5,16.1h-21.26s5.13-47.89-1.32-54.72c6.29-1.56,12.34-3.07,18.79-4.67.53,2.79.98,5.17,1.46,7.65,18.91-10.59,26.34-10.42,38.72-.75,9.47-2.55,17.46-5.96,25.65-6.6,10.91-.85,17.58,6.42,17.9,17.52.27,9.23-.34,18.49.15,27.7.24,4.59,3.2,13.88,3.2,13.88h-20.47s1.91-7.75,2.04-11.57c.31-9.23.27-18.47.12-27.7-.19-11.42-8.67-17.14-19.31-13.18-4.64,1.73-7.34,4.53-7.14,10.08.35,9.65-.22,19.34.19,28.99.19,4.4,2.83,12.39,2.83,12.39Z","color":"#07399a","x":70.8,"y":421,"w":105.9,"h":62.3,"cx":123.7,"cy":452.1},{"d":"M188.41,428.15c4.97-1.21,10.98-2.67,17.39-4.23.6,2.24,1.11,4.13,1.75,6.52,8.1-5.57,16.68-7.99,25.88-5.33,12.92,3.74,20.02,16.52,18.16,31.69-2.93,23.91-20.51,34.36-43.03,25.58-3.35,8.23-1.54,23.77,3.71,28.91h-22.47c.68-4.21,1.97-8.59,2.01-12.99.19-18.89.21-37.78-.18-56.67-.09-4.33-2.01-8.62-3.23-13.48ZM207.01,455.29h-.09c0,4.93,0,9.87,0,14.8,0,9,4.91,13.27,13.86,11.93,6.95-1.05,11.81-5.15,12.52-11.97.99-9.5,1.33-19.16.73-28.68-.37-5.79-4.76-9.94-10.43-12.02-9.24-3.38-16.52,1.53-16.58,11.14-.03,4.93,0,9.87,0,14.8Z","color":"#07399a","x":188.4,"y":422.4,"w":65.1,"h":88.8,"cx":220.9,"cy":466.9},{"d":"M284.25,483.29h-21.64c6.27-10.06,5.34-47.04-1.65-54.51,6.33-1.6,12.35-3.12,18.67-4.71.71,3.6,1.31,6.67,1.99,10.14,3.47-2.92,6.16-6.09,9.57-7.82,3.27-1.65,7.32-2.53,10.98-2.4,4.04.15,6.75,3.01,5.79,7.52-1.01,4.81-4.22,5.08-8.38,3.75-10.9-3.49-16.23-1.38-18.13,7.04-.47,2.06-.43,4.26-.43,6.39,0,6.86-.26,13.74.27,20.56.36,4.62,1.89,9.15,2.96,14.04Z","color":"#07399a","x":261,"y":423.9,"w":48,"h":59.4,"cx":284.9,"cy":453.6},{"d":"M365.15,474.72c-2.76,2.11-5.35,4.51-8.32,6.28-12.32,7.34-30.88,4.49-40.3-6.01-8-8.92-8.81-28.67-1.58-38.79,8.08-11.31,24.97-15.85,38.23-9.98,7.05,3.12,11.9,8.36,13.2,16.28.84,5.14-.71,8.36-6.58,8.46-9.02.15-18.05.94-27.04.6-6.08-.23-6.8,2.27-6.06,7.28,2.63,17.95,18.44,25.53,33.85,16.1,1.07-.65,2.17-1.24,3.25-1.86.45.55.9,1.09,1.36,1.64ZM325.15,448.76c8.52,0,14.68.14,20.83-.11,1.47-.06,3.34-1.08,4.25-2.26,3.04-3.9.99-15.34-3.05-18.44-4.87-3.75-13.61-2.46-16.86,3.6-2.59,4.8-3.29,10.62-5.17,17.21Z","color":"#07399a","x":307.7,"y":420.3,"w":59.5,"h":68,"cx":337.5,"cy":454.3},{"d":"M399.66,483.29h-20.84c.84-4.6,2.19-9.1,2.37-13.64.37-9.4.49-18.86-.06-28.24-.25-4.25-2.36-8.4-3.81-13.19,4.91-1.43,11.43-3.34,19.05-5.56,0,6.82.01,12.73,0,18.64-.02,9.63-.4,19.28.06,28.89.2,4.29,2.05,8.5,3.25,13.1Z","color":"#07399a","x":377.3,"y":422.7,"w":22.4,"h":60.6,"cx":388.5,"cy":453},{"d":"M396.46,403.38c.16,4.98-4.05,9.28-9.2,9.39-5.04.11-8.76-3.19-8.97-7.93-.24-5.48,3.2-9.19,8.84-9.51,5.53-.32,9.17,2.82,9.33,8.06Z","color":"#07399a","x":378,"y":395,"w":18.6,"h":17.9,"cx":387.3,"cy":403.9},{"d":"M435.98,482.29h-22.26c6.35-8.17,5.66-45.96-1.19-53.53,6.28-1.73,12.34-3.4,18.91-5.21.55,2.77.99,4.96,1.55,7.77,3.92-1.87,7.6-3.78,11.4-5.41,16.77-7.2,30.59,1.72,30.6,19.71,0,8.15-.3,16.32.1,24.45.21,4.25,1.64,8.44,2.58,13.22h-19.57c.62-4.81,1.62-9.47,1.79-14.16.3-8.14.2-16.3.07-24.45-.2-11.92-7.3-17.25-18.82-14.09-5.13,1.41-8.5,4.1-8.2,10.45.46,9.42-.27,18.89.15,28.31.2,4.59,1.84,9.12,2.88,12.94Z","color":"#07399a","x":412.5,"y":418.7,"w":65.1,"h":64.6,"cx":445.1,"cy":451},{"d":"M486.07,426.26c8.2-6.64,14.97-12.13,22.52-18.24v16.26h15.68c.04.74.08,1.49.11,2.23-4.75.23-9.51.45-15.44.73,0,3.18-.02,6.29,0,9.39.06,10.28.04,20.57.24,30.85.21,10.5,3.73,13.19,14.21,11.26.76-.14,1.54-.12,3.02-.22-6.69,6.98-14.18,7.97-22.3,5.67-7.78-2.2-9.66-8.48-9.78-15.54-.19-11.35-.3-22.71-.19-34.06.05-4.9-.07-9.2-8.08-8.33Z","color":"#07399a","x":486.1,"y":408,"w":40.3,"h":78.5,"cx":506.2,"cy":447.3},{"d":"M549.15,451.29c-1.72,11.77,2.15,21,10.25,25.31,9.41,5,18.08,1.94,26.63-3.1-3.46,6.55-9.43,9.19-15.73,10.67-14.26,3.33-29.63-3-35.15-13.97-6.03-11.97-3.68-29.5,5.07-37.88,10.5-10.05,27.19-11.78,39.88-3.66,2.91,1.86,5.57,4.88,7.11,7.98,4.69,9.38,1.54,14.44-8.78,14.62-9.82.17-19.64.04-29.27.04ZM546.75,449.15c6.75,0,11.01.18,15.26-.03,10.77-.54,12.45-2.88,10.63-13.63-.79-4.67-2.83-8.21-7.64-9.21-5.01-1.04-9.97.1-12.26,4.82-2.51,5.17-3.71,10.98-5.98,18.05Z","color":"#07399a","x":529.1,"y":420.5,"w":62.8,"h":67,"cx":560.5,"cy":454},{"d":"M630.38,395.97c16.4,0,34.17-.09,51.93.17,1.47.02,3.9,2.34,4.16,3.88.61,3.71.2,7.59-.2,11.87-7.06-15.52-20.76-11.02-32.7-11.38-.99-.03-2.9,2.5-2.94,3.89-.28,9.86-.28,19.73-.12,29.59.02,1.36,1.09,3.45,2.21,3.92,6.38,2.71,20.57-.78,25.88-6.41v17.58c-7.14-10.39-17.02-6.8-25.86-7.16-.72-.03-2.19,2.46-2.22,3.8-.18,8.79-.57,17.63.21,26.35.34,3.82,3.3,7.41,5.12,11.21h-24.09c1.05-6.05,2.88-12.1,3.01-18.18.38-17.79.39-35.61-.14-53.39-.15-5.06-2.64-10.05-4.24-15.74Z","color":"#ea2826","x":630.4,"y":395.9,"w":56.7,"h":87.4,"cx":658.7,"cy":439.6},{"d":"M720.82,483.29h-19.88c.71-6.1,1.93-12.01,2.01-17.95.24-18.87.06-37.74.03-56.61,0-5.33-.41-10.48-6.5-13.9,6.68-1.56,13.36-3.13,20.89-4.89.16,3.02.39,5.28.39,7.54.01,23.16-.21,46.32.11,69.47.07,5.42,1.9,10.82,2.94,16.33Z","color":"#ea2826","x":696.5,"y":389.9,"w":24.3,"h":93.3,"cx":708.7,"cy":436.6},{"d":"M748.74,451.32c-2.88,23.58,11.95,31.93,37.43,21.69-.67,1.4-.88,2.42-1.49,3.02-9.1,9.02-20.16,11.27-32.09,7.98-11.7-3.23-19.37-10.76-20.78-23.45-1.4-12.65.51-24.09,12.12-31.74,13.79-9.08,32.88-6.17,41.26,6.83,2.07,3.21,2.99,8.26,2.06,11.85-.51,1.94-5.99,3.48-9.31,3.64-9.62.48-19.29.17-29.21.17ZM757.34,449.54c14.27-.46,16.46-2.62,14.49-14.18-.79-4.65-2.9-8.08-7.82-9.02-5.06-.96-9.95.08-12.22,4.84-2.16,4.52-3.1,9.69-3.98,14.68-.17.98,2.23,2.96,3.79,3.53,1.7.62,3.81.14,5.74.14Z","color":"#ea2826","x":730.4,"y":419.7,"w":57.8,"h":67.6,"cx":759.3,"cy":453.5},{"d":"M855.25,483.29h-25.66s-7.2-14.99-10.88-24.24c-4.96,8.65-12.28,25.24-12.28,25.24h-11.75c6.68-7.88,13.62-15.88,20.28-24.11.92-1.14,1.27-3.96.51-5.06-6.85-10.02-14.01-19.84-21.15-29.82h20.45s7.17,13.94,11.4,22.13c6.06-8.09,11.51-21.13,11.51-21.13h11.15c-5.8,6.83-11.56,13.41-17.02,20.22-1.1,1.38-2.1,4.45-1.37,5.44,7.66,10.43,13.36,22.46,24.8,31.34Z","color":"#ea2826","x":794.3,"y":425.3,"w":60.9,"h":59,"cx":824.8,"cy":454.8}]};

// ---- easing ----
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);
const easeSoftBack = (t) => 1 + 1.35 * Math.pow(t - 1, 3) + 0.72 * Math.pow(t - 1, 2);
const springPress = (x) => Math.exp(-3.3 * x) * Math.sin(6.4 * x);

// ---- choreography (seconds) — matches the approved reveal timing ----
const WAVE_IN = 0.15, WAVE_DUR = 0.8;               // mattress draws in
const LAND = 1.3;                                    // sleeper lands
const FACE_IN = 0.5;                                 // sleeper starts descending
const STAR_T = [1.48, 1.64, 1.8];                    // sparkles pop, just after landing
const LETTER_IN = 1.9, LETTER_STEP = 0.052, LETTER_DUR = 0.46; // wordmark, letter by letter
const SHINE_IN = 3.2, SHINE_DUR = 0.9;               // one shine sweep
export const EMPREINTE_REVEAL_DURATION = 4.5;

const VBW = EMPREINTE.vb[2];
const VBH = EMPREINTE.vb[3];
const CONTACT_X = 452;  // where the sleeper meets the mattress, in the shared coordinate space
const CONTACT_Y = 300;

// rAF-driven clock — avoids any dependency on a dev/animation-editor runtime.
function useAnimationClock(duration, { loop = false, onComplete, resetKey = 0 } = {}) {
  const [t, setT] = useState(0);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let raf;
    let start = null;
    let fired = false;
    function frame(now) {
      if (start === null) start = now;
      let elapsed = (now - start) / 1000;
      if (elapsed >= duration) {
        if (loop) {
          start = now;
          elapsed = 0;
        } else {
          setT(duration);
          if (!fired) {
            fired = true;
            if (onCompleteRef.current) onCompleteRef.current();
          }
          return;
        }
      }
      setT(elapsed);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [duration, loop, resetKey]);

  return t;
}

const EmpreinteReveal = forwardRef(function EmpreinteReveal(
  { className, style, loop = false, onComplete },
  ref
) {
  const [playKey, setPlayKey] = useState(0);
  const t = useAnimationClock(EMPREINTE_REVEAL_DURATION, { loop, onComplete, resetKey: playKey });

  useImperativeHandle(ref, () => ({
    replay: () => setPlayKey((k) => k + 1),
  }));

  // gentle settle then hold — keeps the frame calm and crisp (no ongoing zoom/motion blur)
  const cam = 0.992 + 0.008 * easeOutCubic(clamp(t / 1.0, 0, 1));

  // 1. mattress (wave) draws in — steady, linear
  const waveProgress = clamp((t - WAVE_IN) / WAVE_DUR, 0, 1);
  const waveWipeWidth = waveProgress * (EMPREINTE.redSwoosh.w + 10);
  const waveVisible = waveProgress > 0 ? 1 : 0;

  // 2. sleeper (face) descends, lands exactly as the wave finishes, then flexes
  const descend = clamp((t - FACE_IN) / (LAND - FACE_IN), 0, 1);
  const descendY = -72 * (1 - easeOutQuint(descend));
  const pressX = Math.max(0, t - LAND);
  const press = springPress(pressX);
  const faceTransform = `translateY(${descendY + 15 * press}px)`;
  const faceOpacity = clamp((t - FACE_IN) / 0.3, 0, 1);
  const mattressSquash = t >= LAND ? 0.1 * Math.exp(-3.3 * pressX) * Math.max(0, Math.sin(6.4 * pressX)) : 0;
  const mattressTransform = `translateY(${6 * Math.max(0, press)}px) scaleY(${1 - mattressSquash})`;

  // soft settle glow pulse at the landing moment
  const glowProgress = clamp((t - (LAND - 0.02)) / 0.8, 0, 1);
  const glowOpacity = t >= LAND - 0.02 ? 0.32 * Math.sin(clamp(glowProgress, 0, 1) * Math.PI) : 0;

  // depth shadow settles in as the mark assembles
  const shadowProgress = clamp((t - 1.6) / 1.1, 0, 1);

  // 5. one elegant shine sweep, masked to the whole logo
  const shineActive = t >= SHINE_IN && t <= SHINE_IN + SHINE_DUR + 0.1;
  const shineX = -300 + clamp((t - SHINE_IN) / SHINE_DUR, 0, 1) * 1280;

  const allPaths = [EMPREINTE.blueSwoosh, EMPREINTE.redSwoosh, ...EMPREINTE.stars, ...EMPREINTE.letters];

  return (
    <div className={className} style={{ position: "relative", width: "100%", height: "100%", ...style }}>
      <svg
        viewBox={`0 0 ${VBW} ${VBH}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Empreinte Flex"
        style={{ overflow: "visible", display: "block" }}
      >
        <defs>
          <clipPath id="empreinte-wave-wipe">
            <rect x={EMPREINTE.redSwoosh.x - 5} y={250} width={waveWipeWidth} height={130} />
          </clipPath>
          <clipPath id="empreinte-logo-clip">
            {allPaths.map((p, i) => (
              <path key={"clip" + i} d={p.d} />
            ))}
          </clipPath>
          <linearGradient id="empreinte-shine-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.7" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="empreinte-contact-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#96afeb" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#96afeb" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g style={{ transform: `scale(${cam})`, transformOrigin: `${VBW / 2}px ${VBH / 2}px` }}>
          {/* soft contact glow — grounds the mark at the landing point */}
          <ellipse
            cx={CONTACT_X}
            cy={CONTACT_Y}
            rx={110}
            ry={62}
            fill="url(#empreinte-contact-glow)"
            opacity={glowOpacity}
          />

          <g style={{ filter: `drop-shadow(0 10px 20px rgba(7,57,154,${0.1 * shadowProgress}))` }}>
            {/* mattress (wave) — draws in, then a soft memory-foam squash on landing */}
            <g style={{ transform: mattressTransform, transformBox: "fill-box", transformOrigin: "50% 100%" }}>
              <path
                d={EMPREINTE.redSwoosh.d}
                fill={EMPREINTE.redSwoosh.color}
                opacity={waveVisible}
                clipPath="url(#empreinte-wave-wipe)"
              />
            </g>

            {/* sleeper (face) — descends and lands */}
            <g style={{ opacity: faceOpacity, transform: faceTransform }}>
              <path d={EMPREINTE.blueSwoosh.d} fill={EMPREINTE.blueSwoosh.color} />
            </g>

            {/* sparkles (stras) — staggered pops + gentle lingering shimmer */}
            {EMPREINTE.stars.map((star, i) => {
              const s0 = STAR_T[i];
              const p = clamp((t - s0) / 0.46, 0, 1);
              const twinkle = t > s0 + 0.46 ? 1 + 0.045 * Math.sin((t - s0) * 3 + i * 1.7) : 1;
              return (
                <path
                  key={"star" + i}
                  d={star.d}
                  fill={star.color}
                  style={{
                    opacity: clamp((t - s0) / 0.22, 0, 1),
                    transform: `scale(${easeSoftBack(p) * twinkle})`,
                    transformBox: "fill-box",
                    transformOrigin: "center",
                  }}
                />
              );
            })}

            {/* wordmark (texture) — crisp per-letter rise, even cadence */}
            {EMPREINTE.letters.map((letter, i) => {
              const s0 = LETTER_IN + i * LETTER_STEP;
              const p = clamp((t - s0) / LETTER_DUR, 0, 1);
              const e = easeOutQuint(p);
              return (
                <path
                  key={"letter" + i}
                  d={letter.d}
                  fill={letter.color}
                  style={{
                    opacity: clamp((t - s0) / 0.22, 0, 1),
                    transform: `translateY(${(1 - e) * 22}px)`,
                    transformBox: "fill-box",
                    transformOrigin: "center",
                  }}
                />
              );
            })}

            {/* shine — one elegant sweep across the finished mark */}
            {shineActive && (
              <g clipPath="url(#empreinte-logo-clip)">
                <rect
                  x={shineX}
                  y={-60}
                  width={150}
                  height={640}
                  fill="url(#empreinte-shine-grad)"
                  transform={`rotate(12 ${shineX + 75} 245)`}
                />
              </g>
            )}
          </g>
        </g>
      </svg>
    </div>
  );
});

export default EmpreinteReveal;
