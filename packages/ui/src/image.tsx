import React from "react";

interface ImageProps {
  src: string;
  alt: string;
  noMaxWidth?: boolean;
}

export function Image({ src, alt, noMaxWidth = false }: ImageProps) {
  const imgStyle = noMaxWidth ? undefined : { maxWidth: "100%", height: "auto" };
  return (
    <figure className={noMaxWidth ? "no-max-width" : undefined}>
      <img src={src} alt={alt} style={imgStyle} />
    </figure>
  );
}
