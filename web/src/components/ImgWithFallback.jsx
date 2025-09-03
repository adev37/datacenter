// src/components/ImgWithFallback.jsx
import React from "react";

export default function ImgWithFallback({ src, alt, className, fallback }) {
  const [err, setErr] = React.useState(false);
  if (!src || err) return fallback;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setErr(true)}
    />
  );
}
