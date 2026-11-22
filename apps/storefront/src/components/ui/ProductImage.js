"use client";

import { useState } from "react";
import Image from "next/image";
import { FiImage } from "react-icons/fi";

export default function ProductImage({ src, onError, unoptimized, ...props }) {
  const [failedSource, setFailedSource] = useState(null);

  if (!src || failedSource === src) {
    return (
      <span aria-hidden="true" className="absolute inset-0 grid place-items-center bg-slate-100 text-slate-500">
        <FiImage className="size-7" />
      </span>
    );
  }

  // Database media is served by the public /v1 proxy, outside Next's optimizer.
  const apiMedia = typeof src === "string" && src.startsWith("/v1/media/");
  return (
    <Image
      {...props}
      src={src}
      unoptimized={unoptimized || apiMedia}
      onError={(event) => {
        setFailedSource(src);
        onError?.(event);
      }}
    />
  );
}
