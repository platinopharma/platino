import { forwardRef, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type NativeImg = ImgHTMLAttributes<HTMLImageElement>;

export interface OptimizedImageProps extends Omit<NativeImg, "loading" | "decoding" | "fetchPriority"> {
  /** Intrinsic width in px — REQUIRED to prevent CLS. */
  width: number;
  /** Intrinsic height in px — REQUIRED to prevent CLS. */
  height: number;
  /** Mark as LCP / above-the-fold image. Disables lazy loading and sets fetchpriority=high. */
  priority?: boolean;
  /**
   * Responsive candidates. Provide multiple widths and the browser
   * picks the best fit for the viewport + DPR.
   * Example: [{ src: "/hero-480.webp", width: 480 }, { src: "/hero-960.webp", width: 960 }]
   */
  srcSetSources?: Array<{ src: string; width: number }>;
  /** sizes attribute for responsive images. Defaults to 100vw. */
  sizes?: string;
}

/**
 * Responsive, CLS-safe <img> wrapper.
 *
 * - Requires `width` + `height` so the browser reserves layout space.
 * - Non-priority images are lazy-loaded with async decoding.
 * - Priority (LCP) images preload eagerly with fetchpriority="high".
 * - Optional `srcSetSources` builds a proper `srcSet` + `sizes` pair.
 *
 * Use for every raster image on the site. Prefer AVIF/WebP source variants.
 */
export const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  function OptimizedImage(
    { src, alt, width, height, priority = false, srcSetSources, sizes, className, ...rest },
    ref,
  ) {
    const srcSet = srcSetSources?.length
      ? srcSetSources.map((s) => `${s.src} ${s.width}w`).join(", ")
      : undefined;

    return (
      <img
        ref={ref}
        src={src}
        srcSet={srcSet}
        sizes={srcSet ? (sizes ?? "100vw") : undefined}
        alt={alt ?? ""}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        className={cn("h-auto max-w-full", className)}
        {...rest}
      />
    );
  },
);