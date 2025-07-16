import React, { useState, useEffect } from "react";

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: (error: string) => void;
}

export default function SafeImage({
  src,
  alt,
  className = "",
  fallbackSrc = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=center&auto=format&q=80",
  onError,
}: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

  // Reset when src changes
  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setRetryCount(0);
  }, [src]);

  const handleError = () => {
    const errorMessage = `Image failed to load: ${currentSrc}`;
    console.warn(errorMessage);

    if (onError) {
      onError(errorMessage);
    }

    // If the URL contains business-images path, likely these images don't exist
    // Skip retries and go straight to fallback
    if (currentSrc.includes("/business-images/")) {
      console.log(
        `❌ Business image not found, using fallback immediately: ${fallbackSrc}`,
      );
      setHasError(true);
      setCurrentSrc(fallbackSrc);
      return;
    }

    if (retryCount < maxRetries && !hasError) {
      // Try with cache-busting parameter for other types of images
      const separator = currentSrc.includes("?") ? "&" : "?";
      const retrySrc = `${currentSrc}${separator}retry=${Date.now()}`;

      console.log(
        `🔄 Retrying image load (attempt ${retryCount + 1}): ${retrySrc}`,
      );
      setCurrentSrc(retrySrc);
      setRetryCount(retryCount + 1);
    } else {
      // Use fallback
      console.log(`❌ Image retry failed, using fallback: ${fallbackSrc}`);
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
  };

  const handleLoad = () => {
    if (retryCount > 0) {
      console.log(`✅ Image loaded successfully after ${retryCount} retries`);
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
    />
  );
}
