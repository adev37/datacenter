// apps/web/src/components/ImgWithFallback.jsx
import React, { useState } from "react";

/**
 * <ImgWithFallback src="..." fallback={<div>...</div>} className="..." />
 */
export default function ImgWithFallback({ src, alt, className, fallback }) {
  const [ok, setOk] = useState(Boolean(src));
  if (!ok) return fallback || null;
  return (
    <img
      src={src}
      alt={alt || ""}
      className={className}
      onError={() => setOk(false)}
    />
  );
}
